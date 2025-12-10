// context/DiscoverTripContext.js
import React, { createContext, useState } from "react";

export const DiscoverTripContext = createContext(null);

export const DiscoverTripProvider = ({ children }) => {
  const [discoverData, setDiscoverData] = useState({
    locationInfo: null,
    travelers: null,
    budget: null,
  });

  return (
    <DiscoverTripContext.Provider value={{ discoverData, setDiscoverData }}>
      {children}
    </DiscoverTripContext.Provider>
  );
};
