import {
  View,
  Text,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { CreateTripContext } from "../../context/CreateTripContext";
import * as Location from "expo-location";
import Autocomplete from "react-native-autocomplete-input";

const { width, height } = Dimensions.get("window");

export default function SearchDeparture() {
  const navigation = useNavigation();
  const router = useRouter();
  const { setTripData } = useContext(CreateTripContext);

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
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") throw new Error("Permission denied");

        const loc = await Location.getCurrentPositionAsync({});
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

        setTripData((prev) => ({
          ...prev,
          departureInfo: {
            name: data.display_name || "Current Location",
            coordinates: { lat: latitude, lon: longitude },
          },
        }));

        router.push("/create-trip/search-destination");
      } catch (err) {
        console.log("GPS failed → switching to manual:", err.message);
        setState((s) => ({ ...s, loading: false, manualMode: true }));
      }
    })();
  }, []);

  // Autocomplete search
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
    setTripData((prev) => ({
      ...prev,
      departureInfo: {
        name: item.display_name,
        coordinates: { lat: item.lat, lon: item.lon },
      },
    }));
    router.push("/create-trip/search-destination");
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
      {state.manualMode ? (
        <>
          <Text
            style={{
              fontSize: width * 0.065,
              fontFamily: "outfitBold",
              marginBottom: height * 0.015,
            }}
          >
            Enter your departure location:
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
              keyExtractor: (item) => item.place_id,
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
        </>
      ) : (
        <>
          <Text
            style={{
              fontSize: width * 0.065,
              fontFamily: "outfitBold",
              marginBottom: height * 0.015,
            }}
          >
            Detecting your location...
          </Text>
          {state.loading && (
            <ActivityIndicator size="large" color={Colors.PRIMARY} />
          )}
        </>
      )}
    </View>
  );
}
