import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/src/lib/api";

export const flightDealsKeys = {
  all: ["flightDeals"] as const,
};

async function fetchFlightDeals() {
  const data = await apiGet<any>("/api/v1/discovery/inspiration");
  return data?.destinations || [];
}

export function useFlightDeals() {
  return useQuery({
    queryKey: flightDealsKeys.all,
    queryFn: fetchFlightDeals,
    staleTime: 6 * 60 * 60 * 1000,
    gcTime: 12 * 60 * 60 * 1000,
  });
}
