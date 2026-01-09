import React, { createContext, useState } from "react";

export const CommonTripContext = createContext(null);

export const TripProvider = ({ children }) => {
  const [tripDetails, setTripDetails] = useState({
    tripType: null, 
  });

  return (
    <CommonTripContext.Provider value={{ tripDetails, setTripDetails }}>
      {children}
    </CommonTripContext.Provider>
  );
};
