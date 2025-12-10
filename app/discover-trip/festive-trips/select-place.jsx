import {
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "../../../constants/Colors";
import { FestiveTripContext } from "../../../context/FestiveTripContext";
import * as Location from "expo-location";
import Autocomplete from "react-native-autocomplete-input";

const { width, height } = Dimensions.get("window");

export default function SearchPlace() {
  const navigation = useNavigation();
  const router = useRouter();
  const [location, setLocation] = useState(null);
  const [tripType, setTripType] = useState("Oneway");
  const { setFestiveData } = useContext(FestiveTripContext);

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

        setLocation({
          name: data.display_name || "Current Location",
          coordinates: { lat: latitude, lon: longitude },
        });
        setState((s) => ({ ...s, loading: false, manualMode: false }));
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
    setLocation({
      name: item.display_name,
      coordinates: { lat: item.lat, lon: item.lon },
    });
    setState((s) => ({ ...s, results: [] }));
  };

  const handleContinue = () => {
    if (!location) return;

    setFestiveData((prev) => ({
      ...prev,
      departureInfo: location,
      tripType,
    }));

    router.push("/discover-trip/festive-trips/select-traveler");
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
          {!state.loading && location && (
            <Text style={{ fontSize: width * 0.04 }}>{location.name}</Text>
          )}
        </>
      )}
      
      {location && (
        <TouchableOpacity
          onPress={handleContinue}
          style={{
            marginTop: height * 0.04,
            backgroundColor: Colors.PRIMARY,
            paddingVertical: 14,
            borderRadius: width * 0.025,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: width * 0.045,
              fontFamily: "outfitBold",
              color: "white",
            }}
          >
            Continue
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
