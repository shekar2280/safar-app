import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { LocationContextValue, LocationData, AlertType } from "@/src/types";
import SafarAlert from "@/src/components/ui/SafarAlert";
import * as Sentry from "@sentry/react-native";

const LocationContext = createContext<LocationContextValue | null>(null);

const LOCATION_CACHE_KEY = "safar_user_location";

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectionCount, setRejectionCount] = useState(0);
  const [gpsEnabled, setGpsEnabled] = useState(true);

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
      } catch (err) {
        Sentry.addBreadcrumb({
          category: 'location',
          message: 'Failed to initialize location cache',
          level: 'warning',
        });
      } finally {
        setLoading(false);
      }
    };
    initLocation();

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
      
      let { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== "granted") {
        const request = await Location.requestForegroundPermissionsAsync();
        status = request.status;
      }
      
      if (status !== "granted") {
        showAlert(
          "Permission Required",
          "Location access is needed to detect your city. Please enable it in your device settings.",
          "error"
        );
        return null;
      }

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
      Sentry.captureException(error, {
        extra: { context: "LocationContext:refreshGPS" }
      });
      showAlert(
        "Location Error",
        "Something went wrong while detecting your location. Please try manually selecting your city.",
        "error"
      );
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
