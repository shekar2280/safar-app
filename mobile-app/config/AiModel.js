import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY,
});

export const generateTripPlan = async (prompt) => {
  const model = "gemini-2.5-flash";
  const contents = [{ role: "user", parts: [{ text: prompt }] }];

  const response = await ai.models.generateContent({ model, contents });
  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("No response content found from AI.");
  return text;
};

