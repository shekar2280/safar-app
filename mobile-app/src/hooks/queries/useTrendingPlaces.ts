import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiPost, JWT_KEY } from "@/src/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { TrendingPlace } from "@/src/constants";

export const trendingQueryKeys = {
  all: ["trendingPlaces", "v3"] as const,
  byCountry: (country: string) => [...trendingQueryKeys.all, country] as const,
};



async function fetchTrendingPlaces(country: string): Promise<TrendingPlace[]> {
  const jwt = await AsyncStorage.getItem(JWT_KEY);
  if (!jwt) return [];

  const prompt = `You are a strict local travel guide. 
Suggest exactly 20 top travel destinations that are LOCATED INSIDE ${country}. 
CRITICAL RULE: EVERY single destination must be a city, town, or region strictly within the borders of ${country}. 
DO NOT include any international destinations. DO NOT include places from other countries.
CRITICAL RULE 2: You MUST include a mix of the country's most iconic, world-famous major cities (e.g., New York, Miami, Tokyo, Paris, etc.) AND highly trending seasonal destinations.
Include a variety: iconic major cities, coastal, hill stations, heritage sites, nature, and adventure.
For each destination return a JSON object with these exact fields:
- name: city/place name
- country: always "${country}"
- desc: why this place is trending now (20 words max)
- insight: a compelling reason to visit (30 words max)
- recommended_month: best month(s) to visit
- famous_landmark: one iconic landmark or attraction
Return ONLY a raw JSON array of 20 objects. No markdown, no extra text.`;

  const res = await apiPost<{ trendingPlaces: any[] }>(
    "/api/v1/discovery/trending",
    {
      trendingPlacesPrompt: prompt,
      country,
    },
  );

  return (res.trendingPlaces ?? []).map((p: any, idx: number) => ({
    ...p,
    id: idx + 1,
  }));
}

export function useTrendingPlaces(country: string = "India") {
  const query = useQuery({
    queryKey: trendingQueryKeys.byCountry(country),
    queryFn: () => fetchTrendingPlaces(country),
    staleTime: 7 * 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    enabled: !!country,
  });

  useEffect(() => {
    if (query.data && query.data.length > 0) {
      query.data.forEach((place) => {
        if (place.image) {
          Image.prefetch(place.image);
        }
      });
    }
  }, [query.data]);

  return query;
}
