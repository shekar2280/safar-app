import AsyncStorage from "@react-native-async-storage/async-storage";
import { ACTIVE_TRIP_CACHE_KEY, SEVEN_DAYS_MS } from "@/src/constants/config";
import { ActiveTripCachePayload } from "@/src/constants/types";

export const ActiveTripCacheManager = {
  async save(tripData: any): Promise<void> {
    if (!tripData || !tripData.id) return;
    try {
      const payload: ActiveTripCachePayload = {
        tripData,
        cachedAt: Date.now(),
      };
      await AsyncStorage.setItem(ACTIVE_TRIP_CACHE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error("Failed to save active trip cache:", error);
    }
  },

  async get(): Promise<any | null> {
    try {
      const json = await AsyncStorage.getItem(ACTIVE_TRIP_CACHE_KEY);
      if (!json) return null;

      const payload: ActiveTripCachePayload = JSON.parse(json);
      const isExpired = Date.now() - payload.cachedAt > SEVEN_DAYS_MS;

      if (isExpired) {
        await this.clear();
        return null;
      }

      return payload.tripData;
    } catch (error) {
      console.error("Failed to get active trip cache:", error);
      return null;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACTIVE_TRIP_CACHE_KEY);
    } catch (error) {
      console.error("Failed to clear active trip cache:", error);
    }
  }
};
