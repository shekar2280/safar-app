import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import LottieView from "lottie-react-native";
import { Colors } from "../../../constants/Colors";
import {
  AI_PROMPT,
  TRAVEL_AI_PROMPT,
  DiscoverTripImages,
  fallbackImages,
} from "../../../constants/Options";
import { generateTripPlan } from "../../../config/AiModel";
import { useRouter } from "expo-router";
import { auth, db } from "../../../config/FirebaseConfig";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  getDoc,
} from "firebase/firestore";
import { normalizeItinerary } from "../../../utils/normalizeItinerary";
import { DiscoverTripContext } from "../../../context/DiscoverTripContext";
import Constants from "expo-constants";

const { width, height } = Dimensions.get("window");

export default function GenerateTrip() {
  const { discoverData } = useContext(DiscoverTripContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const user = auth.currentUser;
  const hasGenerated = useRef(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const isTripReady =
      discoverData?.locationInfo?.title &&
      discoverData?.totalDays &&
      discoverData?.traveler?.title &&
      discoverData?.budget &&
      discoverData?.startDate &&
      discoverData?.endDate;

    if (isTripReady && user && !hasGenerated.current) {
      hasGenerated.current = true;
      generateAiTrip();
    } else if (!user) {
      setError("User not authenticated.");
    }
  }, [discoverData]);

  const cleanAiResponse = (rawText) => {
    if (!rawText) return "{}";
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) return jsonMatch[0].trim();
      return rawText.trim();
    } catch (e) {
      return "{}";
    }
  };

  function formatDateForMMT(dateStr, transportType) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    if (transportType === "flight") return `${day}/${month}/${year}`;
    if (transportType === "train") return `${year}${month}${day}`;
    return "";
  }

  const fetchUnsplashImage = async (locationName) => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          locationName + " famous place"
        )}&per_page=1&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${Constants.expoConfig.extra.UNSPLASH_API_KEY}`,
          },
        }
      );
      const data = await response.json();
      const raw = data?.results?.[0]?.urls?.raw;
      return raw
        ? `${raw}&auto=format&fit=crop&w=900&h=600&q=70`
        : fallbackImages[0];
    } catch (error) {
      return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    }
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const generateAiTrip = async () => {
    setLoading(true);
    setError(null);
    setRetryCount(0);

    const flightDate = formatDateForMMT(discoverData.startDate, "flight");
    const trainDate = formatDateForMMT(discoverData.startDate, "train");

    try {
      const normalizedKey = `${discoverData.locationInfo.title.toLowerCase()}-${
        discoverData.totalDays
      }-${discoverData.budget.toLowerCase()}`;
      const savedTripRef = doc(db, "SavedTripData", normalizedKey);
      const existingTrip = await getDoc(savedTripRef);

      let itineraryData;
      let finalImageUrl;
      let transportData;

      if (existingTrip.exists()) {
        const cachedData = existingTrip.data();
        itineraryData = cachedData.tripPlan;
        finalImageUrl = cachedData.imageUrl;
      } else {
        const FINAL_ITINERARY_PROMPT = AI_PROMPT.replace(
          /{location}/g,
          discoverData?.locationInfo?.title
        )
          .replace(/{totalDays}/g, discoverData?.totalDays)
          .replace(/{totalNight}/g, discoverData?.totalDays - 1)
          .replace(/{traveler}/g, discoverData?.traveler?.title)
          .replace(/{budget}/g, discoverData?.budget);

        let attempts = 0;
        const maxAttempts = 3;
        let success = false;
        let itineraryRes;

        while (attempts < maxAttempts && !success) {
          try {
            setRetryCount(attempts + 1);
            const [res, unsplashUrl] = await Promise.all([
              generateTripPlan(FINAL_ITINERARY_PROMPT),
              DiscoverTripImages[discoverData.locationInfo.title]
                ? Promise.resolve(
                    DiscoverTripImages[discoverData.locationInfo.title]
                  )
                : fetchUnsplashImage(discoverData.locationInfo.title),
            ]);

            itineraryData = normalizeItinerary(
              JSON.parse(cleanAiResponse(res))
            );
            itineraryRes = res;
            finalImageUrl = unsplashUrl;
            success = true;
          } catch (err) {
            attempts++;
            if (attempts < maxAttempts) await delay(2500);
            else
              throw new Error(
                "AI returned invalid data format multiple times."
              );
          }
        }

        await setDoc(savedTripRef, {
          savedTripId: normalizedKey,
          tripPlan: itineraryData,
          imageUrl: finalImageUrl,
          createdAt: serverTimestamp(),
        });
      }

      const FINAL_TRAVEL_PROMPT = TRAVEL_AI_PROMPT.replace(
        /{tripType}/g,
        discoverData?.tripType
      )
        .replace(/{departure}/g, discoverData?.departureInfo?.name)
        .replace(/{location}/g, discoverData?.locationInfo?.title)
        .replace(/{date}/g, discoverData.startDate)
        .replace(/{flightDate}/g, flightDate)
        .replace(/{trainDate}/g, trainDate);

      const transportRes = await generateTripPlan(FINAL_TRAVEL_PROMPT);
      try {
        transportData = JSON.parse(cleanAiResponse(transportRes));
      } catch (e) {
        transportData = { transportDetails: { outbound: [], return: [] } };
      }

      const { icon, ...cleanTraveler } = discoverData.traveler;
      const tripSubCollection = collection(db, "UserTrips", user.uid, "trips");
      const newUserTripRef = doc(tripSubCollection);

      await setDoc(newUserTripRef, {
        id: newUserTripRef.id,
        userEmail: user.email,
        userId: user.uid,
        savedTripId: normalizedKey,
        startDate: discoverData.startDate,
        endDate: discoverData.endDate,
        traveler: cleanTraveler,
        transportDetails: transportData.transportDetails || [],
        imageUrl: finalImageUrl,
        isActive: false,
        createdAt: serverTimestamp(),
        totalBudget: 0,
      });

      setLoading(false);
      router.replace("/(tabs)/mytrip");
    } catch (err) {
      console.error("GENERATION ERROR:", err);
      let message = "Failed to generate trip. Please try again.";
      if (err?.message?.includes("503") || err?.message?.includes("429")) {
        message = "AI server is busy. Please try again in a moment.";
      }
      setError(message);
      setLoading(false);
      hasGenerated.current = false;
    }
  };

  const getLoadingMessage = () => {
    if (retryCount <= 1) return "Generating your trip...";
    return `Retrying connection...`;
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={{ alignItems: "center" }}>
          <LottieView
            source={require("../../../assets/animations/travel.json")}
            autoPlay
            loop
            style={{ width: width * 0.7, height: width * 0.7 }}
          />
          <Text style={styles.loadingText}>{getLoadingMessage()}</Text>
        </View>
      )}

      {error && (
        <View style={{ alignItems: "center", width: "100%" }}>
          <Text style={{ fontSize: width * 0.2 }}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => generateAiTrip()}
            style={styles.primaryButton}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/mytrip")}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.06,
    backgroundColor: Colors.WHITE,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: width * 0.07,
    fontFamily: "outfitBold",
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    fontFamily: "outfitMedium",
    textAlign: "center",
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 15,
    width: width * 0.7,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontFamily: "outfitBold",
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: 15,
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    width: width * 0.7,
  },
  secondaryButtonText: {
    color: Colors.PRIMARY,
    textAlign: "center",
    fontFamily: "outfitBold",
    fontSize: 16,
  },
});
