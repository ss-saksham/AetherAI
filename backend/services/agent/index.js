import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import router from "./routes/agent.route.js";
dotenv.config();

const formatUrl = (url, defaultPort) => {
  if (!url) return url;
  const cleanUrl = url.replace(/^https?:\/\//, "");
  const hostname = cleanUrl.split(":")[0];
  
  // If it's a local development address, keep it as local http
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    if (!cleanUrl.includes(":")) {
      return `http://${cleanUrl}:${defaultPort}`;
    }
    return `http://${cleanUrl}`;
  }
  
  // Map Render service slugs to their public HTTPS URLs to bypass internal region DNS failures
  const slug = hostname.replace(/\.onrender\.com\/?$/, "");
  return `https://${slug}.onrender.com`;
};
if (process.env.AUTH_SERVICE) process.env.AUTH_SERVICE = formatUrl(process.env.AUTH_SERVICE, 8001);
if (process.env.CHAT_SERVICE) process.env.CHAT_SERVICE = formatUrl(process.env.CHAT_SERVICE, 8002);

const app = express();
app.use(express.json());
app.use("/uploads", express.static("uploads"));
const port=process.env.PORT

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    service: "agent",
    status: "ok"
  });
});

app.use("/",router);

app.use((err, req, res, next) => {

  console.error(err);

  if (err.status) {

    return res
      .status(err.status)
      .json(err.data);

  }

  return res
    .status(500)
    .json({

      success: false,

      message: err.message || "Internal Server Error"

    });

});

app.listen(port, () => {
    connectDB()
  console.log(
    `agent service running on ${port}`
  );
});
