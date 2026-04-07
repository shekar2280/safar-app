import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useLocation } from "@/src/context/LocationContext";

import { Colors } from "@/src/constants/colors";
import { LocationData, LocationPickerProps } from "@/src/types/interfaces";

const { width } = Dimensions.get("window");

export default function LocationPicker({
  onLocationChange,
  placeholder = "Where are you starting from?",
  value,
}: LocationPickerProps & { value?: LocationData | null }) {
  const { updateLocation } = useLocation();

  
  const [loading, setLoading] = useState(false);
  const [displayValue, setDisplayValue] = useState(value?.name || "");

  useEffect(() => {
    if (value) {
      setDisplayValue(value.name);
    }
  }, [value]);

  const handleLocationSelect = (loc: LocationData) => {
    updateLocation(loc);
    if (onLocationChange) onLocationChange(loc);
    setDisplayValue(loc.name);
  };

  const detectCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location permission is needed to detect your current city.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const city = address.city || address.name || "Unknown City";
        const locData: LocationData = {
          name: city,
          label: `${city}${address.region ? ", " + address.region : ""}`,
          fullAddress: `${address.name ? address.name + ", " : ""}${address.city ? address.city + ", " : ""}${address.region ? address.region + ", " : ""}${address.country || ""}`,
          country: address.country || "",
          countryCode: address.isoCountryCode || "",
          coordinates: {
            lat: location.coords.latitude,
            lon: location.coords.longitude
          }
        };
        handleLocationSelect(locData);
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to detect location");
    } finally {
      setLoading(false);
    }
  };



  const clearInput = () => {
    setDisplayValue("");
    onLocationChange(null);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputCapsule}>
        <View style={styles.labelSection}>
          <Text style={styles.label}>FROM</Text>
        </View>
        <TextInput
          style={styles.inputStyle}
          value={displayValue}
          editable={false}
          placeholder={loading ? "Locating..." : placeholder}
          placeholderTextColor={Colors.GRAY}
        />
        <View style={styles.actionSection}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.SECONDARY} />
          ) : (
            <View style={styles.btnRow}>
              {displayValue.length > 0 && (
                <TouchableOpacity onPress={clearInput} style={styles.iconBtn}>
                  <Ionicons name="close-circle" size={18} color={Colors.GRAY} />
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={detectCurrentLocation} style={styles.iconBtn}>
                <Ionicons name="locate" size={20} color={Colors.SECONDARY} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%", marginBottom: 10 },
  inputCapsule: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.035)",
    height: 65,
    borderRadius: 22,
    paddingHorizontal: 20,
  },
  labelSection: { width: 45 },
  label: {
    fontFamily: "outfitBold",
    fontSize: 10,
    color: Colors.SECONDARY,
    letterSpacing: 1.5,
  },
  inputStyle: {
    flex: 1,
    fontFamily: "outfitBold",
    fontSize: 17,
    color: Colors.PRIMARY,
    padding: 0,
    height: "100%",
  },
  actionSection: { paddingLeft: 10 },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
  helperText: {
    fontFamily: "outfit",
    fontSize: 10,
    color: Colors.MUTED_TEXT,
    marginTop: 6,
    marginLeft: 20,
    opacity: 0.7,
  }
});
