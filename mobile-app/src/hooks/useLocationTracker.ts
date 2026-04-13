import { useState, useCallback, useEffect } from "react";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";

import { GeoCoords } from "../types/interfaces";

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
      console.error("[Location Tracker] Error:", e);
      setLoading(false);
      setShowLocationAlert(true);
    }
  }, []);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startWatching = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== "granted") return;

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 10,
          },
          (location) => {
            setUserLocation(location.coords);
            setShowLocationAlert(false);
            setIsLocationBlocked(false);
          },
        );
      } catch (err) {
        console.error("[Location Watcher] Error:", err);
      }
    };

    startWatching();

    return () => {
      if (subscription) subscription.remove();
    };
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
