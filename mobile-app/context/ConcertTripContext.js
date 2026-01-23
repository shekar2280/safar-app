import React, { createContext, useState } from "react";

export const ConcertTripContext = createContext(null);

export const ConcertTripProvider = ({ children }) => {
  const [concertData, setConcertData] = useState({
    artist: null,
    locationInfo: null,
    travelers: null,
    budget: null,
  });

  return (
    <ConcertTripContext.Provider value={{ concertData, setConcertData }}>
      {children}
    </ConcertTripContext.Provider>
  );
};
