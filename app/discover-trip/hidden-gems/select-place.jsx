import {
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "../../../constants/Colors";
import { DiscoverTripContext } from "../../../context/DiscoverTripContext";
import * as Location from "expo-location";
import Autocomplete from "react-native-autocomplete-input";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function SearchPlace() {
  const navigation = useNavigation();
  const router = useRouter();
  const { discoverData, setDiscoverData } = useContext(DiscoverTripContext);
  const [loading, setLoading] = useState(false);
  const [tripType, setTripType] = useState("Oneway");
  const [location, setLocation] = useState(null);
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
      headerTitle: "Your Location",
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
              "User-Agent": "safar-travel-app (safar@app.com)",
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
        setState((s) => ({ ...s, loading: false, manualMode: false }));
      } catch (err) {
        console.log("GPS failed → switching to manual:", err.message);
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
          {
            headers: {
              "User-Agent": "safar-travel-app (safar@app.com)",
              "Accept-Language": "en",
            },
          }
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
    const selected = {
      name: item.display_name,
      coordinates: { lat: item.lat, lon: item.lon },
    };
    setLocation(selected);
    setState((s) => ({ ...s, query: item.display_name, results: [] }));
  };

  const handleContinue = () => {
    if (!location) return;
    setLoading(true);
    setDiscoverData((prev) => ({
      ...prev,
      departureInfo: location,
      tripType,
    }));
    setLoading(false);
    router.push("/discover-trip/hidden-gems/select-traveler");
  };
  
  return (
     <View
      style={{
        padding: width * 0.06,
        paddingTop: height * 0.12,
        backgroundColor: Colors.WHITE,
        flex: 1,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          marginBottom: height * 0.02,
          borderWidth: 2,
          borderRadius: width * 0.025,
          overflow: "hidden",
        }}
      >
        <TouchableOpacity
          onPress={() => setTripType("Oneway")}
          style={{
            flex: 1,
            backgroundColor: tripType === "Oneway" ? "black" : "white",
            paddingVertical: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: width * 0.045,
              fontFamily: "outfitBold",
              color: tripType === "Oneway" ? "white" : "black",
            }}
          >
            One-way Trip
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTripType("Round")}
          style={{
            flex: 1,
            backgroundColor: tripType === "Round" ? "black" : "white",
            paddingVertical: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: width * 0.045,
              fontFamily: "outfitBold",
              color: tripType === "Round" ? "white" : "black",
            }}
          >
            Round Trip
          </Text>
        </TouchableOpacity>
      </View>

      {state.manualMode ? (
        <View style={{ zIndex: 10 }}>
          <Text
            style={{
              fontSize: width * 0.065,
              fontFamily: "outfitBold",
              marginBottom: height * 0.015,
            }}
          >
            Enter your departure:
          </Text>
          <Autocomplete
            data={state.results}
            defaultValue={state.query}
            onChangeText={(text) => setState((s) => ({ ...s, query: text }))}
            placeholder="Search your city..."
            inputContainerStyle={{
              borderWidth: 2,
              borderRadius: width * 0.025,
              paddingHorizontal: width * 0.02,
            }}
            listContainerStyle={{
              backgroundColor: "white",
              elevation: 10,
              marginTop: height * 0.01,
            }}
            flatListProps={{
              keyExtractor: (item) => String(item.place_id),
              renderItem: ({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  style={{
                    paddingVertical: height * 0.015,
                    paddingHorizontal: width * 0.02,
                    borderBottomColor: "#ccc",
                    borderBottomWidth: 1,
                  }}
                >
                  <Text style={{ fontSize: width * 0.04 }}>
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
  title: {
    fontSize: width * 0.065,
    fontFamily: "outfitBold",
    marginBottom: height * 0.015,
    color: "#000",
  },
  statusCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    padding: 20,
    minHeight: 150,
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
    color: "#777",
    fontSize: 14,
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
  },
  continueText: {
    fontSize: 18,
    fontFamily: "outfitBold",
    color: "white",
  },
});
