import React, { createContext, useState, useContext, ReactNode } from "react";
import { ActiveTripContextValue, ActiveTripData } from "@/src/types";
import { apiPatch } from "@/src/lib/api";
import { Alert } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { tripQueryKeys } from "@/src/hooks/queries/useTrips";
import SafarAlert from "@/src/components/ui/SafarAlert";
import * as Sentry from "@sentry/react-native";
import { AlertType } from "@/src/types";

const ActiveTripContext = createContext<ActiveTripContextValue | null>(null);

export const ActiveTripProvider = ({ children }: { children: ReactNode }) => {
  const [activeTrip, setActiveTrip] = useState<ActiveTripData | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const queryClient = useQueryClient();

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("info");

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
      Sentry.captureException(error, { extra: { context: "ActiveTripContext:markAsDone" } });
      showAlert("Update Failed", "We couldn't save your progress. Please check your connection.", "error");
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
      Sentry.captureException(error, { extra: { context: "ActiveTripContext:skipPlace" } });
      showAlert("Update Failed", "We couldn't postpone this stop. Please try again.", "error");
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
            Sentry.captureException(error, { extra: { context: "ActiveTripContext:finalizeTrip" } });
            showAlert("Completion Error", "We couldn't finalize your journey. Please check your network.", "error");
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
        confirmText="Continue"
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
