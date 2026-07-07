import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis(process.env.REDIS_URL, {
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1
});

redis.on("connect", () => {
  console.log("✅ Redis Connected");
});

redis.on("error", (error) => {
  console.error("❌ Redis Error:", error.message);
});




export default redis;