import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import "dotenv/config";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { trendingPlacesPrompt } = req.body;

  if (!trendingPlacesPrompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      prompt: trendingPlacesPrompt,
    });

    return res.status(200).json({
      trendingPlaces: text,
    });
  } catch (error) {
    console.error("Global Handler Error:", error);
    res.status(500).json({
      error: "Failed to fetch trending places.",
      details: error.message,
    });
  }
}
