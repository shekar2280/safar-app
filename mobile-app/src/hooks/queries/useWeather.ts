import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/src/lib/api";

export const weatherQueryKeys = {
  all: ["weather"] as const,
  byCity: (city: string) => [...weatherQueryKeys.all, city] as const,
};

async function fetchWeather(city: string) {
  return await apiGet<{ current: any; forecast: any }>("/api/v1/discovery/weather", { city });
}

export function useWeather(city: string) {
  return useQuery({
    queryKey: weatherQueryKeys.byCity(city),
    queryFn: () => fetchWeather(city),
    staleTime: 30 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    enabled: !!city,
  });
}
