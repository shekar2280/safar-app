import React, { createContext, useState, useContext, ReactNode } from "react";
import { ActiveTripContextValue, ActiveTripData } from "@/src/types/interfaces";
import { apiPatch } from "@/src/lib/api";
import { Alert } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { tripQueryKeys } from "@/src/hooks/queries/useTrips";

const ActiveTripContext = createContext<ActiveTripContextValue | null>(null);

export const ActiveTripProvider = ({ children }: { children: ReactNode }) => {
  const [activeTrip, setActiveTrip] = useState<ActiveTripData | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const queryClient = useQueryClient();

  const clearActiveTrip = () => {
    setActiveTrip(null);
    setLastRefreshed(null);
  };

  const markAsDone = async (placeName: string, userId: string, tripId: string, index?: number): Promise<void> => {
    if (typeof index !== 'number') {
        console.warn("markAsDone now requires an 'index' parameter for the SQL backend.");
        return;
    }

    const currentVisited = activeTrip?.visitedIndices || [];
    const newVisited = currentVisited.includes(index)
      ? currentVisited.filter((i: number) => i !== index)
      : [...currentVisited, index];

    try {
      setActiveTrip((prev) => prev ? { ...prev, visitedIndices: newVisited } : prev);
      
      await apiPatch(`/api/v1/trips/${tripId}/visited-indices`, {
        visited_indices: newVisited,
      });
      
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
    } catch (error) {
      setActiveTrip((prev) => prev ? { ...prev, visitedIndices: currentVisited } : prev);
      console.error("Failed to sync visited status:", error);
      Alert.alert("Update Failed", "We couldn't save your progress. Please check your connection and try again.");
    }
  };

  return (
    <ActiveTripContext.Provider
      value={{
        activeTrip,
        setActiveTrip,
        clearActiveTrip,
        lastRefreshed,
        setLastRefreshed,
        markAsDone,
      }}
    >
      {children}
    </ActiveTripContext.Provider>
  );
};

export const useActiveTrip = (): ActiveTripContextValue => {
  const context = useContext(ActiveTripContext);
  if (!context) throw new Error("useActiveTrip must be used within an ActiveTripProvider");
  return context;
};

export { ActiveTripContext };
