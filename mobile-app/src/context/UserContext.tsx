import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { User } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "@/src/lib/firebase";
import { doc, getDoc, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { UserContextValue, UserProfile, UserTrip } from "@/src/types/interfaces";

const UserContext = createContext<UserContextValue | null>(null);

const staticCache: Record<string, unknown> = {};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userTrips, setUserTrips] = useState<UserTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<unknown[]>([]);

  useEffect(() => {
    let unsubscribeTrips: (() => void) | undefined;

    const unsubscribeAuth = auth.onAuthStateChanged(async (user: User | null) => {
      if (user) {
        const cachedTrips = await AsyncStorage.getItem(`trips_${user.uid}`);
        if (cachedTrips) {
          setUserTrips(JSON.parse(cachedTrips));
          setLoading(false);
        }

        const pSnap = await getDoc(doc(db, "users", user.uid));
        if (pSnap.exists()) setUserProfile(pSnap.data() as UserProfile);

        const tRef = collection(db, "UserTrips", user.uid, "trips");
        const q = query(tRef, orderBy("createdAt", "desc"));

        unsubscribeTrips = onSnapshot(q, async (snapshot) => {
          const baseTrips = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as UserTrip[];

          const enrichedTrips = await Promise.all(
            baseTrips.map(async (trip) => {
              if (!trip.savedTripId) return trip;
              if (staticCache[trip.savedTripId]) {
                return { ...trip, ...(staticCache[trip.savedTripId] as object) };
              }
              const snap = await getDoc(doc(db, "SavedTripData", trip.savedTripId));
              if (snap.exists()) {
                const data = snap.data();
                staticCache[trip.savedTripId] = data;
                return { ...trip, ...data };
              }
              return trip;
            })
          );

          setUserTrips(enrichedTrips as UserTrip[]);
          setLoading(false);
          await AsyncStorage.setItem(`trips_${user.uid}`, JSON.stringify(enrichedTrips));
        });
      } else {
        if (unsubscribeTrips) unsubscribeTrips();
        setUserTrips([]);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeTrips) unsubscribeTrips();
    };
  }, []);

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
