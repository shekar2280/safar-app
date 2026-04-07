import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { User } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "@/src/lib/firebase";
import { UserContextValue, UserProfile } from "@/src/types/interfaces";
import { apiPatch, JWT_KEY, USER_KEY, updateUserProfile } from "@/src/lib/api";
import * as Location from "expo-location";
import { Alert } from "react-native";

const UserContext = createContext<UserContextValue | null>(null);

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
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<unknown[]>([]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user: User | null) => {
      if (user) {
        setLoading(true);

        // Load cached profile from AsyncStorage for instant display
        const cachedUser = await AsyncStorage.getItem(USER_KEY);
        if (cachedUser) {
          try { setUserProfile(mapBackendUser(JSON.parse(cachedUser))); } catch {}
        }

        const jwt = await AsyncStorage.getItem(JWT_KEY);
        if (!jwt) { setLoading(false); return; }

        // TanStack Query handles all /api/trips and /api/auth/me fetching now.
        // We only hydrate the userProfile here from cache for the first paint.
        setLoading(false);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

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
        loading,
        transactions,
        setTransactions,
        detectHomeLocation,
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
