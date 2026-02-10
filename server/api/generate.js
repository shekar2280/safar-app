import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import axios from "axios";
import "dotenv/config";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { itineraryPrompt, locationName, tripCategory } = req.body;

  if (!itineraryPrompt || !locationName) {
    return res.status(400).json({ error: "Missing prompt or location name" });
  }

  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      prompt: itineraryPrompt,
    });

    let imageUrls = [
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1080&q=80",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1080&q=80",
      "https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1080&q=80",
    ];

    if (tripCategory !== "CONCERT") {
      try {
        const unsplashRes = await axios.get(
          `https://api.unsplash.com/search/photos`,
          {
            params: {
              query: locationName,
              per_page: 3,
              orientation: "landscape",
              order_by: "relevant",
            },
            headers: {
              Authorization: `Client-ID ${process.env.UNSPLASH_API_KEY}`,
            },
            timeout: 4000,
          },
        );

        const results = unsplashRes.data.results;

        if (results && results.length > 0) {
          imageUrls = results.map(
            (img) => `${img.urls.raw}&auto=format&fit=crop&w=1080&h=720&q=80`,
          );
        }
      } catch (imgError) {
        console.error(imgError.message);
      }
    }

    return res.status(200).json({
      itinerary: text,
      imageUrls: imageUrls,
    });
  } catch (error) {
    console.error("Global Handler Error:", error);
    res.status(500).json({
      error: "Failed to generate trip.",
      details: error.message,
    });
  }
}
