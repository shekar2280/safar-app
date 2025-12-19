import {
  View,
  Text,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "../../../constants/Colors";
import { TrendingTripContext } from "../../../context/TrendingTripContext";
import * as Location from "expo-location";
import Autocomplete from "react-native-autocomplete-input";
import { generateTripPlan } from "../../../config/AiModel";
import { TRENDING_PLACE_PROMPT } from "../../../constants/Options";
import {
  doc,
  setDoc,
  query,
  collection,
  where,
  getDocs,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../../../config/FirebaseConfig";

const { width, height } = Dimensions.get("window");

export default function SearchDeparture() {
  const navigation = useNavigation();
  const router = useRouter();
  const { trendingData, setTrendingData } = useContext(TrendingTripContext);
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;
  const [tripType, setTripType] = useState("Oneway");
  const [location, setLocation] = useState(null);
  const [state, setState] = useState({
    loading: true,
    manualMode: false,
    query: "",
    results: [],
  });
  const [retryCount, setRetryCount] = useState(0);

  function normalizeLocation(data) {
    const address = data.address || {};
    const city =
      address.city || address.town || address.village || address.state_district;
    const state = address.state;
    const country = address.country;

    return {
      city,
      state,
      country,
      normalizedKey: `${city?.toLowerCase()}-${state?.toLowerCase()}`,
      label: `${city}, ${state}`,
      fullAddress: data.display_name || "",
    };
  }

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

        const normalized = normalizeLocation(data);

        const locationInfo = {
          ...normalized,
          coordinates: { lat: latitude, lon: longitude },
        };

        setLocation(locationInfo);
        setState((s) => ({ ...s, loading: false, manualMode: false }));
      } catch (err) {
        // console.log("GPS failed → switching to manual:", err.message);
        setState((s) => ({ ...s, loading: false, manualMode: true }));
      }
    })();
  }, []);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchTrendingPlaces = async (locationInfo) => {
  let attempts = 0;
  const maxAttempts = 3;
  let success = false;
  let aiResp = null;

  try {
    const snapshot = await getDoc(
      doc(db, "TrendingPlaces", locationInfo.normalizedKey)
    );
    if (snapshot.exists()) {
      const cachedData = snapshot.data().trendingPlaces;
      setTrendingData((prev) => ({ ...prev, trendingPlaces: cachedData }));

      return cachedData;
    }

    const prompt = TRENDING_PLACE_PROMPT.replace(
      /{location}/g, 
      locationInfo.label
    );

    while (attempts < maxAttempts && !success) {
      try {
        setRetryCount(attempts); 
        const rawResp = await generateTripPlan(prompt);
        aiResp = typeof rawResp === 'string' ? JSON.parse(rawResp) : rawResp;
        success = true; 
      } catch (err) {
        attempts++;
        if (attempts < maxAttempts) {
          const waitTime = attempts * 2000;
          await delay(waitTime);
        } else {
          throw err; 
        }
      }
    }
    setTrendingData((prev) => ({ ...prev, trendingPlaces: aiResp }));

    await setDoc(doc(db, "TrendingPlaces", locationInfo.normalizedKey), {
      userEmail: user.email,
      city: locationInfo.city,
      state: locationInfo.state,
      country: locationInfo.country,
      normalizedKey: locationInfo.normalizedKey,
      trendingPlaces: aiResp,
      createdAt: serverTimestamp(),
    });

    return aiResp;
  } catch (error) {
    return [];
  }
};

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

  const handleSelect = async (item) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${item.lat}&lon=${item.lon}&format=json`,
        {
          headers: {
            "User-Agent": "safar-travel-app",
            "Accept-Language": "en",
          },
        }
      );
      const data = await res.json();
      const normalized = normalizeLocation(data);

      const locationInfo = {
        ...normalized,
        coordinates: { lat: item.lat, lon: item.lon },
      };

      setLocation(locationInfo);
      setState((s) => ({ ...s, query: locationInfo.label, results: [] }));
    } catch (err) {
      console.error("Failed to normalize manual selection:", err);
    }
  };

  const handleContinue = async () => {
    if (!location) return;

    setLoading(true);

    setTrendingData((prev) => ({
      ...prev,
      departureInfo: location,
      tripType: tripType,
    }));

    await fetchTrendingPlaces(location);

    setLoading(false);
    router.push("/discover-trip/trending-places/select-destination");
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
            <Text style={{ fontSize: width * 0.04 }}>
              {location.fullAddress}
            </Text>
          )}
        </>
      )}

      <TouchableOpacity
        onPress={handleContinue}
        disabled={loading}
        style={{
          marginTop: height * 0.04,
          marginBottom: height * 0.04,
          backgroundColor: Colors.PRIMARY,
          paddingVertical: 14,
          borderRadius: width * 0.025,
          alignItems: "center",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text
            style={{
              fontSize: width * 0.045,
              fontFamily: "outfitBold",
              color: "white",
            }}
          >
            Continue
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
