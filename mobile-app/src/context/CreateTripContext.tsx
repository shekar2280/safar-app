import React, { createContext, useContext, useState, ReactNode } from "react";
import { CreateTripContextValue, TripData } from "@/src/types/interfaces";

const CreateTripContext = createContext<CreateTripContextValue | null>(null);

export const CreateTripProvider = ({ children }: { children: ReactNode }) => {
  const [tripData, setTripData] = useState<Partial<TripData>>({});

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
