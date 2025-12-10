import React, { createContext, useState } from "react";

export const FestiveTripContext = createContext(null);

export const FestiveTripProvider = ({ children }) => {
  const [festiveData, setFestiveData] = useState({
    locationInfo: null,
    travelers: null,
    budget: null,
  });

  return (
    <FestiveTripContext.Provider value={{ festiveData, setFestiveData }}>
      {children}
    </FestiveTripContext.Provider>
  );
};
