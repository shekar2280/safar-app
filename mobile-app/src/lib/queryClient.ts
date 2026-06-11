import { QueryClient, onlineManager } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60 * 60 * 1000,
      gcTime: 7 * 24 * 60 * 60 * 1000,
      networkMode: "offlineFirst",
    },
    mutations: {
      networkMode: "offlineFirst",
      retry: 3,
      retryDelay: (attempt) =>
        Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000),
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "SAFAR_QUERY_CACHE",
  throttleTime: 1000,
  serialize: (client) => {
    try {
      const cloned = JSON.parse(JSON.stringify(client));
      if (cloned && Array.isArray(cloned.queries)) {
        cloned.queries = cloned.queries.filter(
          (q: any) => q.queryKey && q.queryKey[0] !== "trendingPlaces"
        );

        cloned.queries.forEach((q: any) => {
          if (
            q.queryKey &&
            q.queryKey[0] === "trips" &&
            q.queryKey[1] === "list"
          ) {
            if (Array.isArray(q.state?.data)) {
              q.state.data = q.state.data.map((trip: any) => {
                if (trip.isFinished && !trip.isActive) {
                  const { tripPlan, ...rest } = trip;
                  return rest;
                }
                return trip;
              });
            }
          }
        });
      }
      return JSON.stringify(cloned);
    } catch (e) {
      return JSON.stringify(client);
    }
  },
});
