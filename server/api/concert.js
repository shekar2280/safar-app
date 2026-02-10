import axios from "axios";
import "dotenv/config";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { artistName } = req.query;

  if (!artistName) {
    return res.status(400).json({ error: "Artist name is required" });
  }

  try {
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${process.env.TICKETMASTER_API_KEY}&keyword=${encodeURIComponent(artistName)}&classificationName=music`;

    const response = await axios.get(url);
    const data = response.data;

    res.status(200).json(data._embedded?.events || []);
  } catch (error) {
    console.error("Ticketmaster Error:", error.message);
    res.status(500).json({ error: "Failed to fetch concerts" });
  }
}