import { useState, useCallback, useEffect } from "react";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";

import { GeoCoords } from "../types";
import * as Sentry from "@sentry/react-native";

export const useLocationTracker = () => {
  const [userLocation, setUserLocation] = useState<GeoCoords | null>(null);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [isLocationBlocked, setIsLocationBlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshLocation = useCallback(async (isRetry = false) => {
    try {
      const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();

      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation(loc.coords);
        setShowLocationAlert(false);
        setLoading(false);
        setIsLocationBlocked(false);
        return;
      }

      if (!canAskAgain && status === "denied") {
        setIsLocationBlocked(true);
        setShowLocationAlert(true);
        setLoading(false);
        return;
      }

      const response = await Location.requestForegroundPermissionsAsync();

      if (response.status === "granted") {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation(loc.coords);
        setShowLocationAlert(false);
        setIsLocationBlocked(false);
      } else {
        if (!isRetry || !response.canAskAgain) {
          setShowLocationAlert(true);
          setIsLocationBlocked(!response.canAskAgain);
        }
      }
      setLoading(false);
    } catch (e) {
      Sentry.captureException(e, { extra: { context: "useLocationTracker:refreshLocation" } });
      setLoading(false);
      setShowLocationAlert(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshLocation();
    }, [refreshLocation])
  );

  return {
    userLocation,
    showLocationAlert,
    isLocationBlocked,
    loading,
    refreshLocation,
    setShowLocationAlert,
  };
};
