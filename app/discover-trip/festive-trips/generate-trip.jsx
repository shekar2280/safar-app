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
  fallbackImages,
  FESTIVE_AI_PROMPT,
  TRAVEL_AI_PROMPT,
  AI_PROMPT,
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
import { FestiveTripContext } from "../../../context/FestiveTripContext";
import Constants from "expo-constants";

const { width, height } = Dimensions.get("window");

export default function GenerateTrip() {
  const { festiveData } = useContext(FestiveTripContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const user = auth.currentUser;
  const hasGenerated = useRef(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const isTripReady =
      festiveData?.locationInfo?.title &&
      festiveData?.totalDays &&
      festiveData?.traveler?.title &&
      festiveData?.budget &&
      festiveData?.startDate &&
      festiveData?.endDate;

    if (isTripReady && user && !hasGenerated.current) {
      hasGenerated.current = true;
      generateAiTrip();
    } else if (!user) {
      setError("User not authenticated.");
    }
  }, [festiveData]);

  const cleanAiResponse = (rawText) => {
    if (!rawText) return "{}";
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    return jsonMatch
      ? jsonMatch[0]
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim()
      : "{}";
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
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          locationName + " festival cultural"
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

    let attempts = 0;
    const maxAttempts = 3;
    let success = false;

    const flightDate = formatDateForMMT(festiveData.startDate, "flight");
    const trainDate = formatDateForMMT(festiveData.startDate, "train");

    const normalizedKey = `festive-${festiveData.locationInfo.title.toLowerCase()}-${
      festiveData.totalDays
    }-${festiveData.budget.toLowerCase()}`;

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
          const FINAL_FESTIVE_PROMPT = FESTIVE_AI_PROMPT.replace(
            /{location}/g,
            festiveData?.locationInfo?.title
          )
            .replace(/{totalDays}/g, festiveData?.totalDays)
            .replace(/{totalNight}/g, festiveData?.totalDays - 1)
            .replace(/{traveler}/g, festiveData?.traveler?.title)
            .replace(/{festival}/g, festiveData?.locationInfo?.festival)
            .replace(/{budget}/g, festiveData?.budget);

          const [itineraryRes, unsplashUrl] = await Promise.all([
            generateTripPlan(FINAL_FESTIVE_PROMPT),
            fetchUnsplashImage(festiveData?.locationInfo?.title),
          ]);

          itineraryData = normalizeItinerary(
            JSON.parse(cleanAiResponse(itineraryRes))
          );
          finalImageUrl = unsplashUrl;

          await setDoc(savedTripRef, {
            savedTripId: normalizedKey,
            tripPlan: itineraryData,
            imageUrl: finalImageUrl,
            createdAt: serverTimestamp(),
          });
        }

        const FINAL_TRAVEL_PROMPT = TRAVEL_AI_PROMPT.replace(
          /{tripType}/g,
          festiveData?.tripType
        )
          .replace(/{departure}/g, festiveData?.departureInfo?.name)
          .replace(/{location}/g, festiveData?.locationInfo?.title)
          .replace(/{date}/g, festiveData.startDate)
          .replace(/{flightDate}/g, flightDate)
          .replace(/{trainDate}/g, trainDate);

        const transportRes = await generateTripPlan(FINAL_TRAVEL_PROMPT);
        const transportData = JSON.parse(cleanAiResponse(transportRes));

        const userTripRef = doc(collection(db, "UserTrips"));
        const { icon, ...cleanTraveler } = festiveData.traveler;

        await setDoc(userTripRef, {
          userEmail: user.email,
          userId: user.uid,
          savedTripId: normalizedKey,
          startDate: festiveData.startDate,
          endDate: festiveData.endDate,
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
          setError("Failed to generate festive trip. Please try again.");
          setLoading(false);
          hasGenerated.current = false;
        }

        await setDoc(savedTripRef, {
          savedTripId: normalizedKey,
          tripPlan: itineraryData,
          imageUrl: finalImageUrl,
          createdAt: serverTimestamp(),
        });
      }
    }
  };

  const getLoadingMessage = () => {
    if (retryCount > 0) return "Connection slow, retrying...";
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
            source={require("../../../assets/animations/festive-loading.json")}
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
