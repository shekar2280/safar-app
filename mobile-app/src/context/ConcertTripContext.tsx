import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { ConcertTripContextValue, ConcertData } from "@/src/types";

const ConcertTripContext = createContext<ConcertTripContextValue | null>(null);

const initialConcertData: ConcertData = {
  artist: "",
  locationInfo: null,
  travelers: null,
  budget: null,
};

import AsyncStorage from "@react-native-async-storage/async-storage";

const CONCERT_TRIP_STORAGE_KEY = "safar_concert_trip_progress";

export const ConcertTripProvider = ({ children }: { children: ReactNode }) => {
  const [concertData, setConcertData] = useState<ConcertData>(initialConcertData);

  useEffect(() => {
    const loadProgress = async () => {
      const saved = await AsyncStorage.getItem(CONCERT_TRIP_STORAGE_KEY);
      if (saved) {
        setConcertData(JSON.parse(saved));
      }
    };
    loadProgress();
  }, []);

  useEffect(() => {
    if (concertData.artist || concertData.locationInfo) {
      AsyncStorage.setItem(CONCERT_TRIP_STORAGE_KEY, JSON.stringify(concertData));
    } else {
      AsyncStorage.removeItem(CONCERT_TRIP_STORAGE_KEY);
    }
  }, [concertData]);

  return (
    <ConcertTripContext.Provider value={{ concertData, setConcertData }}>
      {children}
    </ConcertTripContext.Provider>
  );
};

export const useConcertTrip = (): ConcertTripContextValue => {
  const context = useContext(ConcertTripContext);
  if (!context) throw new Error("useConcertTrip must be used within a ConcertTripProvider");
  return context;
};

export { ConcertTripContext };
