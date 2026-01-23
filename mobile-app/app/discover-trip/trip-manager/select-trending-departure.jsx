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
import { Colors } from "../../../constants/Colors";
import { CommonTripContext } from "../../../context/CommonTripContext";
import { generateTripPlan } from "../../../config/AiModel";
import { TRENDING_PLACE_PROMPT } from "../../../constants/Options";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db } from "../../../config/FirebaseConfig";
import TrendingLocationPicker from "../../../components/CreateTrip/Trending-Location-Picker";
import TripTypeToggle from "../../../components/CreateTrip/TripTypeToggle";

const { width, height } = Dimensions.get("window");

export default function SearchDeparture() {
  const navigation = useNavigation();
  const router = useRouter();
  const { tripDetails, setTripDetails } = useContext(CommonTripContext);
  const [loading, setLoading] = useState(false);
  const [tripType, setTripType] = useState("Oneway");
  const [location, setLocation] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "Departure",
    });
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
        setTripDetails((prev) => ({ ...prev, trendingPlaces: cachedData }));
        return cachedData;
      }

      const prompt = TRENDING_PLACE_PROMPT.replace(
        /{location}/g,
        locationInfo.label
      );

      while (attempts < maxAttempts && !success) {
        try {
          const rawResp = await generateTripPlan(prompt);
          let cleanJson = rawResp;
          if (typeof rawResp === "string") {
            cleanJson = rawResp.replace(/```json|```/g, "").trim();
          }

          aiResp =
            typeof cleanJson === "string" ? JSON.parse(cleanJson) : cleanJson;

          success = true;
        } catch (err) {
          console.log(`Attempt ${attempts + 1} failed:`, err.message);
          attempts++;
          if (attempts < maxAttempts) {
            await delay(attempts * 2000);
          } else {
            throw err;
          }
        }
      }

      setTripDetails((prev) => ({ ...prev, trendingPlaces: aiResp }));

      await setDoc(doc(db, "TrendingPlaces", locationInfo.normalizedKey), {
        userEmail: user?.email,
        city: locationInfo.city,
        state: locationInfo.state,
        country: locationInfo.country,
        normalizedKey: locationInfo.normalizedKey,
        trendingPlaces: aiResp,
        createdAt: serverTimestamp(),
      });

      return aiResp;
    } catch (error) {
      console.error("AI Fetch Error:", error);
      return [];
    }
  };

  const handleContinue = async () => {
    if (!location) return;

    setLoading(true);

    setTripDetails((prev) => ({
      ...prev,
      departureInfo: location,
      tripType: tripType,
    }));

    await fetchTrendingPlaces(location);

    setLoading(false);
    router.push("/discover-trip/trip-manager/select-trending-destination");
  };

  return (
    <View style={styles.container}>
      <TripTypeToggle
        selectedType={tripType}
        onSelectType={(type) => setTripType(type)}
      />

      <TrendingLocationPicker
        title="Where from?"
        onLocationChange={(data) => setLocation(data)}
      />

      <TouchableOpacity
        onPress={handleContinue}
        disabled={loading || !location}
        style={[styles.continueBtn, (loading || !location) && { opacity: 0.6 }]}
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
  continueBtn: {
    position: "absolute",
    bottom: 40,
    left: width * 0.06,
    right: width * 0.06,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 35,
  },
  continueText: {
    fontSize: 18,
    fontFamily: "outfitBold",
    color: "white",
  },
});
