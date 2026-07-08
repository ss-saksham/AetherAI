import redis from "../../shared/redis/redis.js";
import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "aether-default-secret-key-32-chars-long!!!";

// Verify and decode HMAC-SHA256 signed token
const verifyToken = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [encodedPayload, signature] = parts;
    const serialized = Buffer.from(encodedPayload, "base64url").toString("utf8");

    const hmac = crypto.createHmac("sha256", SECRET);
    hmac.update(serialized);
    const expectedSignature = hmac.digest("base64url");

    if (signature === expectedSignature) {
      return JSON.parse(serialized);
    }
  } catch (e) {
    // Ignore error
  }
  return null;
};

export const protect = async (req, res, next) => {
  try {
    const sessionId = req?.cookies?.session;

    if (!sessionId) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    let session = null;

    // 1. Try to decode the signed cookie directly using cryptography (zero-dependency fallback)
    const decoded = verifyToken(sessionId);
    if (decoded) {
      session = JSON.stringify(decoded);
    } else {
      // 2. Fall back to Redis lookup (for backward compatibility / old UUID session cookies)
      try {
        session = await redis.get(`session:${sessionId}`);
      } catch (redisError) {
        console.warn("⚠️ Redis get failed. Session lookup bypassed:", redisError.message);
      }
    }

    if (!session) {
      return res.status(401).json({
        message: "Session Expired"
      });
    }

    req.user = JSON.parse(session);
    next();
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};