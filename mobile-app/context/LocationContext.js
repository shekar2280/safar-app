import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

const LocationContext = createContext();

const LOCATION_CACHE_KEY = "safar_user_location";

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from cache
  useEffect(() => {
    const initLocation = async () => {
      try {
        const cached = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
        if (cached) {
          setCurrentLocation(JSON.parse(cached));
        }
      } catch (e) {
        console.error("Failed to load location cache", e);
      } finally {
        setLoading(false);
      }
    };
    initLocation();
  }, []);

  // Update logic with persistence
  const updateLocation = async (locationData) => {
    setCurrentLocation(locationData);
    if (locationData) {
      await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationData));
    } else {
      await AsyncStorage.removeItem(LOCATION_CACHE_KEY);
    }
  };

  const refreshGPS = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission denied");
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newData = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        timestamp: Date.now(),
        source: "gps",
      };

      await updateLocation(newData);
      return newData;
    } catch (e) {
      console.error("GPS Refresh Error:", e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        updateLocation,
        refreshGPS,
        loading,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocation must be used within a LocationProvider");
  return context;
};
