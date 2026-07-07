import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import router from "./routes/agent.route.js";
dotenv.config();

const formatUrl = (url, defaultPort) => {
  if (!url) return url;
  const cleanUrl = url.replace(/^https?:\/\//, "");
  const hostname = cleanUrl.split(":")[0];
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1") || !hostname.includes(".")) {
    if (!cleanUrl.includes(":")) {
      return `http://${cleanUrl}:${defaultPort}`;
    }
    return `http://${cleanUrl}`;
  }
  const slug = hostname.replace(/\.onrender\.com\/?$/, "");
  return `https://${slug}.onrender.com`;
};
if (process.env.AUTH_SERVICE) process.env.AUTH_SERVICE = formatUrl(process.env.AUTH_SERVICE, 8001);
if (process.env.CHAT_SERVICE) process.env.CHAT_SERVICE = formatUrl(process.env.CHAT_SERVICE, 8002);

const app = express();
app.use(express.json());
const port=process.env.PORT

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
