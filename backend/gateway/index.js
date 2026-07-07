import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { customProxy, isOriginAllowed } from "./utils/proxyWithHeaders.js";
import { protect } from "./middlewares/auth.middleware.js";
import { getCurrentUser } from "./controllers/user.controller.js";

dotenv.config();

const formatUrl = (url, defaultPort) => {
  if (!url) return url;
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    let cleanUrl = url.replace(/^https?:\/\//, "");
    if (!cleanUrl.includes(":")) {
      cleanUrl = `${cleanUrl}:${defaultPort}`;
    }
    return `http://${cleanUrl}`;
  }
  let slug = url.replace(/^https?:\/\//, "").split(":")[0].replace(/\.onrender\.com\/?$/, "");
  return `https://${slug}.onrender.com`;
};
if (process.env.AUTH_SERVICE) process.env.AUTH_SERVICE = formatUrl(process.env.AUTH_SERVICE, 8001);
if (process.env.CHAT_SERVICE) process.env.CHAT_SERVICE = formatUrl(process.env.CHAT_SERVICE, 8002);
if (process.env.AGENT_SERVICE) process.env.AGENT_SERVICE = formatUrl(process.env.AGENT_SERVICE, 8003);
if (process.env.BILLING_SERVICE) process.env.BILLING_SERVICE = formatUrl(process.env.BILLING_SERVICE, 8004);

const app = express();
const port = process.env.PORT || 5000;

// Global CORS & OPTIONS Preflight Interceptor
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-user-id, x-user-email, x-user-avatar");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use("/uploads", express.static("uploads"));
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

// Routes routed through customProxy to enforce CORS headers on proxied requests
app.use("/api/auth", customProxy(process.env.AUTH_SERVICE));
app.use("/api/me", protect, getCurrentUser);
app.use("/api/chat", protect, customProxy(process.env.CHAT_SERVICE));
app.use("/api/agent", protect, customProxy(process.env.AGENT_SERVICE));
app.use("/api/billing", protect, customProxy(process.env.BILLING_SERVICE));

app.get("/debug", (req, res) => {
  res.status(200).json({
    service: "gateway",
    status: "ok",
    env: {
      PORT: process.env.PORT,
      CLIENT_URL: process.env.CLIENT_URL,
      AUTH_SERVICE: process.env.AUTH_SERVICE,
      CHAT_SERVICE: process.env.CHAT_SERVICE,
      AGENT_SERVICE: process.env.AGENT_SERVICE,
      BILLING_SERVICE: process.env.BILLING_SERVICE,
    }
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    service: "gateway",
    status: "ok"
  });
});

app.listen(port, () => {
  console.log(`Gateway running on ${port}`);
});
