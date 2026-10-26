import { GoogleGenAI } from "@google/genai";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
}

export function getGeminiModel() {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}
