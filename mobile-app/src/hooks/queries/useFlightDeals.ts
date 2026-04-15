import { useQuery } from "@tanstack/react-query";

export function useFlightDeals() {
  return { data: [], isLoading: false };
}
