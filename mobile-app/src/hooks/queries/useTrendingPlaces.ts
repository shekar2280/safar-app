import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiPost, JWT_KEY } from "@/src/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";

export const trendingQueryKeys = {
  all: ["trendingPlaces"] as const,
  byCountry: (country: string) => [...trendingQueryKeys.all, country] as const,
};

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

async function fetchTrendingPlaces(country: string): Promise<TrendingPlace[]> {
  const jwt = await AsyncStorage.getItem(JWT_KEY);
  if (!jwt) return [];

  const prompt = `Suggest a mix of 12 trending travel destinations (6 domestic within ${country} and 6 popular international spots) for someone currently in ${country}. Return as raw JSON array. No markdown.`;

  const res = await apiPost<{ trendingPlaces: any[] }>("/api/v1/discovery/trending", {
    trendingPlacesPrompt: prompt,
    country,
  });

  return (res.trendingPlaces ?? []).map((p: any, idx: number) => ({
    ...p,
    id: idx + 1,
  }));
}

export function useTrendingPlaces(country: string = "India") {
  const query = useQuery({
    queryKey: trendingQueryKeys.byCountry(country),
    queryFn: () => fetchTrendingPlaces(country),
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
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
