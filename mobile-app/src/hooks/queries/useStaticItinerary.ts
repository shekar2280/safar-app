import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/src/lib/api";

export const staticItineraryKeys = {
  all: ["staticItinerary"] as const,
  byKey: (key: string) => [...staticItineraryKeys.all, key] as const,
};

async function fetchStaticItinerary(savedTripKey: string) {
  return await apiGet<any>(`/api/v1/trips/saved/${encodeURIComponent(savedTripKey)}`);
}

export function useStaticItinerary(savedTripKey?: string) {
  return useQuery({
    queryKey: staticItineraryKeys.byKey(savedTripKey || ""),
    queryFn: () => fetchStaticItinerary(savedTripKey!),
    staleTime: 7 * 24 * 60 * 60 * 1000,
    gcTime: 30 * 24 * 60 * 60 * 1000,
    enabled: !!savedTripKey,
  });
}
