import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/src/lib/api";

export const weatherQueryKeys = {
  all: ["weather"] as const,
  byCity: (city: string) => [...weatherQueryKeys.all, city] as const,
};

async function fetchWeather(city: string) {
  return await apiGet<{ current: any; forecast: any }>(
    "/api/v1/discovery/weather",
    { city },
  );
}

const getMsUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0
  );
  return midnight.getTime() - now.getTime();
};

export function useWeather(city: string) {
  return useQuery({
    queryKey: weatherQueryKeys.byCity(city),
    queryFn: () => fetchWeather(city),
    staleTime: getMsUntilMidnight(),
    gcTime: 48 * 60 * 60 * 1000,
    enabled: !!city,
  });
}
