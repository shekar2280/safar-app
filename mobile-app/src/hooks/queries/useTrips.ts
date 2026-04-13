import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiDelete, apiPatch, JWT_KEY } from "@/src/lib/api";
import { UserTrip } from "@/src/types/interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";

function mapBackendTrip(raw: any): UserTrip {
  const savedTrip = raw.saved_trip;
  const imageUrls: string[] = savedTrip?.image_urls ?? [];
  return {
    id: String(raw.id),
    savedTripId: raw.normalized_key,
    userEmail: "",
    userId: String(raw.user_id ?? ""),
    totalDays: raw.total_days ?? 1,
    traveler: raw.traveler,
    isInternational: raw.is_international,
    departureIata: raw.departure_iata,
    destinationIata: raw.destination_iata,
    travelerMode: raw.traveler_mode,
    isActive: raw.is_active,
    isFinished: raw.is_finished,
    totalBudget: raw.total_budget || 0,
    visitedIndices: raw.visited_indices || [],
    archivedSpendings: raw.archived_spendings || [],
    activatedAt: raw.activated_at,
    completedAt: raw.completed_at,
    updatedAt: raw.updated_at,
    createdAt: raw.created_at,
    tripPlan: savedTrip?.trip_plan,
    concertData: raw.concert_data,
    imageUrl: raw.image_url || raw.imageUrl || (imageUrls.length > 0 ? imageUrls : undefined),
  };
}

export const tripQueryKeys = {
  all: ["trips"] as const,
  lists: () => [...tripQueryKeys.all, "list"] as const,
};

async function fetchTrips(): Promise<UserTrip[]> {
  const jwt = await AsyncStorage.getItem(JWT_KEY);
  if (!jwt) return [];
  const raw = await apiGet<any[]>("/api/v1/trips");
  return (raw ?? []).map(mapBackendTrip);
}

export function useTrips() {
  return useQuery({
    queryKey: tripQueryKeys.lists(),
    queryFn: fetchTrips,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useActivateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tripId: string) => apiPatch(`/api/v1/trips/${tripId}/activate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tripId: string) => apiDelete(`/api/v1/trips/${tripId}`),
    onMutate: async (tripId: string) => {
      await queryClient.cancelQueries({ queryKey: tripQueryKeys.lists() });
      const previous = queryClient.getQueryData<UserTrip[]>(tripQueryKeys.lists());
      queryClient.setQueryData<UserTrip[]>(tripQueryKeys.lists(), (old) =>
        old ? old.filter((t) => t.id !== tripId) : []
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(tripQueryKeys.lists(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
    },
  });
}

export function useUpdateTripBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, total_budget }: { tripId: string; total_budget: number }) =>
      apiPatch(`/api/v1/trips/${tripId}/budget`, { total_budget }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
    },
  });
}

export function useUpdateVisitedIndices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, visited_indices }: { tripId: string; visited_indices: number[] }) =>
      apiPatch(`/api/v1/trips/${tripId}/visited-indices`, { visited_indices }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
    },
  });
}
