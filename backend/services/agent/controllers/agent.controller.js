import redis from "../../../shared/redis/redis.js";
import { graph } from "../graph/supervisor.graph.js";
import { addMessage } from "../utils/memory.js";
import axios from "axios"

export const chat = async (req, res, next) => {
  let keepAliveInterval;
  try {
    const {
      prompt,
      conversationId,
      agent,
      model
    } = req.body;

    console.log(req.body);
    console.log(req.file);

    await addMessage(
      conversationId,
      "user",
      prompt
    );

    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "user",
      content: prompt
    });

    // Write headers and start keep-alive heartbeats to satisfy Render's 30s timeout
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Transfer-Encoding": "chunked"
    });

    keepAliveInterval = setInterval(() => {
      res.write(" "); // Send space byte to keep connection active
    }, 12000); // 12 seconds interval (well under Render's 30s threshold)

    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const gatewayUrl = `${protocol}://${host}`;

    const result = await graph.invoke({
      prompt,
      conversationId,
      userId: req.headers["x-user-id"],
      agent,
      model,
      file: req.file,
      gatewayUrl
    });

    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
    }

    console.log("after res", result);

    await addMessage(
      conversationId,
      "assistant",
      result.response
    );

    await axios.post(
      `${process.env.CHAT_SERVICE}/save-message`,
      {
        conversationId,
        role: "assistant",
        content: result.response,
        images: result.images,
        artifacts: result.artifacts || []
      }
    );

    // Send final JSON package
    res.write(JSON.stringify({
      success: true,
      answer: result.response,
      images: result.images,
      artifacts: result.artifacts || []
    }));

    res.end();

  } catch (error) {
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
    }
    next(error);
  }
};