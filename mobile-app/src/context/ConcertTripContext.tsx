import React, { createContext, useState, useContext, ReactNode } from "react";
import { ConcertTripContextValue, ConcertData } from "@/src/types";

const ConcertTripContext = createContext<ConcertTripContextValue | null>(null);

const initialConcertData: ConcertData = {
  artist: "",
  locationInfo: null,
  travelers: null,
  budget: null,
};

export const ConcertTripProvider = ({ children }: { children: ReactNode }) => {
  const [concertData, setConcertData] = useState<ConcertData>(initialConcertData);

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
