import redis from "../../../shared/redis/redis.js";
import { getConversationHistory } from "./getConv.js";

export const getMemory = async (conversationId) => {
  const key = `conversation:${conversationId}`;
  
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn(`[Redis warning] cache get failed: ${error.message}`);
  }

  const messages = await getConversationHistory(conversationId);

  try {
    await redis.set(
      key,
      JSON.stringify(messages),
      "EX",
      86400
    );
  } catch (error) {
    console.warn(`[Redis warning] cache set failed: ${error.message}`);
  }

  return messages;
};

export const addMessage = async (conversationId, role, content) => {
  const key = `conversation:${conversationId}`;
  let messages = [];

  try {
    const existing = await redis.get(key);
    messages = existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.warn(`[Redis warning] addMessage read failed, defaulting to empty stack: ${error.message}`);
  }

  messages.push({ role, content });

  if (messages.length > 20) {
    messages.shift();
  }

  try {
    await redis.set(
      key,
      JSON.stringify(messages),
      "EX",
      86400
    );
  } catch (error) {
    console.warn(`[Redis warning] addMessage save failed: ${error.message}`);
  }
};