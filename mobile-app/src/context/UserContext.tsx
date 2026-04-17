import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { User } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "@/src/lib/firebase";
import { UserContextValue, UserProfile, AlertType } from "@/src/types";
import { apiPatch, JWT_KEY, USER_KEY, updateUserProfile, getMe } from "@/src/lib/api";
import { useLocation } from "@/src/context/LocationContext";
import SafarAlert from "@/src/components/ui/SafarAlert";
import * as Sentry from "@sentry/react-native";

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

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("info");

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user: User | null) => {
      if (user) {
        setLoading(true);

        const cachedUser = await AsyncStorage.getItem(USER_KEY);
        if (cachedUser) {
          try {
            setUserProfile(mapBackendUser(JSON.parse(cachedUser)));
          } catch (err) {
            Sentry.addBreadcrumb({
              category: "auth",
              message: "Failed to parse cached user profile",
              level: "warning",
            });
          }
        }

        try {
          const profile = await getMe();
          if (profile) {
            setUserProfile(mapBackendUser(profile));
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(profile));
          }
        } catch (err) {
          Sentry.captureException(err, { extra: { context: "UserContext:fetchMe" } });
        } finally {
          setLoading(false);
        }
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (userProfile) {
      Sentry.setUser({
        id: userProfile.uid,
        email: userProfile.email,
        username: userProfile.fullName,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [userProfile]);

  const { refreshGPS } = useLocation();

  const showAlert = (title: string, message: string, type: AlertType = "info") => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const detectHomeLocation = async () => {
    showAlert(
      "Welcome to Safar",
      "We use your location to pick your home airport for trip planning. Would you like us to detect your current city?",
      "confirm"
    );
  };

  const handleDetectCity = async () => {
    setAlertVisible(false);
    try {
      const newData = await refreshGPS();
      if (newData) {
        const latitude = newData.coordinates.latitude || newData.coordinates.lat;
        const longitude = newData.coordinates.longitude || newData.coordinates.lon;
        
        if (latitude === undefined || longitude === undefined) return;

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
      }
    } catch (err) {
      Sentry.captureException(err, { extra: { context: "UserContext:detectHomeLocation" } });
      showAlert(
        "Detection Failed",
        "We could not identify your home city automatically. Please set it manually in your profile.",
        "error"
      );
    }
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
      <SafarAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        confirmText={alertType === "confirm" ? "Detect City" : "Continue"}
        cancelText="Later"
        onConfirm={alertType === "confirm" ? handleDetectCity : () => setAlertVisible(false)}
        onCancel={() => setAlertVisible(false)}
      />
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextValue => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};

export { UserContext };
