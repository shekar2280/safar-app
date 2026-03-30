import { db } from "@/src/lib/firebase";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import React, { createContext, useState, useContext, ReactNode } from "react";
import { ActiveTripContextValue, ActiveTripData } from "@/src/types/interfaces";

const ActiveTripContext = createContext<ActiveTripContextValue | null>(null);

export const ActiveTripProvider = ({ children }: { children: ReactNode }) => {
  const [activeTrip, setActiveTrip] = useState<ActiveTripData | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const clearActiveTrip = () => {
    setActiveTrip(null);
    setLastRefreshed(null);
  };

  const markAsDone = async (placeId: string, userId: string, tripId: string): Promise<void> => {
    const tripRef = doc(db, "UserTrips", userId, "trips", tripId);
    await updateDoc(tripRef, {
      completedPlaceIds: arrayUnion(placeId),
    });
    setActiveTrip((prev) =>
      prev
        ? { ...prev, completedPlaceIds: [...(prev.completedPlaceIds || []), placeId] }
        : prev
    );
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

export const useActiveTrip = (): ActiveTripContextValue => {
  const context = useContext(ActiveTripContext);
  if (!context) throw new Error("useActiveTrip must be used within an ActiveTripProvider");
  return context;
};

export { ActiveTripContext };
