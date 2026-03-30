import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { LocationContextValue, LocationData } from "@/src/types/interfaces";

const LocationContext = createContext<LocationContextValue | null>(null);

const LOCATION_CACHE_KEY = "safar_user_location";

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initLocation = async () => {
      try {
        const cached = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
        if (cached) {
          setCurrentLocation(JSON.parse(cached));
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    initLocation();
  }, []);

  const updateLocation = async (locationData: LocationData | null): Promise<void> => {
    setCurrentLocation(locationData);
    if (locationData) {
      await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationData));
    } else {
      await AsyncStorage.removeItem(LOCATION_CACHE_KEY);
    }
  };

  const refreshGPS = async (): Promise<LocationData> => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission denied");
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newData: LocationData = {
        name: "",
        label: "",
        fullAddress: "",
        country: "",
        countryCode: "",
        coordinates: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        },
      };

      await updateLocation(newData);
      return newData;
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

export const useLocation = (): LocationContextValue => {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocation must be used within a LocationProvider");
  return context;
};

export { LocationContext };
