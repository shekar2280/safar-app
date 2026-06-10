import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { User } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "@/src/lib/firebase";
import { UserContextValue, UserProfile, AlertType } from "@/src/constants";
import { apiPatch, JWT_KEY, USER_KEY, updateUserProfile, getMe, syncUserWithBackend } from "@/src/lib/api";
import { useLocation } from "@/src/context/LocationContext";
import SafarAlert from "@/src/components/ui/SafarAlert";
import * as Sentry from "@sentry/react-native";

const UserContext = createContext<UserContextValue | null>(null);

function mapBackendUser(raw: any): UserProfile {
  return {
    fullName: raw.full_name ?? "",
    email: raw.email ?? "",
    uid: raw.firebase_uid ?? "",
    photoURL: raw.photo_url || raw.photoURL || null,
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
          } else {
            const idToken = await user.getIdToken();
            const syncedUser = await syncUserWithBackend(idToken);
            setUserProfile(mapBackendUser(syncedUser));
          }
        } catch (err) {
          Sentry.captureException(err, { extra: { context: "UserContext:fetchOrSync" } });
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



  return (
    <UserContext.Provider
      value={{
        userProfile,
        setUserProfile,
        loading,
        transactions,
        setTransactions,

      }}
    >
      {children}
      <SafarAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        confirmText="Continue"
        cancelText="Later"
        onConfirm={() => setAlertVisible(false)}
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
