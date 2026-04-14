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

  const markAsDone = async (tripId: string, visitedIndices: number[]): Promise<void> => {
    const currentVisited = activeTrip?.visitedIndices || [];
    try {
      setActiveTrip((prev) => prev ? { ...prev, visitedIndices } : prev);
      await apiPatch(`/api/v1/trips/${tripId}/visited-indices`, {
        visited_indices: visitedIndices,
      });
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
    } catch (error) {
      setActiveTrip((prev) => prev ? { ...prev, visitedIndices: currentVisited } : prev);
      console.error("Failed to sync visited status:", error);
      Alert.alert("Update Failed", "We couldn't save your progress.");
    }
  };

  const skipPlace = async (tripId: string, skippedIndices: number[]): Promise<void> => {
    const currentSkipped = activeTrip?.skipped_indices || [];
    try {
      setActiveTrip((prev) => prev ? { ...prev, skipped_indices: skippedIndices } : prev);
      await apiPatch(`/api/v1/trips/${tripId}/skipped-indices`, {
        skipped_indices: skippedIndices,
      });
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
    } catch (error) {
      setActiveTrip((prev) => prev ? { ...prev, skipped_indices: currentSkipped } : prev);
      console.error("Failed to sync skipped status:", error);
      Alert.alert("Update Failed", "We couldn't postpone this stop.");
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
        skipPlace,
        finalizeTrip: async (tripId: string) => {
          try {
            await apiPatch(`/api/v1/trips/${tripId}/finalize`, {});
            setActiveTrip(prev => prev ? { ...prev, isFinished: true } : prev);
            queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
          } catch (error) {
            console.error("Failed to finalize trip:", error);
          }
        }
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
