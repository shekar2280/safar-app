import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActiveTripContextValue, ActiveTripData, AlertType, Spending } from "@/src/constants";
import { apiPatch } from "@/src/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { tripQueryKeys } from "@/src/hooks/queries/useTrips";
import SafarAlert from "@/src/components/ui/SafarAlert";
import * as Sentry from "@sentry/react-native";
import { formatSpendingDate } from "../utils/dateFormatter";
import NetInfo from "@react-native-community/netinfo";

const ActiveTripContext = createContext<ActiveTripContextValue | null>(null);

const PROGRESS_CACHE_PREFIX = "trip_progress_";
const ACTIVE_TRIP_ID_KEY = "safar_active_trip_id";

export const ActiveTripProvider = ({ children }: { children: ReactNode }) => {
  const [activeTrip, setActiveTrip] = useState<ActiveTripData | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const queryClient = useQueryClient();
  const isSyncing = useRef(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const loadActiveId = async () => {
      const savedId = await AsyncStorage.getItem(ACTIVE_TRIP_ID_KEY);
      if (savedId) {
        setActiveId(savedId);
      }
    };
    loadActiveId();
  }, []);

  useEffect(() => {
    if (activeId && !activeTrip) {
      const trips = queryClient.getQueryData<any[]>(tripQueryKeys.lists());
      if (trips) {
        const found = trips.find(t => String(t.id) === activeId);
        if (found) {
          setActiveTrip(found);
        }
      }
    }
  }, [activeId, activeTrip, queryClient]);

  useEffect(() => {
    if (activeTrip?.id) {
      AsyncStorage.setItem(ACTIVE_TRIP_ID_KEY, activeTrip.id);
      setActiveId(activeTrip.id);
    }
  }, [activeTrip?.id]);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("info");

  useEffect(() => {
    const syncOfflineProgress = async () => {
      if (!activeTrip?.id || isSyncing.current) return;
      
      const cached = await AsyncStorage.getItem(`${PROGRESS_CACHE_PREFIX}${activeTrip.id}`);
      if (!cached) return;

      isSyncing.current = true;
      try {
        const { visited, skipped, totalBudget, localSpendings } = JSON.parse(cached);
        
        setActiveTrip(prev => {
          if (!prev) return prev;
          return { 
            ...prev, 
            visitedIndices: visited || prev.visitedIndices,
            skipped_indices: skipped || prev.skipped_indices,
            totalBudget: totalBudget || prev.totalBudget,
            archivedSpendings: localSpendings || prev.archivedSpendings
          };
        });

        const state = await NetInfo.fetch();
        if (state.isConnected) {
          if (localSpendings && localSpendings.length > (activeTrip.archivedSpendings?.length || 0)) {
            await apiPatch(`/api/v1/trips/${activeTrip.id}/archive-spendings`, { spendings: localSpendings });
            queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
          }
          
          if (visited.length > (activeTrip.visitedIndices?.length || 0)) {
            await apiPatch(`/api/v1/trips/${activeTrip.id}/visited-indices`, { visited_indices: visited });
          }

          if (skipped.length > (activeTrip.skipped_indices?.length || 0)) {
            await apiPatch(`/api/v1/trips/${activeTrip.id}/skipped-indices`, { skipped_indices: skipped });
          }

          if (totalBudget && totalBudget !== activeTrip.totalBudget) {
            await apiPatch(`/api/v1/trips/${activeTrip.id}/budget`, { total_budget: totalBudget });
          }

          if (JSON.parse(cached).isPendingFinalize) {
            await apiPatch(`/api/v1/trips/${activeTrip.id}/finalize`, {});
            await saveLocally(activeTrip.id, visited, skipped, totalBudget, localSpendings, false);
          }

          if (JSON.parse(cached).isPendingDeactivate) {
            await apiPatch(`/api/v1/trips/${activeTrip.id}/deactivate`, {});
            await saveLocally(activeTrip.id, visited, skipped, totalBudget, localSpendings, false, false);
            queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
          }
        }
      } catch (error) {
        Sentry.captureException(error);
      } finally {
        isSyncing.current = false;
      }
    };

    syncOfflineProgress();

    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncOfflineProgress();
      }
    });

    return () => unsubscribe();
  }, [activeTrip?.id]);

  const showAlert = (title: string, message: string, type: AlertType = "info") => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const clearActiveTrip = async () => {
    setActiveTrip(null);
    setActiveId(null);
    setLastRefreshed(null);
    await AsyncStorage.removeItem(ACTIVE_TRIP_ID_KEY);
  };

  const saveLocally = async (
    tripId: string, 
    visited: number[], 
    skipped: number[], 
    totalBudget?: number, 
    localSpendings?: Spending[],
    isPendingFinalize?: boolean,
    isPendingDeactivate?: boolean
  ) => {
    try {
      const current = await AsyncStorage.getItem(`${PROGRESS_CACHE_PREFIX}${tripId}`);
      const data = current ? JSON.parse(current) : {};
      
      await AsyncStorage.setItem(
        `${PROGRESS_CACHE_PREFIX}${tripId}`,
        JSON.stringify({ 
          ...data,
          visited, 
          skipped, 
          totalBudget: totalBudget ?? data.totalBudget,
          localSpendings: localSpendings ?? data.localSpendings,
          isPendingFinalize: isPendingFinalize ?? data.isPendingFinalize ?? false,
          isPendingDeactivate: isPendingDeactivate ?? data.isPendingDeactivate ?? false,
          updatedAt: new Date().toISOString() 
        })
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
    }
  };

  const updateTripBudget = async (tripId: string, totalBudget: number): Promise<void> => {
    const visited = activeTrip?.visitedIndices || [];
    const skipped = activeTrip?.skipped_indices || [];
    try {
      setActiveTrip((prev) => prev ? { ...prev, totalBudget } : prev);
      await saveLocally(tripId, visited, skipped, totalBudget);
      await apiPatch(`/api/v1/trips/${tripId}/budget`, { total_budget: totalBudget });
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
    } catch (error) {
    }
  };

  const recordSpending = async (tripId: string, spending: { name: string, amount: number }): Promise<void> => {
    const generatedId = Math.random().toString(36).substr(2, 9);

    const newSpending: Spending = {
      id: generatedId,
      name: spending.name,
      amount: spending.amount,
      timestamp: Date.now(),
      date: formatSpendingDate(new Date()),
      isLocal: false, 
    };

    let updatedList: Spending[] = [];

    setActiveTrip(prev => {
      if (!prev) return prev;
      const currentSpendings = prev.archivedSpendings || [];
      updatedList = [newSpending, ...currentSpendings];
      
      saveLocally(
        tripId, 
        prev.visitedIndices || [], 
        prev.skipped_indices || [], 
        prev.totalBudget, 
        updatedList
      );
      
      return { ...prev, archivedSpendings: updatedList };
    });

    try {
      await apiPatch(`/api/v1/trips/${tripId}/archive-spendings`, { spendings: updatedList });
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
    } catch (error) {
    }
  };

  const removeSpending = async (tripId: string, spendingId: string): Promise<void> => {
    let updatedList: Spending[] = [];

    setActiveTrip(prev => {
      if (!prev) return prev;
      const currentSpendings = prev.archivedSpendings || [];
      updatedList = currentSpendings.filter(s => s.id !== spendingId);
      
      saveLocally(
        tripId, 
        prev.visitedIndices || [], 
        prev.skipped_indices || [], 
        prev.totalBudget, 
        updatedList
      );
      
      return { ...prev, archivedSpendings: updatedList };
    });

    try {
      await apiPatch(`/api/v1/trips/${tripId}/archive-spendings`, { spendings: updatedList });
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
    } catch (error) {
    }
  };

  const toggleVisited = async (tripId: string, index: number): Promise<void> => {
    const currentVisited = activeTrip?.visitedIndices || [];
    const newVisited = currentVisited.includes(index)
      ? currentVisited.filter((i) => i !== index)
      : [...currentVisited, index];
    
    await markAsDone(tripId, newVisited);
  };

  const toggleSkipped = async (tripId: string, index: number): Promise<void> => {
    const currentSkipped = activeTrip?.skipped_indices || [];
    const newSkipped = currentSkipped.includes(index)
      ? currentSkipped.filter((i) => i !== index)
      : [...currentSkipped, index];
    
    await skipPlace(tripId, newSkipped);
  };

  const deactivateTrip = async (tripId: string): Promise<void> => {
    try {
      setActiveTrip(prev => prev?.id === tripId ? null : prev);
      if (activeId === tripId) {
        setActiveId(null);
        await AsyncStorage.removeItem(ACTIVE_TRIP_ID_KEY);
      }
      await apiPatch(`/api/v1/trips/${tripId}/deactivate`, {});
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
    } catch (error) {
      const current = activeTrip?.visitedIndices || [];
      const skipped = activeTrip?.skipped_indices || [];
      await saveLocally(tripId, current, skipped, activeTrip?.totalBudget, activeTrip?.archivedSpendings, false, true);
      
      setActiveTrip(prev => prev?.id === tripId ? null : prev);
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
        toggleVisited,
        toggleSkipped,
        updateTripBudget,
        recordSpending,
        removeSpending,
        deactivateTrip,
        finalizeTrip: async (tripId: string) => {
          try {
            await apiPatch(`/api/v1/trips/${tripId}/finalize`, {});
            setActiveTrip(prev => prev ? { ...prev, isFinished: true } : prev);
            queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
          } catch (error) {
            const current = activeTrip?.visitedIndices || [];
            const skipped = activeTrip?.skipped_indices || [];
            await saveLocally(
              tripId, 
              current, 
              skipped, 
              activeTrip?.totalBudget, 
              activeTrip?.archivedSpendings, 
              true
            );
            
            setActiveTrip(prev => prev ? { ...prev, isFinished: true } : prev);
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
