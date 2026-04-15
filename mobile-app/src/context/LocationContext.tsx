import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { LocationContextValue, LocationData, AlertType } from "@/src/types";
import SafarAlert from "@/src/components/ui/SafarAlert";

const LocationContext = createContext<LocationContextValue | null>(null);

const LOCATION_CACHE_KEY = "safar_user_location";

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectionCount, setRejectionCount] = useState(0);
  const [gpsEnabled, setGpsEnabled] = useState(true);

  // Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("info");

  useEffect(() => {
    const initLocation = async () => {
      try {
        const cached = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
        if (cached) {
          setCurrentLocation(JSON.parse(cached));
        }
        
        const isEnabled = await Location.hasServicesEnabledAsync();
        setGpsEnabled(isEnabled);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    initLocation();

    // Periodically check GPS status
    const interval = setInterval(async () => {
      const isEnabled = await Location.hasServicesEnabledAsync();
      setGpsEnabled(isEnabled);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateLocation = async (locationData: LocationData | null): Promise<void> => {
    setCurrentLocation(locationData);
    if (locationData) {
      await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationData));
    } else {
      await AsyncStorage.removeItem(LOCATION_CACHE_KEY);
    }
  };

  const showAlert = (title: string, message: string, type: AlertType = "info") => {
    // Small timeout to ensure OS permission dialog is closed
    setTimeout(() => {
      setAlertTitle(title);
      setAlertMessage(message);
      setAlertType(type);
      setAlertVisible(true);
    }, 500);
  };

  const refreshGPS = async (): Promise<LocationData | null> => {
    try {
      setLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        if (rejectionCount === 0) {
          showAlert(
            "Location Access",
            "Safar needs your location to provide better recommendations and detect your starting city automatically.",
            "info"
          );
          setRejectionCount(1);
          return null;
        } else {
          return null;
        }
      }

      setRejectionCount(0);

      const isEnabled = await Location.hasServicesEnabledAsync();
      setGpsEnabled(isEnabled);
      if (!isEnabled) {
        showAlert(
          "GPS Disabled", 
          "Please enable location services (GPS) in your device settings for better accuracy.",
          "error"
        );
        return null;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Centralized Geocoding
      const [address] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      let newData: LocationData;

      if (address) {
        const city = address.city || address.name || address.region || "Current Location";
        newData = {
          name: city,
          label: `${city}${address.region ? ", " + address.region : ""}`,
          fullAddress: `${address.name ? address.name + ", " : ""}${address.city ? address.city + ", " : ""}${address.region ? address.region + ", " : ""}${address.country || ""}`,
          country: address.country || "",
          countryCode: address.isoCountryCode || "",
          coordinates: {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          },
          isLiveGPS: true,
        };
      } else {
        newData = {
          name: "Current Location",
          label: "Current Location",
          fullAddress: "",
          country: "",
          countryCode: "",
          coordinates: {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          },
          isLiveGPS: true,
        };
      }

      await updateLocation(newData);
      return newData;
    } catch (error) {
      // Silent fail

      return null;
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
        gpsEnabled,
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
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextValue => {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocation must be used within a LocationProvider");
  return context;
};

export { LocationContext };
