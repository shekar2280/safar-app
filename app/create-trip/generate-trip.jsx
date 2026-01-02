import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import LottieView from "lottie-react-native";
import { Colors } from "../../constants/Colors";
import { CreateTripContext } from "../../context/CreateTripContext";
import {
  AI_PROMPT,
  fallbackImages,
  TRAVEL_AI_PROMPT,
} from "../../constants/Options";
import { generateTripPlan } from "../../config/AiModel";
import { useRouter } from "expo-router";
import { auth, db } from "../../config/FirebaseConfig";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  getDoc,
} from "firebase/firestore";
import { normalizeItinerary } from "../../utils/normalizeItinerary";
import Constants from "expo-constants";
const { width, height } = Dimensions.get("window");

export default function GenerateTrip() {
  const { tripData } = useContext(CreateTripContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const user = auth.currentUser;
  const hasGenerated = useRef(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const isTripReady =
      tripData?.locationInfo?.name &&
      tripData?.totalDays &&
      tripData?.traveler?.title &&
      tripData?.budget &&
      tripData?.startDate &&
      tripData?.endDate;

    if (isTripReady && user && !hasGenerated.current) {
      hasGenerated.current = true;
      generateAiTrip();
    } else if (!user) {
      setError("User not authenticated.");
    }
  }, [tripData]);

  const cleanAiResponse = (rawText) => {
    if (!rawText) return "{}";
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let cleaned = jsonMatch[0]
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        return cleaned;
      }
      return "{}";
    } catch (e) {
      console.error("Cleaning Error:", e);
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
          locationName
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
    } catch (e) {
      return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    }
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const generateAiTrip = async () => {
  setLoading(true);
  setError(null);
  setRetryCount(0);

  let attempts = 0;
  const maxAttempts = 3;
  let success = false;

  const flightDate = formatDateForMMT(tripData.startDate, "flight");
  const trainDate = formatDateForMMT(tripData.startDate, "train");
  const normalizedKey = `${tripData.locationInfo.name.toLowerCase()}-${tripData.totalDays}-${tripData.budget.toLowerCase()}`;

  while (attempts < maxAttempts && !success) {
    try {
      setRetryCount(attempts);

      const savedTripRef = doc(db, "SavedTripData", normalizedKey);
      const existingTrip = await getDoc(savedTripRef);

      let itineraryData;
      let finalImageUrl;

      if (existingTrip.exists()) {
        const cachedData = existingTrip.data();
        itineraryData = cachedData.tripPlan;
        finalImageUrl = cachedData.imageUrl;
      } else {
        const FINAL_ITINERARY_PROMPT = AI_PROMPT.replace(/{location}/g, tripData?.locationInfo?.name)
          .replace(/{totalDays}/g, tripData?.totalDays)
          .replace(/{totalNight}/g, tripData?.totalDays - 1)
          .replace(/{traveler}/g, tripData?.traveler?.title)
          .replace(/{budget}/g, tripData?.budget);

        const [itineraryRes, unsplashUrl] = await Promise.all([
          generateTripPlan(FINAL_ITINERARY_PROMPT),
          fetchUnsplashImage(tripData?.locationInfo?.name)
        ]);

        try {
          const cleanedItinerary = cleanAiResponse(itineraryRes);
          itineraryData = normalizeItinerary(JSON.parse(cleanedItinerary));
        } catch (parseErr) {
          console.error("Itinerary Parse Error:", parseErr);
          throw new Error("Failed to parse itinerary details.");
        }

        finalImageUrl = unsplashUrl;

        await setDoc(savedTripRef, {
          savedTripId: normalizedKey,
          tripPlan: itineraryData,
          imageUrl: finalImageUrl,
          createdAt: serverTimestamp(),
        });
      }

      const FINAL_TRAVEL_PROMPT = TRAVEL_AI_PROMPT.replace(/{tripType}/g, tripData?.tripType)
        .replace(/{departure}/g, tripData?.departureInfo?.name)
        .replace(/{location}/g, tripData?.locationInfo?.name)
        .replace(/{date}/g, tripData.startDate)
        .replace(/{flightDate}/g, flightDate)
        .replace(/{trainDate}/g, trainDate);

      const transportRes = await generateTripPlan(FINAL_TRAVEL_PROMPT);
      let transportData;
      try {
        const cleanedTransport = cleanAiResponse(transportRes);
        transportData = JSON.parse(cleanedTransport);
      } catch (parseErr) {
        console.error("Transport Parse Error:", parseErr);
        throw new Error("Failed to parse transport details.");
      }

      const userTripRef = doc(collection(db, "UserTrips", user.uid, "trips"));
      const { icon, ...cleanTraveler } = tripData.traveler;

      await setDoc(userTripRef, {
        userEmail: user.email,
        userId: user.uid,
        savedTripId: normalizedKey,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        traveler: cleanTraveler,
        transportDetails: transportData.transportDetails,
        imageUrl: finalImageUrl,
        isActive: false,
        createdAt: serverTimestamp(),
      });

      success = true;
      setLoading(false);
      router.replace("/(tabs)/mytrip");

    } catch (err) {
      attempts++;
      console.error(`Attempt ${attempts} failed:`, err);
      
      if (attempts < maxAttempts) {
        await delay(attempts * 2500); 
      } else {
        let message = "Failed to generate trip. Please try again.";
        if (err?.message?.includes("parse")) {
          message = "AI response was malformed. Retrying might fix it.";
        } else if (err?.message?.includes("503") || err?.message?.includes("429")) {
          message = "AI server is currently busy. Please try again in a moment.";
        }
        setError(message);
        setLoading(false);
        hasGenerated.current = false;
      }
    }
  }
};

  const getLoadingMessage = () => {
    if (retryCount === 1) return "Retrying connection...";
    if (retryCount === 2) return "Almost there, finishing touches...";
    return "Generating your trip...";
  };

  return (
    <View
      style={{
        flex: 1,
        padding: width * 0.06,
        backgroundColor: Colors.WHITE,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {loading && (
        <View style={{ alignItems: "center" }}>
          <LottieView
            source={require("../../assets/animations/loading.json")}
            autoPlay
            loop
            style={{ width: width * 0.7, height: width * 0.7 }}
          />
          <Text
            style={{
              fontSize: width * 0.07,
              fontFamily: "outfitBold",
              textAlign: "center",
              marginTop: 20,
            }}
          >
            {getLoadingMessage()}
          </Text>
        </View>
      )}

      {error && (
        <View style={{ alignItems: "center", width: "100%" }}>
          <Text style={{ fontSize: width * 0.2 }}>⚠️</Text>
          <Text
            style={{
              fontFamily: "outfitMedium",
              textAlign: "center",
              marginVertical: 10,
              paddingHorizontal: 20,
            }}
          >
            {error}
          </Text>
          
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
