import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry once on failure before showing error
      retry: 1,
      // Don't refetch when component remounts if data is fresh
      refetchOnMount: true,
      // Refetch when the user tabs back into the app
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect by default (trips are not time-critical)
      refetchOnReconnect: true,
    },
  },
});
