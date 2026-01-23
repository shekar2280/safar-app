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
import {fallbackImages,FESTIVE_AI_PROMPT,TRAVEL_AI_PROMPT,AI_PROMPT,HIDDEN_GEMS_AI_PROMPT,HiddenGemsTripImages,} from "../../../constants/Options";
import { generateTripPlan } from "../../../config/AiModel";
import { useRouter } from "expo-router";
import { auth, db } from "../../../config/FirebaseConfig";
import {doc,setDoc,serverTimestamp,collection,getDoc,} from "firebase/firestore";
import { normalizeItinerary } from "../../../utils/normalizeItinerary";
import Constants from "expo-constants";
import { CommonTripContext } from "../../../context/CommonTripContext";

const { width, height } = Dimensions.get("window");

export default function GenerateTrip() {
  const { tripDetails, resetTripDetails } = useContext(CommonTripContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const user = auth.currentUser;
  const hasGenerated = useRef(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const isTripReady =
      (tripDetails?.departureInfo?.name || tripDetails?.departureInfo?.label) &&
      tripDetails?.destinationInfo?.title &&
      tripDetails?.totalDays &&
      tripDetails?.traveler?.title &&
      tripDetails?.budget &&
      tripDetails?.startDate &&
      tripDetails?.endDate;

    if (isTripReady && user && !hasGenerated.current) {
      hasGenerated.current = true;
      generateAiTrip();
    } else if (!user) {
      setError("User not authenticated.");
    }
  }, [tripDetails]);

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

  const getPromptByCategory = (category) => {
    switch (category) {
      case "FESTIVE":
        return FESTIVE_AI_PROMPT;
      case "HIDDEN":
        return HIDDEN_GEMS_AI_PROMPT;
      default:
        return AI_PROMPT;
    }
  };

  const activePromptTemplate = getPromptByCategory(tripDetails?.tripCategory);

  function formatDateForMMT(dateStr, transportType) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return transportType === "flight"
      ? `${day}/${month}/${year}`
      : `${year}${month}${day}`;
  }

  const fetchUnsplashImage = async (locationName, category) => {
    if (category === "HIDDEN" && HiddenGemsTripImages[tripDetails?.destinationInfo?.title]) {
      return HiddenGemsTripImages[tripDetails?.destinationInfo?.title];
    }

    const querySuffix =
      category === "FESTIVE" ? " festival cultural" : " nature hidden gems";
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          locationName + querySuffix
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

    const locationTitle = tripDetails?.destinationInfo?.title || "Destination";
    const locationName = tripDetails?.destinationInfo?.name || "Location";

    const flightDate = formatDateForMMT(tripDetails.startDate, "flight");
    const trainDate = formatDateForMMT(tripDetails.startDate, "train");

    const normalizedKey = `${locationName.toLowerCase()}-${
      tripDetails.totalDays
    }-${tripDetails.budget.toLowerCase()}`;

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
          let finalPrompt = (activePromptTemplate || AI_PROMPT)
            .replace(/{location}/g, locationTitle)
            .replace(/{totalDays}/g, tripDetails?.totalDays)
            .replace(/{totalNight}/g, tripDetails?.totalDays - 1)
            .replace(/{traveler}/g, tripDetails?.traveler?.title)
            .replace(/{budget}/g, tripDetails?.budget);

          if (finalPrompt.includes("{festival}")) {
            finalPrompt = finalPrompt.replace(
              /{festival}/g,
              tripDetails?.destinationInfo?.festival || "local events"
            );
          }

          const [itineraryRes, unsplashUrl] = await Promise.all([
            generateTripPlan(finalPrompt),
            fetchUnsplashImage(locationName, tripDetails?.tripCategory),
          ]);

          const cleaned = cleanAiResponse(itineraryRes);
          itineraryData = normalizeItinerary(JSON.parse(cleaned));
          finalImageUrl = unsplashUrl;

          await setDoc(savedTripRef, {
            savedTripId: normalizedKey,
            tripPlan: itineraryData,
            imageUrl: finalImageUrl,
            createdAt: serverTimestamp(),
          });
        }

        const FINAL_TRAVEL_PROMPT = TRAVEL_AI_PROMPT
          .replace(/{tripType}/g,tripDetails?.tripType)
          .replace(/{departure}/g, tripDetails?.departureInfo?.name || tripDetails?.departureInfo?.label)
          .replace(/{location}/g, locationTitle)
          .replace(/{date}/g, tripDetails.startDate)
          .replace(/{flightDate}/g, flightDate)
          .replace(/{trainDate}/g, trainDate);

        const transportRes = await generateTripPlan(FINAL_TRAVEL_PROMPT);
        const transportData = JSON.parse(cleanAiResponse(transportRes));

        const userTripRef = doc(collection(db, "UserTrips", user.uid, "trips"));

        const cleanTraveler = { ...tripDetails.traveler };
        delete cleanTraveler.icon;

        await setDoc(userTripRef, {
          userEmail: user.email,
          userId: user.uid,
          savedTripId: normalizedKey,
          startDate: tripDetails.startDate,
          endDate: tripDetails.endDate,
          traveler: cleanTraveler,
          transportDetails: transportData.transportDetails || [],
          imageUrl: finalImageUrl,
          isActive: false,
          createdAt: serverTimestamp(),
        });

        success = true;
        setLoading(false);

        resetTripDetails();

        router.replace("/(tabs)/mytrip");
      } catch (err) {
        attempts++;
        console.error(`Attempt ${attempts} failed:`, err);

        if (attempts >= maxAttempts) {
          setError(
            "Failed to generate trip. Please check your internet or try again."
          );
          setLoading(false);
          hasGenerated.current = false;
        } else {
          await delay(attempts * 2500);
        }
      }
    }
  };

  const getLoadingMessage = () => {
    if (retryCount > 0) return "Connection slow, Retrying...";
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
