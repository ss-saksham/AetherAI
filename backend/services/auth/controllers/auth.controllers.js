import crypto from "crypto";
import { getAuth } from "firebase-admin/auth";
import User from "../models/user.model.js";
import redis from "../../../shared/redis/redis.js";
import { app } from "../config/firebase.js";

const SECRET = process.env.SESSION_SECRET || "aether-default-secret-key-32-chars-long!!!";

// Sign a string payload using HMAC-SHA256
const signToken = (payload) => {
  const serialized = JSON.stringify(payload);
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(serialized);
  const signature = hmac.digest("base64url");
  
  return Buffer.from(serialized).toString("base64url") + "." + signature;
};

export const login = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = await getAuth(app).verifyIdToken(token);

    console.log(decoded);

    let user = await User.findOne({
      firebaseUid: decoded.uid,
    });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.picture,
        provider: decoded.firebase?.sign_in_provider,
      });
    }

    const sessionData = {
      userId: user._id,
      email: user.email,
      avatar: user.avatar,
      name: user.name,
      plan: user.plan,
      credits: user.credits,
      totalCredits: user.totalCredits
    };

    // Sign the session data directly into the cookie value as a zero-dependency fallback
    const sessionCookieValue = signToken(sessionData);

    // Save session in Redis if it is active (ignore errors if offline)
    try {
      await redis.set(
        `user-session:${user._id}`,
        sessionCookieValue,
        "EX",
        60 * 60 * 24 * 7
      );

      await redis.set(
        `session:${sessionCookieValue}`,
        JSON.stringify(sessionData),
        "EX",
        60 * 60 * 24 * 7
      );
    } catch (redisError) {
      console.warn("⚠️ Redis session caching failed:", redisError.message);
    }

    const isProduction = process.env.NODE_ENV === "production" || (req.headers.host && req.headers.host.includes("onrender.com"));

    res.cookie(
      "session",
      sessionCookieValue,
      {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      }
    );

    return res.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("❌ Login Verification Failed:", error);
    return res.status(401).json({
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const sessionId = req.cookies?.session;

    if (sessionId) {
      try {
        await redis.del(`session:${sessionId}`);
      } catch (redisError) {
        console.warn("⚠️ Redis session deletion failed:", redisError.message);
      }
    }

    const isProduction = process.env.NODE_ENV === "production" || (req.headers.host && req.headers.host.includes("onrender.com"));

    res.clearCookie(
      "session",
      {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax"
      }
    );

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { userId, plan, credits } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.plan = plan;
    user.credits += credits;
    user.totalCredits += credits;
    user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    let sessionId;
    try {
      sessionId = await redis.get(`user-session:${user._id}`);
    } catch (redisError) {
      console.warn("⚠️ Redis user-session lookup failed:", redisError.message);
    }

    if (sessionId) {
      try {
        await redis.set(
          `session:${sessionId}`,
          JSON.stringify({
            userId: user._id,
            email: user.email,
            avatar: user.avatar,
            name: user.name,
            plan: user.plan,
            credits: user.credits,
            totalCredits: user.totalCredits
          }),
          "EX",
          60 * 60 * 24 * 7
        );
      } catch (redisError) {
        console.warn("⚠️ Redis session update failed:", redisError.message);
      }
    }

    return res.json({
      success: true
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deductCredits = async (req, res) => {
  try {
    const { userId, agent } = req.body;
    const COST = {
      chat: 1,
      search: 5,
      coding: 10,
      pdf: 10,
      ppt: 10,
      image: 10
    };

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const requiredCredits = COST[agent] || 1;

    if (user.credits < requiredCredits) {
      return res.status(400).json({
        success: false,
        message: "Not enough credits."
      });
    }

    user.credits -= requiredCredits;
    await user.save();

    let sessionId;
    try {
      sessionId = await redis.get(`user-session:${user._id}`);
    } catch (redisError) {
      console.warn("⚠️ Redis user-session lookup failed:", redisError.message);
    }

    if (sessionId) {
      try {
        await redis.set(
          `session:${sessionId}`,
          JSON.stringify({
            userId: user._id,
            email: user.email,
            avatar: user.avatar,
            name: user.name,
            plan: user.plan,
            credits: user.credits,
            totalCredits: user.totalCredits
          }),
          "EX",
          60 * 60 * 24 * 7
        );
      } catch (redisError) {
        console.warn("⚠️ Redis session update failed:", redisError.message);
      }
    }

    return res.json({
      success: true,
      credits: user.credits
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};