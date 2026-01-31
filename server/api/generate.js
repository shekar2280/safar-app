import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import axios from "axios";
import "dotenv/config";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { itineraryPrompt, locationName } = req.body;

  if (!itineraryPrompt || !locationName) {
    return res.status(400).json({ error: "Missing prompt or location name" });
  }

  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      prompt: itineraryPrompt,
    });

    let imageUrl = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1080&h=720&q=80";

    try {
      const unsplashRes = await axios.get(
        `https://api.unsplash.com/search/photos`,
        {
          params: {
            query: locationName,
            per_page: 1,
            orientation: "landscape",
          },
          headers: {
            Authorization: `Client-ID ${process.env.UNSPLASH_API_KEY}`,
          },
        },
      );

      const rawUrl = unsplashRes.data.results[0]?.urls?.raw;
      if (rawUrl) {
        imageUrl = `${rawUrl}&auto=format&fit=crop&w=1080&h=720&q=80`;
      }
    } catch (imgError) {
      console.error(imgError.message);
    }

    res.status(200).json({ itinerary: text, imageUrl: imageUrl });
  } catch (error) {
    res.status(500).json({
      error: "Failed to generate trip.",
      details: error.message,
    });
  }
}