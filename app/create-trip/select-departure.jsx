import {
  View,
  Text,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { CreateTripContext } from "../../context/CreateTripContext";
import * as Location from "expo-location";
import Autocomplete from "react-native-autocomplete-input";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function SearchDeparture() {
  const navigation = useNavigation();
  const router = useRouter();
  const { setTripData } = useContext(CreateTripContext);

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const [state, setState] = useState({
    loading: true,
    manualMode: false,
    query: "",
    results: [],
  });

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "Current Location",
    });

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
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          {
            headers: {
              "User-Agent": "safar-travel-app",
              "Accept-Language": "en",
            },
          }
        );
        const data = await res.json();

        const detectedLocation = {
          name: data.display_name || "Current Location",
          coordinates: { lat: latitude, lon: longitude },
        };

        setLocation(detectedLocation);
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
    if (state.query.length < 3) {
      setState((s) => ({ ...s, results: [] }));
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${state.query}&format=json`,
          { headers: { "User-Agent": "safar-travel-app" } }
        );
        const data = await res.json();
        setState((s) => ({ ...s, results: data }));
      } catch (err) {
        console.error("Search failed:", err);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [state.query]);

  const handleSelect = (item) => {
    setLocation({
      name: item.display_name,
      coordinates: { lat: item.lat, lon: item.lon },
    });
    setState((s) => ({
      ...s,
      query: item.display_name,
      results: [],
    }));
  };

  const handleContinue = async () => {
    if (!location) return;
    setLoading(true);

    setTripData((prev) => ({
      ...prev,
      departureInfo: location,
    }));

    setLoading(false);
    router.push("/create-trip/search-destination");
  };

  return (
    <View style={styles.container}>
      {state.manualMode ? (
        <View style={{ zIndex: 10 }}>
          <Text style={styles.title}>Where are you starting from?</Text>
          <Autocomplete
            data={state.results}
            defaultValue={state.query}
            onChangeText={(text) => setState((s) => ({ ...s, query: text }))}
            placeholder="Type city or airport..."
            inputContainerStyle={styles.searchBar}
            listContainerStyle={styles.suggestionList}
            flatListProps={{
              keyExtractor: (item) => String(item.place_id),
              renderItem: ({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
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
      ) : (
        <View>
          <View
            style={[styles.statusCard, !state.loading && styles.activeCard]}
          >
            {state.loading ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
                <Text style={styles.loadingText}>
                  Detecting your location...
                </Text>
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
                  {location?.name}
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
        </View>
      )}

      <TouchableOpacity
        onPress={handleContinue}
        disabled={loading || !location}
        style={[
          styles.continueBtn,
          (loading || !location) && styles.disabledBtn,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.continueText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: width * 0.06,
    paddingTop: height * 0.12,
    backgroundColor: Colors.WHITE,
    flex: 1,
  },
  tripTypeToggle: {
    flexDirection: "row",
    marginBottom: 25,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: "#F0F0F0",
    overflow: "hidden",
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "white",
  },
  typeOptionActive: {
    backgroundColor: "black",
  },
  typeText: {
    fontFamily: "outfitBold",
    fontSize: 14,
    color: "black",
  },
  typeTextActive: {
    color: "white",
  },
  title: {
    fontSize: 28,
    fontFamily: "outfitBold",
    marginBottom: 20,
    color: "#000",
  },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  center: {
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontFamily: "outfit",
    color: "#666",
  },
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
  searchBar: {
    borderWidth: 1.5,
    borderRadius: 12,
    borderColor: "#CCC",
    paddingHorizontal: 10,
    height: 55,
    justifyContent: "center",
  },
  suggestionList: {
    backgroundColor: "white",
    elevation: 5,
    borderRadius: 10,
    marginTop: 5,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  suggestionText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#444",
  },
  continueBtn: {
    position: "absolute",
    bottom: 40,
    left: width * 0.06,
    right: width * 0.06,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 25,
  },
  disabledBtn: {
    opacity: 0.5,
    backgroundColor: "#CCC",
  },
  continueText: {
    fontSize: 18,
    fontFamily: "outfitBold",
    color: "white",
  },
});
