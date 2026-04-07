import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/src/lib/api";

// ─── Query Keys ───────────────────────────────────────────
export const weatherQueryKeys = {
  all: ["weather"] as const,
  byCity: (city: string) => [...weatherQueryKeys.all, city] as const,
};

// ─── Fetch Function ────────────────────────────────────────
async function fetchWeather(city: string) {
  return await apiGet<{ current: any; forecast: any }>("/api/discovery/weather", { city });
}

// ─── useWeather ────────────────────────────────────────────
// staleTime: 30 min — fresh enough without hammering the weather API
// gcTime: 1 hour — keep in memory across navigation
// enabled: !!city — prevents firing without a city name
export function useWeather(city: string) {
  return useQuery({
    queryKey: weatherQueryKeys.byCity(city),
    queryFn: () => fetchWeather(city),
    staleTime: 30 * 60 * 1000,  // 30 minutes
    gcTime: 60 * 60 * 1000,     // 1 hour
    enabled: !!city,
  });
}
