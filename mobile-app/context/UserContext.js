import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../config/FirebaseConfig";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

const UserContext = createContext();
const staticCache = {}; 

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    let unsubscribeTrips;

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const cachedTrips = await AsyncStorage.getItem(`trips_${user.uid}`);
        if (cachedTrips) {
          setUserTrips(JSON.parse(cachedTrips));
          setLoading(false);
        }

        const pSnap = await getDoc(doc(db, "users", user.uid));
        if (pSnap.exists()) setUserProfile(pSnap.data());

        const tRef = collection(db, "UserTrips", user.uid, "trips");
        const q = query(tRef, orderBy("createdAt", "desc"));

        unsubscribeTrips = onSnapshot(q, async (snapshot) => {
          const baseTrips = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));

          const enrichedTrips = await Promise.all(
            baseTrips.map(async (trip) => {
              if (!trip.savedTripId) return trip;
              if (staticCache[trip.savedTripId]) {
                return { ...trip, ...staticCache[trip.savedTripId] };
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

          setUserTrips(enrichedTrips);
          setLoading(false);
          await AsyncStorage.setItem(
            `trips_${user.uid}`,
            JSON.stringify(enrichedTrips)
          );
        }, (error) => {
          console.log("Firestore Listener cleaned up safely.");
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

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};