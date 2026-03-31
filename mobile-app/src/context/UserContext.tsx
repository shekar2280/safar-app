import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from "react";
import { User } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "@/src/lib/firebase";
import { UserContextValue, UserProfile, UserTrip } from "@/src/types/interfaces";
import { apiGet, JWT_KEY, USER_KEY } from "@/src/lib/api";

const UserContext = createContext<UserContextValue | null>(null);

function mapBackendTrip(raw: any): UserTrip {
  const savedTrip = raw.saved_trip;
  const imageUrls: string[] = savedTrip?.image_urls ?? [];
  return {
    id: String(raw.id),
    savedTripId: raw.normalized_key,
    userEmail: "",
    userId: String(raw.user_id ?? ""),
    startDate: raw.start_date ? String(raw.start_date) : "",
    endDate: raw.end_date ? String(raw.end_date) : "",
    traveler: raw.traveler,
    isInternational: raw.is_international,
    departureIata: raw.departure_iata,
    destinationIata: raw.destination_iata,
    tripType: raw.trip_type,
    isActive: raw.is_active,
    createdAt: raw.created_at,
    tripPlan: savedTrip?.trip_plan,
    imageUrl: imageUrls.length > 0 ? imageUrls : undefined,
  };
}

function mapBackendUser(raw: any): UserProfile {
  return {
    fullName: raw.full_name ?? "",
    email: raw.email ?? "",
    uid: raw.firebase_uid ?? "",
    photoURL: raw.photo_url ?? undefined,
  };
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userTrips, setUserTrips] = useState<UserTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<unknown[]>([]);
  const [currentUid, setCurrentUid] = useState<string | null>(null);

  const fetchTripsFromBackend = useCallback(async (uid: string) => {
    const jwt = await AsyncStorage.getItem(JWT_KEY);
    if (!jwt) return;
    try {
      const backendTrips = await apiGet<any[]>("/api/trips");
      const mapped = (backendTrips ?? []).map(mapBackendTrip);
      setUserTrips(mapped);
      await AsyncStorage.setItem(`trips_${uid}`, JSON.stringify(mapped));
    } catch {
      // Backend unreachable — keep using cached data
    }
  }, []);

  const refreshTrips = useCallback(async () => {
    if (!currentUid) return;
    await fetchTripsFromBackend(currentUid);
  }, [currentUid, fetchTripsFromBackend]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user: User | null) => {
      if (user) {
        setLoading(true);
        setCurrentUid(user.uid);

        // Load cached trips immediately for instant UI
        const cachedTrips = await AsyncStorage.getItem(`trips_${user.uid}`);
        if (cachedTrips) {
          try {
            setUserTrips(JSON.parse(cachedTrips));
          } catch {}
          setLoading(false);
        }

        // Load cached user profile
        const cachedUser = await AsyncStorage.getItem(USER_KEY);
        if (cachedUser) {
          try {
            setUserProfile(mapBackendUser(JSON.parse(cachedUser)));
          } catch {}
        }

        // Fetch fresh data from backend
        const jwt = await AsyncStorage.getItem(JWT_KEY);
        if (!jwt) {
          setLoading(false);
          return;
        }

        try {
          const [backendUser, backendTrips] = await Promise.all([
            apiGet<any>("/api/auth/me"),
            apiGet<any[]>("/api/trips"),
          ]);

          const profile = mapBackendUser(backendUser);
          setUserProfile(profile);
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(backendUser));

          const mapped = (backendTrips ?? []).map(mapBackendTrip);
          setUserTrips(mapped);
          await AsyncStorage.setItem(`trips_${user.uid}`, JSON.stringify(mapped));
        } catch {
          // Backend unreachable — keep using cached data
        } finally {
          setLoading(false);
        }
      } else {
        setCurrentUid(null);
        setUserTrips([]);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [fetchTripsFromBackend]);

  return (
    <UserContext.Provider
      value={{
        userProfile,
        setUserProfile,
        userTrips,
        setUserTrips,
        loading,
        transactions,
        setTransactions,
        refreshTrips,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextValue => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};

export { UserContext };
