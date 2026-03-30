import React, { createContext, useState, ReactNode } from "react";

import { CommonTripContextValue, CommonTripDetails } from "@/src/types/interfaces";

const CommonTripContext = createContext<CommonTripContextValue | null>(null);

const initialState: CommonTripDetails = {
  tripType: null,
  departureInfo: null,
  destinationInfo: null,
  traveler: null,
  budget: null,
  startDate: null,
  endDate: null,
  totalDays: null,
  tripCategory: null,
  trendingPlaces: [],
  isInternational: false,
};

export const TripProvider = ({ children }: { children: ReactNode }) => {
  const [tripDetails, setTripDetailsState] = useState<CommonTripDetails>(initialState);

  const setTripDetails = (data: Partial<CommonTripDetails>) => {
    setTripDetailsState((prev) => ({ ...prev, ...data }));
  };

  const resetTripDetails = () => {
    setTripDetailsState(initialState);
  };

  return (
    <CommonTripContext.Provider value={{ tripDetails, setTripDetails, resetTripDetails }}>
      {children}
    </CommonTripContext.Provider>
  );
};

export const useCommonTrip = (): CommonTripContextValue => {
  const context = React.useContext(CommonTripContext);
  if (!context) throw new Error("useCommonTrip must be used within a TripProvider");
  return context;
};

export { CommonTripContext };
