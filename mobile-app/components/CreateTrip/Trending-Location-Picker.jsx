import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import * as Location from "expo-location";
import Autocomplete from "react-native-autocomplete-input";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

export default function TrendingLocationPicker({
  title,
  onLocationChange,
  placeholder = "Search city...",
}) {
  const [state, setState] = useState({
    loading: true,
    manualMode: false,
    query: "",
    results: [],
  });

  const formatLocationData = (data, lat, lon) => {
    const address = data.address || {};

    let rawCity =
      address.city ||
      address.town ||
      address.village ||
      address.state_district ||
      "";

    let cleanCity = rawCity
      .replace(/City of /gi, "")
      .replace(/ City/gi, "")
      .replace(/ Greater/gi, "")
      .replace(/Greater /gi, "")
      .replace(/ District/gi, "")
      .replace(/ Ward/gi, "")
      .replace(/ Zone \d+/gi, "")
      .trim();

    const aliases = {
      "mumbai city": "Mumbai",
      "bombay": "Mumbai",
      "new york city": "New York",
      "bengaluru city": "Bengaluru",
    };

    const finalCity = aliases[cleanCity.toLowerCase()] || cleanCity;
    const stateName = address.state || "";
    const country = address.country || "";

    return {
      name: finalCity,
      city: finalCity,
      state: stateName,
      country,
      normalizedKey: finalCity.toLowerCase().trim(), 
      label: `${finalCity}, ${stateName}`,
      fullAddress: data.display_name || "",
      coordinates: { lat, lon },
    };
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status !== "granted") {
          const response = await Location.requestForegroundPermissionsAsync();
          status = response.status;
        }

        if (status !== "granted") {
          setState((s) => ({ ...s, loading: false, manualMode: true }));
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = loc.coords;

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
          {
            headers: {
              "User-Agent": "safar-travel-app",
              "Accept-Language": "en",
            },
          }
        );
        const data = await res.json();

        const formatted = formatLocationData(data, latitude, longitude);

        onLocationChange(formatted);

        setState((s) => ({
          ...s,
          loading: false,
          manualMode: false,
          query: data.display_name,
        }));
      } catch (err) {
        setState((s) => ({ ...s, loading: false, manualMode: true }));
      }
    })();
  }, []);

  useEffect(() => {
    if (state.query.length < 3 || !state.manualMode) {
      setState((s) => ({ ...s, results: [] }));
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${state.query}&format=json&addressdetails=1`,
          { headers: { "User-Agent": "safar-travel-app" } }
        );
        const data = await res.json();
        setState((s) => ({ ...s, results: data }));
      } catch (err) {
        console.error(err);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [state.query, state.manualMode]);

  const handleItemSelect = async (item) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${item.lat}&lon=${item.lon}&format=json&addressdetails=1`,
        { headers: { "User-Agent": "safar-travel-app" } }
      );
      const data = await res.json();
      
      const formatted = formatLocationData(data, item.lat, item.lon);
      onLocationChange(formatted);

      setState((s) => ({ 
        ...s, 
        query: item.display_name, 
        results: [] 
      }));
    } catch (err) {
      console.error("Selection normalization failed:", err);
    }
  };

  const clearInput = () => {
    setState((s) => ({ ...s, query: "", results: [] }));
    onLocationChange(null);
  };

  return (
    <View style={styles.wrapper}>
      {state.manualMode ? (
        <View style={styles.manualContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.autocompleteWrapper}>
            <Autocomplete
              data={state.results}
              defaultValue={state.query}
              autoCorrect={false}
              onChangeText={(text) => setState((s) => ({ ...s, query: text }))}
              placeholder={placeholder}
              containerStyle={styles.autocompleteContainer}
              renderTextInput={(props) => (
                <View style={styles.searchBar}>
                  <TextInput {...props} style={styles.inputStyle} />
                  {state.query.length > 0 && (
                    <TouchableOpacity
                      onPress={clearInput}
                      style={styles.clearButton}
                    >
                      <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              listContainerStyle={styles.suggestionList}
              flatListProps={{
                keyExtractor: (item) => String(item.place_id),
                keyboardShouldPersistTaps: "always",
                renderItem: ({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleItemSelect(item)}
                    style={styles.suggestionItem}
                  >
                    <Ionicons name="location-outline" size={18} color="#777" />
                    <Text style={styles.suggestionText} numberOfLines={1}>
                      {item.display_name}
                    </Text>
                  </TouchableOpacity>
                ),
              }}
            />
          </View>
        </View>
      ) : (
        <View style={[styles.statusCard, !state.loading && styles.activeCard]}>
          {state.loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={Colors.PRIMARY} />
              <Text style={styles.loadingText}>Detecting location...</Text>
            </View>
          ) : (
            <View>
              <View style={styles.locationHeader}>
                <View style={styles.iconCircle}>
                  <Ionicons name="navigate" size={20} color="white" />
                </View>
                <Text style={styles.label}>LIVE DETECTION</Text>
              </View>
              <Text style={styles.addressText} numberOfLines={3}>
                {state.query}
              </Text>
              <TouchableOpacity
                onPress={() => setState((s) => ({ ...s, manualMode: true }))}
                style={styles.changeButton}
              >
                <Text style={styles.changeButtonText}>
                  Not correct? Edit manually
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%", minHeight: 180 },
  title: {
    fontSize: 28,
    fontFamily: "outfitBold",
    marginBottom: 20,
    color: "#000",
  },
  manualContainer: { zIndex: 1000, elevation: 1000 },
  autocompleteWrapper: {
    position: "relative",
    width: "100%",
    zIndex: 100,
    height: 55,
  },
  autocompleteContainer: { width: "100%", position: "absolute", zIndex: 10 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    borderColor: "#CCC",
    backgroundColor: "white",
    paddingHorizontal: 12,
    height: 55,
  },
  inputStyle: { flex: 1, height: "100%", fontFamily: "outfit", fontSize: 15 },
  clearButton: { padding: 5 },
  statusCard: {
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    padding: 20,
    minHeight: 160,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  activeCard: {
    backgroundColor: "#FFF",
    borderColor: Colors.PRIMARY,
    borderStyle: "solid",
    elevation: 4,
  },
  center: { alignItems: "center" },
  loadingText: { marginTop: 15, fontFamily: "outfit", color: "#666" },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircle: {
    backgroundColor: Colors.PRIMARY,
    padding: 6,
    borderRadius: 50,
    marginRight: 10,
  },
  label: {
    fontFamily: "outfitBold",
    fontSize: 12,
    color: Colors.PRIMARY,
    letterSpacing: 1,
  },
  addressText: {
    fontSize: 16,
    fontFamily: "outfit",
    color: "#333",
    lineHeight: 22,
  },
  changeButton: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  changeButtonText: {
    color: "#777",
    fontFamily: "outfit",
    fontSize: 13,
    textDecorationLine: "underline",
  },
  suggestionList: {
    backgroundColor: "white",
    elevation: 5,
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 250,
    borderWidth: 1,
    borderColor: "#eee",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  suggestionText: { marginLeft: 10, fontSize: 14, color: "#444" },
});