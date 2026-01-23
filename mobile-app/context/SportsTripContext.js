import React, { createContext, useState } from "react";

export const SportsTripContext = createContext(null);

export const SportsTripProvider = ({ children }) => {
  const [sportsData, setSportsData] = useState({
    locationInfo: null,
    travelers: null,
    budget: null,
    team: "",
     opponent: "",
  });

  return (
    <SportsTripContext.Provider value={{ sportsData, setSportsData }}>
      {children}
    </SportsTripContext.Provider>
  );
};
