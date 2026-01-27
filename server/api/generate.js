import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import axios from "axios";
import "dotenv/config";

function assertJson(text) {
  const t = text.trim();
  if (!t.startsWith("{") || !t.endsWith("}")) {
    throw new Error("Model returned non-JSON output");
  }
}

async function generateWithGeminiModel(model, prompt) {
  const { text } = await generateText({
    model: google(model),
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    system: "You must respond with ONLY valid minified JSON. No text outside JSON.",
    prompt,
  });
  assertJson(text);
  return text;
}

async function generateWithGeminiFallback(prompt) {
  const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
  let lastError;

  for (const model of models) {
    try {
      return await generateWithGeminiModel(model, prompt);
    } catch (err) {
      console.warn(`Model ${model} failed: ${err.message}`);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini models failed");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { itineraryPrompt, locationName } = req.body;

  try {
    const itinerary = await generateWithGeminiFallback(itineraryPrompt);

    let imageUrl = "fallback_image_url";
    const unsplashRes = await axios.get(
      "https://api.unsplash.com/search/photos",
      {
        params: { query: locationName, per_page: 1 },
        headers: { Authorization: `Client-ID ${process.env.UNSPLASH_API_KEY}` },
      },
    );

    imageUrl = unsplashRes.data.results[0]?.urls?.regular || imageUrl;

    res.status(200).json({ itinerary, imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
