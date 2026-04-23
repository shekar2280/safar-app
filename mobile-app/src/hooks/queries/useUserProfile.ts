import { useQuery } from "@tanstack/react-query";
import { apiGet, JWT_KEY } from "@/src/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const userProfileQueryKeys = {
  all: ["userProfile"] as const,
  me: () => [...userProfileQueryKeys.all, "me"] as const,
};

async function fetchUserProfile() {
  const jwt = await AsyncStorage.getItem(JWT_KEY);
  if (!jwt) return null;
  return await apiGet<any>("/api/v1/auth/me");
}

export function useUserProfile() {
  return useQuery({
    queryKey: userProfileQueryKeys.me(),
    queryFn: fetchUserProfile,
    staleTime: 10 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
