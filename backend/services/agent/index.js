import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import router from "./routes/agent.route.js";
dotenv.config();

const formatUrl = (url, defaultPort) => {
  if (!url) return url;
  
  // If it's already a full HTTP/HTTPS URL, preserve it
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  
  // If it's just a hostname/slug, construct the internal HTTP address
  if (!url.includes(":")) {
    return `http://${url}:${defaultPort}`;
  }
  return `http://${url}`;
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
