import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActiveTripContextValue, ActiveTripData } from "@/src/types";
import { apiPatch } from "@/src/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { tripQueryKeys } from "@/src/hooks/queries/useTrips";
import SafarAlert from "@/src/components/ui/SafarAlert";
import * as Sentry from "@sentry/react-native";
import { AlertType } from "@/src/types";

const ActiveTripContext = createContext<ActiveTripContextValue | null>(null);

const PROGRESS_CACHE_PREFIX = "trip_progress_";

export const ActiveTripProvider = ({ children }: { children: ReactNode }) => {
  const [activeTrip, setActiveTrip] = useState<ActiveTripData | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const queryClient = useQueryClient();

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("info");

  useEffect(() => {
    const syncOfflineProgress = async () => {
      if (!activeTrip?.id) return;
      try {
        const cached = await AsyncStorage.getItem(`${PROGRESS_CACHE_PREFIX}${activeTrip.id}`);
        if (cached) {
          const { visited, skipped } = JSON.parse(cached);
          setActiveTrip(prev => prev ? { 
            ...prev, 
            visitedIndices: visited || prev.visitedIndices,
            skipped_indices: skipped || prev.skipped_indices 
          } : prev);
        }
      } catch (e) {
        console.warn("Failed to sync offline progress", e);
      }
    };
    syncOfflineProgress();
  }, [activeTrip?.id]);

  const showAlert = (title: string, message: string, type: AlertType = "info") => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const clearActiveTrip = () => {
    setActiveTrip(null);
    setLastRefreshed(null);
  };

  const saveLocally = async (tripId: string, visited: number[], skipped: number[]) => {
    try {
      await AsyncStorage.setItem(
        `${PROGRESS_CACHE_PREFIX}${tripId}`,
        JSON.stringify({ visited, skipped, updatedAt: new Date().toISOString() })
      );
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  const markAsDone = async (tripId: string, visitedIndices: number[]): Promise<void> => {
    const skipped = activeTrip?.skipped_indices || [];
    try {
      setActiveTrip((prev) => prev ? { ...prev, visitedIndices } : prev);
      await saveLocally(tripId, visitedIndices, skipped);
      await apiPatch(`/api/v1/trips/${tripId}/visited-indices`, {
        visited_indices: visitedIndices,
      });
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
    } catch (error) {
      Sentry.addBreadcrumb({
        category: "sync",
        message: "Offline: Progress saved locally, server sync pending",
        level: "info",
      });
    }
  };

  const skipPlace = async (tripId: string, skippedIndices: number[]): Promise<void> => {
    const visited = activeTrip?.visitedIndices || [];
    try {
      setActiveTrip((prev) => prev ? { ...prev, skipped_indices: skippedIndices } : prev);
      await saveLocally(tripId, visited, skippedIndices);

      await apiPatch(`/api/v1/trips/${tripId}/skipped-indices`, {
        skipped_indices: skippedIndices,
      });
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
    } catch (error) {
      Sentry.addBreadcrumb({
        category: "sync",
        message: "Offline: Skip saved locally, server sync pending",
        level: "info",
      });
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
            Sentry.captureException(error);
            showAlert("Connection Needed", "We need a signal to finalize and archive your trip permanently.", "info");
          }
        }
      }}
    >
      {children}
      <SafarAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        confirmText="OK"
        onConfirm={() => setAlertVisible(false)}
        onCancel={() => setAlertVisible(false)}
      />
    </ActiveTripContext.Provider>
  );
};

export const useActiveTrip = (): ActiveTripContextValue => {
  const context = useContext(ActiveTripContext);
  if (!context) throw new Error("useActiveTrip must be used within an ActiveTripProvider");
  return context;
};

export { ActiveTripContext };
