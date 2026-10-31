import { GoogleGenAI, type GenerateContentParameters } from "@google/genai";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
}

export function getGeminiModel() {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

export async function generateGeminiContent(
  parameters: Omit<GenerateContentParameters, "model">,
) {
  const client = getGeminiClient();
  if (!client) throw new Error("GEMINI_API_KEY is not configured.");

  const primaryModel = getGeminiModel();
  const backupModel = process.env.GEMINI_MODEL_BACKUP?.trim();
  const models = [...new Set([primaryModel, backupModel].filter((model): model is string => Boolean(model)))];
  let lastError: unknown;

  for (const model of models) {
    try {
      const response = await client.models.generateContent({ ...parameters, model });
      if (!response.text?.trim()) throw new Error("Gemini returned an empty response.");
      return response;
    } catch (error) {
      lastError = error;
      console.warn(`Gemini model "${model}" failed; trying the next configured model.`);
    }
  }

  throw new Error("All configured Gemini models failed.", { cause: lastError });
}
