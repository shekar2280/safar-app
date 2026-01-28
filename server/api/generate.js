import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import axios from 'axios';
import 'dotenv/config';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { itineraryPrompt, locationName } = req.body;

  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      prompt: itineraryPrompt,
    });

    let imageUrl = "fallback_image_url";
    const unsplashRes = await axios.get(`https://api.unsplash.com/search/photos`, {
      params: { query: locationName, per_page: 1 },
      headers: { Authorization: `Client-ID ${process.env.UNSPLASH_API_KEY}` }
    });
    imageUrl = unsplashRes.data.results[0]?.urls?.regular || imageUrl;

    res.status(200).json({ itinerary: text, imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}