import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { CreateTripContextValue, TripData } from "@/src/constants";

const CreateTripContext = createContext<CreateTripContextValue | null>(null);

import AsyncStorage from "@react-native-async-storage/async-storage";

const CREATE_TRIP_STORAGE_KEY = "safar_create_trip_progress";

export const CreateTripProvider = ({ children }: { children: ReactNode }) => {
  const [tripData, setTripData] = useState<Partial<TripData>>({});

  useEffect(() => {
    const loadProgress = async () => {
      const saved = await AsyncStorage.getItem(CREATE_TRIP_STORAGE_KEY);
      if (saved) {
        setTripData(JSON.parse(saved));
      }
    };
    loadProgress();
  }, []);

  useEffect(() => {
    if (Object.keys(tripData).length > 0) {
      AsyncStorage.setItem(CREATE_TRIP_STORAGE_KEY, JSON.stringify(tripData));
    } else {
      AsyncStorage.removeItem(CREATE_TRIP_STORAGE_KEY);
    }
  }, [tripData]);

  return (
    <CreateTripContext.Provider value={{ tripData, setTripData }}>
      {children}
    </CreateTripContext.Provider>
  );
};

export const useCreateTrip = (): CreateTripContextValue => {
  const context = useContext(CreateTripContext);
  if (!context) throw new Error("useCreateTrip must be used within a CreateTripProvider");
  return context;
};

export { CreateTripContext };
