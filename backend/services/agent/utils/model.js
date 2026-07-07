import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatOpenRouter } from "@langchain/openrouter";
import dotenv from "dotenv";
dotenv.config();

export const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY
});

let groqInstance;
const getGroq = () => {
  if (!process.env.GROQ_API_KEY) {
    console.warn("GROQ_API_KEY is missing. Falling back to Gemini.");
    return gemini;
  }
  if (!groqInstance) {
    groqInstance = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      maxTokens: undefined,
      maxRetries: 2,
      apiKey: process.env.GROQ_API_KEY
    });
  }
  return groqInstance;
};

let openRouterInstance;
const getOpenRouter = () => {
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn("OPENROUTER_API_KEY is missing. Falling back to Gemini.");
    return gemini;
  }
  if (!openRouterInstance) {
    openRouterInstance = new ChatOpenRouter({
      model: "deepseek/deepseek-chat",
      temperature: 0,
      maxTokens: 2500,
      apiKey: process.env.OPENROUTER_API_KEY
    });
  }
  return openRouterInstance;
};

export const getModel = (agent) => {
  switch (agent) {
    case "coding":
      return gemini;
    case "image":
      return getGroq();
    case "search":
      return getGroq();
    case "chat":
      return getGroq();
    case "vision":
      return gemini;
    default:
      return getGroq();
  }
};