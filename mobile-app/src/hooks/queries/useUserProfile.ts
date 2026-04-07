import { useQuery } from "@tanstack/react-query";
import { apiGet, JWT_KEY } from "@/src/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Query Keys ───────────────────────────────────────────
export const userProfileQueryKeys = {
  all: ["userProfile"] as const,
  me: () => [...userProfileQueryKeys.all, "me"] as const,
};

// ─── Fetch Function ────────────────────────────────────────
async function fetchUserProfile() {
  const jwt = await AsyncStorage.getItem(JWT_KEY);
  if (!jwt) return null;
  return await apiGet<any>("/api/auth/me");
}

// ─── useUserProfile ────────────────────────────────────────
// staleTime: 10 min — profile is stable; short window covers post-edit sync
// gcTime: 30 min — keep in memory across tab switches
// refetchOnWindowFocus: true — ensures profile updates after editing on profile page
export function useUserProfile() {
  return useQuery({
    queryKey: userProfileQueryKeys.me(),
    queryFn: fetchUserProfile,
    staleTime: 10 * 60 * 1000,  // 10 minutes
    gcTime: 30 * 60 * 1000,     // 30 minutes
    refetchOnWindowFocus: true,
  });
}
