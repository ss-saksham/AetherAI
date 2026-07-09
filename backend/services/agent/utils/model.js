import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatOpenRouter } from "@langchain/openrouter";
import dotenv from "dotenv";
dotenv.config();

const gemini25 = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  maxRetries: 0, // Fail fast on invalid key/rate errors to trigger fallback immediately
  apiKey: process.env.GOOGLE_API_KEY
});

const groqModel = process.env.GROQ_API_KEY ? new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  maxRetries: 2,
  apiKey: process.env.GROQ_API_KEY
}) : null;

// Construct fail-safe fallback chain
export const gemini = groqModel 
  ? gemini25.withFallbacks([groqModel]) 
  : gemini25;

const getGroq = () => {
  return groqModel ? groqModel.withFallbacks([gemini25]) : gemini25;
};

let openRouterInstance;
const getOpenRouter = () => {
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn("OPENROUTER_API_KEY is missing. Falling back to Gemini.");
    return gemini;
  }
  if (!openRouterInstance) {
    const primaryOpenRouter = new ChatOpenRouter({
      model: "deepseek/deepseek-chat",
      temperature: 0,
      maxTokens: 2500,
      apiKey: process.env.OPENROUTER_API_KEY
    });
    openRouterInstance = primaryOpenRouter.withFallbacks([gemini]);
  }
  return openRouterInstance;
};

export const getModel = (agent, preferredModel) => {
  if (preferredModel === "gemini") {
    return gemini;
  }
  if (preferredModel === "groq") {
    return getGroq();
  }

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