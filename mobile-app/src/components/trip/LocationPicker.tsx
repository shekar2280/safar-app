import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
} from "react-native";
import * as Location from "expo-location";
import Autocomplete from "react-native-autocomplete-input";
const AutocompleteInput = Autocomplete as any;
import { Ionicons } from "@expo/vector-icons";
import { useLocation } from "@/src/context/LocationContext";
import { Colors } from "@/src/constants/colors";
import { LocationData, LocationPickerProps, NominatimResult } from "@/src/types/interfaces";

const { width } = Dimensions.get("window");

interface PickerState {
  loading: boolean;
  query: string;
  results: NominatimResult[];
  selected: LocationData | null;
}

export default function LocationPicker({
  title,
  onLocationChange,
  placeholder = "Search city...",
}: LocationPickerProps) {
  const { currentLocation, updateLocation } = useLocation();
  const [state, setState] = useState<PickerState>({
    loading: !currentLocation,
    query: currentLocation?.name || "",
    results: [],
    selected: currentLocation || null,
  });

  useEffect(() => {
    if (currentLocation && onLocationChange) {
      onLocationChange(currentLocation);
    }
  }, [currentLocation]);

  const formatLocationData = (data: NominatimResult, lat: number, lon: number): LocationData => {
    const address = data.address || {};
    let rawCity = address.city || address.town || address.village || address.state_district || "";
    let cleanCity = rawCity
      .replace(/City of /gi, "")
      .replace(/ City/gi, "")
      .replace(/ Greater/gi, "")
      .replace(/Greater /gi, "")
      .replace(/ District/gi, "")
      .replace(/ Ward/gi, "")
      .replace(/ Zone \d+/gi, "")
      .trim();

    const aliases: Record<string, string> = {
      "mumbai city": "Mumbai",
      bombay: "Mumbai",
      "new york city": "New York",
      "bengaluru city": "Bengaluru",
    };

    const finalCity = aliases[cleanCity.toLowerCase()] || cleanCity;
    const stateName = address.state || "";
    const countryCode = address.country_code || "";
    const countryName = address.country || "";

    return {
      name: finalCity,
      label: `${finalCity}, ${stateName}`,
      fullAddress: data.display_name || "",
      country: countryName,
      countryCode,
      coordinates: { lat, lon },
    };
  };

  useEffect(() => {
    if (currentLocation) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    (async () => {
      try {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status !== "granted") {
          const response = await Location.requestForegroundPermissionsAsync();
          status = response.status;
        }
        if (status !== "granted") {
          setState((s) => ({ ...s, loading: false }));
          return;
        }

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = loc.coords;

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
          { headers: { "User-Agent": "safar-travel-app", "Accept-Language": "en" } }
        );
        const data: NominatimResult = await res.json();
        const formatted = formatLocationData(data, latitude, longitude);

        updateLocation(formatted);

        if (onLocationChange) onLocationChange(formatted);
        setState((s) => ({ ...s, loading: false, query: formatted.name, selected: formatted }));
      } catch {
        setState((s) => ({ ...s, loading: false }));
      }
    })();
  }, []);

  useEffect(() => {
    if (state.query.length < 3 || state.selected) {
      if (!state.selected) setState((s) => ({ ...s, results: [] }));
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${state.query}&format=json&addressdetails=1`,
          { headers: { "User-Agent": "safar-travel-app" } }
        );
        const data: NominatimResult[] = await res.json();
        setState((s) => ({ ...s, results: data }));
      } catch {
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [state.query]);

  const handleItemSelect = async (item: NominatimResult) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${item.lat}&lon=${item.lon}&format=json&addressdetails=1`,
        { headers: { "User-Agent": "safar-travel-app" } }
      );
      const data: NominatimResult = await res.json();
      const formatted = formatLocationData(data, parseFloat(item.lat), parseFloat(item.lon));

      updateLocation(formatted);

      if (onLocationChange) onLocationChange(formatted);
      setState((s) => ({ ...s, query: formatted.name, results: [], selected: formatted }));
    } catch {
    }
  };

  const clearInput = () => {
    setState((s) => ({ ...s, query: "", results: [], selected: null }));
    onLocationChange(null);
  };

  return (
    <View style={styles.wrapper}>
      <AutocompleteInput
        data={state.results}
        defaultValue={state.query}
        autoCorrect={false}
        onChangeText={(text: string) => {
          setState((s) => ({ ...s, query: text, selected: null }));
          onLocationChange(null);
        }}
        placeholder={state.loading ? "Locating..." : placeholder}
        containerStyle={styles.autocompleteContainer}
        inputContainerStyle={{ borderWidth: 0 }}
        listStyle={{ borderWidth: 0 }}
        renderTextInput={(props: any) => (
          <View style={styles.inputCapsule}>
            <View style={styles.labelSection}>
              <Text style={styles.label}>FROM</Text>
            </View>
            <TextInput
              {...props}
              style={styles.inputStyle}
              editable={!state.loading}
              placeholderTextColor={Colors.GRAY}
              selectionColor={Colors.SECONDARY}
            />
            <View style={styles.actionSection}>
              {state.loading ? (
                <ActivityIndicator size="small" color={Colors.SECONDARY} />
              ) : state.query.length > 0 ? (
                <TouchableOpacity onPress={clearInput}>
                  <Ionicons name="close-circle" size={20} color={Colors.MUTED_TEXT} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}
        listContainerStyle={styles.suggestionList}
        flatListProps={{
          scrollEnabled: false,
          nestedScrollEnabled: true,
          keyExtractor: (item: NominatimResult) => String(item.place_id),
          renderItem: ({ item }: { item: NominatimResult }) => {
            const [mainName, ...rest] = item.display_name.split(",");
            return (
              <TouchableOpacity
                onPress={() => handleItemSelect(item)}
                style={styles.suggestionItem}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="location" size={14} color={Colors.PRIMARY} />
                </View>
                <View style={styles.textWrap}>
                  <Text style={styles.mainText} numberOfLines={1}>{mainName.trim()}</Text>
                  <Text style={styles.subText} numberOfLines={1}>{rest.join(",").trim()}</Text>
                </View>
              </TouchableOpacity>
            );
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%", zIndex: 1000, height: 75 },
  autocompleteContainer: { width: "100%", position: "absolute", zIndex: 10, borderWidth: 0 },
  inputCapsule: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.035)",
    height: 65,
    borderRadius: 22,
    paddingHorizontal: 20,
  },
  labelSection: { width: 55 },
  label: {
    fontFamily: "outfitBold",
    fontSize: 10,
    color: Colors.SECONDARY,
    letterSpacing: 1.5,
  },
  inputStyle: {
    flex: 1,
    fontFamily: "outfitBold",
    fontSize: 18,
    color: Colors.PRIMARY,
    padding: 0,
    height: "100%",
    borderWidth: 0,
  },
  actionSection: { paddingLeft: 10 },
  suggestionList: {
    backgroundColor: Colors.WHITE,
    borderRadius: 24,
    marginTop: 10,
    maxHeight: 280,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.WHITE,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.03)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textWrap: { flex: 1 },
  mainText: {
    fontFamily: "outfitBold",
    fontSize: 15,
    color: Colors.PRIMARY,
  },
  subText: {
    fontFamily: "outfit",
    fontSize: 12,
    color: Colors.MUTED_TEXT,
    marginTop: 1,
  },
});
