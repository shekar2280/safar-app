import { db } from "@/config/FirebaseConfig";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import React, { createContext, useState, useContext } from "react";

export const ActiveTripContext = createContext(null);

export const ActiveTripProvider = ({ children }) => {
  const [activeTrip, setActiveTrip] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const clearActiveTrip = () => {
    setActiveTrip(null);
    setLastRefreshed(null);
  };

  const markAsDone = async (placeId, userId, tripId) => {
    const tripRef = doc(db, "UserTrips", userId, "trips", tripId);

    await updateDoc(tripRef, {
      completedPlaceIds: arrayUnion(placeId),
    });

    setActiveTrip((prev) => ({
      ...prev,
      completedPlaceIds: [...(prev.completedPlaceIds || []), placeId],
    }));
  };

  return (
    <ActiveTripContext.Provider
      value={{
        activeTrip,
        setActiveTrip,
        clearActiveTrip,
        lastRefreshed,
        setLastRefreshed,
        markAsDone,
      }}
    >
      {children}
    </ActiveTripContext.Provider>
  );
};

export const useActiveTrip = () => {
  const context = useContext(ActiveTripContext);
  if (!context) {
    throw new Error("useActiveTrip must be used within an ActiveTripProvider");
  }
  return context;
};
