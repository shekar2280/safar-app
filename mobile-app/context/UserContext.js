import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../config/FirebaseConfig";
import { doc, getDoc, collection, query, getDocs } from "firebase/firestore";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const initApp = async () => {
      const user = auth.currentUser;
      if (user) {
        const cachedProfile = await AsyncStorage.getItem(`profile_${user.uid}`);
        const cachedTrips = await AsyncStorage.getItem(`trips_${user.uid}`);

        if (cachedProfile) setUserProfile(JSON.parse(cachedProfile));
        if (cachedTrips) setUserTrips(JSON.parse(cachedTrips));

        refreshData(user);
      }
      setLoading(false);
    };
    initApp();
  }, []);

  const refreshData = async (user) => {
    try {
      const pSnap = await getDoc(doc(db, "users", user.uid));
      if (pSnap.exists()) {
        const pData = pSnap.data();
        setUserProfile(pData);
        await AsyncStorage.setItem(
          `profile_${user.uid}`,
          JSON.stringify(pData)
        );
      }

      const tRef = collection(db, "UserTrips", user.uid, "trips");
      const tSnap = await getDocs(tRef);
      const tData = tSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUserTrips(tData);
      await AsyncStorage.setItem(`trips_${user.uid}`, JSON.stringify(tData));

      const activeTrip = tData.find((t) => t.isActive);
      if (activeTrip) {
        const transRef = collection(
          db,
          "UserTrips",
          user.uid,
          "trips",
          activeTrip.id,
          "transactions"
        );
        const transSnap = await getDocs(transRef);
        const transData = transSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setTransactions(transData);
        await AsyncStorage.setItem(
          `trans_${activeTrip.id}`,
          JSON.stringify(transData)
        );
      }
    } catch (e) {
      console.log("Background refresh failed", e);
    }
  };

  const loadUser = async (user) => {
    if (user) {
      setLoading(true);
      await refreshData(user);
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userProfile,
        setUserProfile,
        loadUser,
        userTrips,
        setUserTrips,
        transactions,
        setTransactions,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
