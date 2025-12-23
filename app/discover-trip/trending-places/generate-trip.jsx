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
import Constants from "expo-constants";
import { TrendingTripContext } from "../../../context/TrendingTripContext";
import {
  AI_PROMPT,
  TRAVEL_AI_PROMPT,
  fallbackImages,
} from "../../../constants/Options";

const { width, height } = Dimensions.get("window");

export default function GenerateTrip() {
  const { trendingData } = useContext(TrendingTripContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const user = auth.currentUser;
  const hasGenerated = useRef(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const isTripReady =
      trendingData?.locationInfo?.title &&
      trendingData?.totalDays &&
      trendingData?.traveler?.title &&
      trendingData?.budget &&
      trendingData?.startDate &&
      trendingData?.endDate;

    if (isTripReady && user && !hasGenerated.current) {
      hasGenerated.current = true;
      generateAiTrip();
    } else if (!user) {
      setError("User not authenticated.");
    }
  }, [trendingData]);

  const cleanAiResponse = (rawText) => {
    if (!rawText) return "{}";
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      return jsonMatch ? jsonMatch[0].trim() : rawText.trim();
    } catch (e) {
      return "{}";
    }
  };

  function formatDateForMMT(dateStr, transportType) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return transportType === "flight"
      ? `${day}/${month}/${year}`
      : `${year}${month}${day}`;
  }

  const fetchUnsplashImage = async (locationName) => {
    try {
      const apiKey = Constants.expoConfig?.extra?.UNSPLASH_API_KEY;
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          locationName + " famous place"
        )}&per_page=1&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${apiKey}` } }
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

    const flightDate = formatDateForMMT(trendingData.startDate, "flight");
    const trainDate = formatDateForMMT(trendingData.startDate, "train");

    try {
      const normalizedKey = `${trendingData.locationInfo.title.toLowerCase()}-${
        trendingData.totalDays
      }-${trendingData.budget.toLowerCase()}`;
      const savedTripRef = doc(db, "SavedTripData", normalizedKey);
      const existingTrip = await getDoc(savedTripRef);

      let itineraryData;
      let finalImageUrl;
      let transportData;
      const { icon, ...cleanTraveler } = trendingData.traveler;

      if (existingTrip.exists()) {
        const cachedData = existingTrip.data();
        itineraryData = cachedData.tripPlan;
        finalImageUrl = cachedData.imageUrl;
      } else {
        const FINAL_ITINERARY_PROMPT = AI_PROMPT.replace(
          /{location}/g,
          trendingData?.locationInfo?.title
        )
          .replace(/{totalDays}/g, trendingData?.totalDays)
          .replace(/{totalNight}/g, trendingData?.totalDays - 1)
          .replace(/{traveler}/g, trendingData?.traveler?.title)
          .replace(/{budget}/g, trendingData?.budget);

        let attempts = 0;
        const maxAttempts = 3;
        let success = false;
        let itineraryRes;

        while (attempts < maxAttempts && !success) {
          try {
            setRetryCount(attempts + 1);
            const [res, unsplashUrl] = await Promise.all([
              generateTripPlan(FINAL_ITINERARY_PROMPT),
              fetchUnsplashImage(trendingData?.locationInfo?.title),
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

      const transportRes = await generateTripPlan(
        TRAVEL_AI_PROMPT.replace(/{tripType}/g, trendingData?.tripType)
          .replace(
            /{departure}/g,
            trendingData?.departureInfo?.name ||
              trendingData?.departureInfo?.label
          )
          .replace(/{location}/g, trendingData?.locationInfo?.title)
          .replace(/{date}/g, trendingData.startDate)
          .replace(/{flightDate}/g, flightDate)
          .replace(/{trainDate}/g, trainDate)
      );

      try {
        transportData = JSON.parse(cleanAiResponse(transportRes));
      } catch (e) {
        transportData = { transportDetails: { outbound: [], return: [] } };
      }

      const tripSubCollection = collection(db, "UserTrips", user.uid, "trips");
      const newUserTripRef = doc(tripSubCollection);

      await setDoc(newUserTripRef, {
        id: newUserTripRef.id,
        userEmail: user.email,
        userId: user.uid,
        savedTripId: normalizedKey,
        startDate: trendingData.startDate,
        endDate: trendingData.endDate,
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
      setError(err.message || "Failed to generate trending trip.");
      setLoading(false);
      hasGenerated.current = false;
    }
  };

  const getLoadingMessage = () => {
    if (retryCount <= 1) return "Generating your trip...";
    return `Retrying connection (${retryCount}/3)...`;
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={{ alignItems: "center" }}>
          <LottieView
            source={require("../../../assets/animations/loading.json")}
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
