import { createContext, useState } from "react";

export const TrendingTripContext = createContext(null);

export const TrendingTripProvider = ({ children }) => {
  const [trendingData, setTrendingData] = useState({
    travelers: null,
    budget: null,
  });

  return (
    <TrendingTripContext.Provider value={{ trendingData, setTrendingData }}>
      {children}
    </TrendingTripContext.Provider>
  );
};
