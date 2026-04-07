import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiPost, JWT_KEY } from "@/src/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";

// ─── Query Keys ───────────────────────────────────────────
export const trendingQueryKeys = {
  all: ["trendingPlaces"] as const,
  byCountry: (country: string) => [...trendingQueryKeys.all, country] as const,
};

// ─── Types ─────────────────────────────────────────────────
export interface TrendingPlace {
  id: number;
  name: string;
  title: string;
  country: string;
  desc: string;
  image: string;
  famous_landmark: string;
  insight?: string;
  recommended_month?: string;
}

// ─── Fetch Function ────────────────────────────────────────
async function fetchTrendingPlaces(country: string): Promise<TrendingPlace[]> {
  const jwt = await AsyncStorage.getItem(JWT_KEY);
  if (!jwt) return [];

  const prompt = `Suggest a mix of 12 trending travel destinations (6 domestic within ${country} and 6 popular international spots) for someone currently in ${country}. Return as raw JSON array. No markdown.`;

  const res = await apiPost<{ trendingPlaces: any[] }>("/api/trendingPlaces", {
    trendingPlacesPrompt: prompt,
    country,
  });

  return (res.trendingPlaces ?? []).map((p: any, idx: number) => ({
    ...p,
    id: idx + 1,
  }));
}

// ─── useTrendingPlaces ─────────────────────────────────────
// staleTime: 12 hours — backend caches for 90 days; frontend aggressively caches too
// gcTime: 24 hours — images stay warm in expo-image cache
// Query key is per-country so India/Japan/etc. are cached independently
export function useTrendingPlaces(country: string = "India") {
  const query = useQuery({
    queryKey: trendingQueryKeys.byCountry(country),
    queryFn: () => fetchTrendingPlaces(country),
    staleTime: 12 * 60 * 60 * 1000,  // 12 hours
    gcTime: 24 * 60 * 60 * 1000,     // 24 hours
    enabled: !!country,
  });

  // ── Image Preloading ───────────────────────────────────
  // Once data arrives, prefetch all card images into expo-image's disk cache.
  // On subsequent visits, images render instantly without a network request.
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
