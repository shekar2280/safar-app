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

import { Colors, useThemeColors } from "@/src/constants/colors";
import { useTheme } from "@/src/context/ThemeContext";
import { LocationData, LocationPickerProps } from "@/src/types/interfaces";

const { width } = Dimensions.get("window");

export default function LocationPicker({
  onLocationChange,
  placeholder = "Where are you starting from?",
  value,
}: LocationPickerProps & { value?: LocationData | null }) {
  const { updateLocation, refreshGPS } = useLocation();
  const colors = useThemeColors();
  const { isDark } = useTheme();

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
      const newData = await refreshGPS();
      if (newData) {
        handleLocationSelect(newData);
      }
    } catch (e: any) {
      console.log("detectCurrentLocation error:", e);
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
      <View style={[styles.inputCapsule, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.035)" }]}>
        <View style={styles.labelSection}>
          <Text style={[styles.label, { color: colors.GOLD }]}>FROM</Text>
        </View>
        <TextInput
          style={[styles.inputStyle, { color: colors.TEXT }]}
          value={displayValue}
          editable={false}
          placeholder={loading ? "Locating..." : placeholder}
          placeholderTextColor={colors.MUTED_TEXT}
        />
        <View style={styles.actionSection}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.GOLD} />
          ) : (
            <View style={styles.btnRow}>
              {displayValue.length > 0 && (
                <TouchableOpacity onPress={clearInput} style={styles.iconBtn}>
                  <Ionicons name="close-circle" size={18} color={colors.MUTED_TEXT} />
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={detectCurrentLocation} style={styles.iconBtn}>
                <Ionicons name="locate" size={20} color={colors.GOLD} />
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
    height: 65,
    borderRadius: 22,
    paddingHorizontal: 20,
  },
  labelSection: { width: 45 },
  label: {
    fontFamily: "outfitBold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  inputStyle: {
    flex: 1,
    fontFamily: "outfitBold",
    fontSize: 17,
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
