import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from "react";
import { User } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "@/src/lib/firebase";
import { UserContextValue, UserProfile, UserTrip } from "@/src/types/interfaces";
import { apiGet, apiPatch, JWT_KEY, USER_KEY, updateUserProfile } from "@/src/lib/api";
import * as Location from "expo-location";
import { Alert } from "react-native";

const UserContext = createContext<UserContextValue | null>(null);

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

function mapBackendUser(raw: any): UserProfile {
  return {
    fullName: raw.full_name ?? "",
    email: raw.email ?? "",
    uid: raw.firebase_uid ?? "",
    photoURL: raw.photo_url ?? undefined,
    homeLocation: raw.home_location ?? null,
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
        const cachedTrips = await AsyncStorage.getItem(`trips_${user.uid}`);
        if (cachedTrips) {
          try {
            setUserTrips(JSON.parse(cachedTrips));
          } catch {}
          setLoading(false);
        }

        const cachedUser = await AsyncStorage.getItem(USER_KEY);
        if (cachedUser) {
          try {
            setUserProfile(mapBackendUser(JSON.parse(cachedUser)));
          } catch {}
        }

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

  const detectHomeLocation = async () => {
    Alert.alert(
      "Welcome to Safar",
      "We use your location to pick your home airport for trip planning. Would you like us to detect your current city?",
      [
        { text: "Later", style: "cancel" },
        {
          text: "Detect City",
          onPress: async () => {
            try {
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== "granted") return;

              const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
              });

              const { latitude, longitude } = loc.coords;
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
                { headers: { "User-Agent": "safar-travel-app", "Accept-Language": "en" } }
              );
              const data = await res.json();

              const address = data.address || {};
              let rawCity = address.city || address.town || address.village || address.state_district || "";
              let cleanCity = rawCity.replace(/City of /gi, "").replace(/ City/gi, "").trim();
              
              const homeData = {
                name: cleanCity,
                label: `${cleanCity}, ${address.state || ""}`,
                fullAddress: data.display_name || "",
                country: address.country || "",
                countryCode: address.country_code || "",
                coordinates: { latitude, longitude },
              };

              await updateUserProfile({ home_location: homeData });
              setUserProfile(prev => prev ? { ...prev, homeLocation: homeData } : null);
            } catch (err) {
              console.log("Onboarding location error:", err);
            }
          }
        }
      ]
    );
  };

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
