import React, { createContext, useState } from "react";

export const CommonTripContext = createContext(null);

export const TripProvider = ({ children }) => {
  const initialState = {
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
  };

  const [tripDetails, setTripDetails] = useState(initialState);

  const resetTripDetails = () => {
    setTripDetails(initialState);
  };

  return (
    <CommonTripContext.Provider value={{ tripDetails, setTripDetails, resetTripDetails }}>
      {children}
    </CommonTripContext.Provider>
  );
};