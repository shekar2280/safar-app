import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import axios from "axios";
import fetch from "node-fetch";
import "dotenv/config";

async function generateWithGroq(prompt) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-70b-versatile",
      messages: [
        { role: "system", content: "Return ONLY valid JSON. No markdown." },
        { role: "user", content: prompt },
      ],
      max_tokens: 2048,
      temperature: 0.4,
    }),
  });

  if (!res.ok) throw new Error("Groq failed");
  const data = await res.json();
  return data.choices[0].message.content;
}

async function generateWithGemini(model, prompt) {
  const { text } = await generateText({
    model: google(model),
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    prompt,
  });
  return text;
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).send("Method Not Allowed");

  const { itineraryPrompt, locationName } = req.body;

  try {
    let itinerary;

    try {
      itinerary = await generateWithGroq(itineraryPrompt);
    } catch {
      try {
        itinerary = await generateWithGemini(
          "gemini-2.5-flash-lite",
          itineraryPrompt
        );
      } catch {
        itinerary = await generateWithGemini(
          "gemini-2.5-flash",
          itineraryPrompt
        );
      }
    }

    let imageUrl = "fallback_image_url";
    const unsplashRes = await axios.get(
      "https://api.unsplash.com/search/photos",
      {
        params: { query: locationName, per_page: 1 },
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_API_KEY}`,
        },
      }
    );

    imageUrl = unsplashRes.data.results[0]?.urls?.regular || imageUrl;

    res.status(200).json({ itinerary, imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
