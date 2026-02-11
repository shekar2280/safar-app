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
  AI_PROMPT,
  HIDDEN_GEMS_AI_PROMPT,
  CITY_TO_IATA,
} from "../../../constants/Options";
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
import { jsonrepair } from "jsonrepair";
import { CommonTripContext } from "../../../context/CommonTripContext";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

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
    try {
      const firstBracket = rawText.indexOf("{");
      const lastBracket = rawText.lastIndexOf("}");
      if (firstBracket === -1 || lastBracket === -1) return "{}";

      let jsonString = rawText.substring(firstBracket, lastBracket + 1);
      jsonString = jsonString
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/,\s*([\]}])/g, "$1")
        .trim();

      return jsonString;
    } catch (err) {
      console.error("Cleaning error:", err);
      return "{}";
    }
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

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const generateAiTrip = async () => {
    setLoading(true);
    setError(null);
    setRetryCount(0);

    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
    let attempts = 0;
    const maxAttempts = 2;
    let success = false;

    const locationTitle = tripDetails?.destinationInfo?.title || "Destination";
    const locationName = tripDetails?.destinationInfo?.name || locationTitle;
    const departureName =
      tripDetails?.departureInfo?.name || tripDetails?.departureInfo?.label;

    const normalizedKey = `${locationName.toLowerCase().replace(/\s+/g, "-")}-${tripDetails.totalDays}-${tripDetails.budget.toLowerCase()}`;

    const localDepartureIata =
      tripDetails?.departureInfo?.iataCode ||
      CITY_TO_IATA[departureName.split(",")[0].toLowerCase()] ||
      "BOM";

    while (attempts < maxAttempts && !success) {
      try {
        setRetryCount(attempts);

        const savedTripRef = doc(db, "SavedTripData", normalizedKey);
        const existingTrip = await getDoc(savedTripRef);

        let itineraryData, finalImageUrl, destinationIata;

        if (existingTrip.exists()) {
          const cached = existingTrip.data();
          itineraryData = cached.tripPlan;
          finalImageUrl = cached.imageUrl || "";
          destinationIata = cached.destinationIata || "N/A";
        } else {
          const days = parseInt(tripDetails.totalDays);
          const activePromptTemplate = getPromptByCategory(
            tripDetails?.tripCategory,
          );

          let FINAL_ITINERARY_PROMPT = activePromptTemplate
            .replace(/{location}/g, locationTitle)
            .replace(/{totalDays}/g, tripDetails.totalDays)
            .replace(/{totalNight}/g, days - 1)
            .replace(/{traveler}/g, tripDetails.traveler.title)
            .replace(/{budget}/g, tripDetails.budget)
            .replace(/{totalPlaces}/g, days * 4)
            .replace(/{perSlot}/g, days)
            .replace(/{totalRecs}/g, days * 2);

          if (FINAL_ITINERARY_PROMPT.includes("{festival}")) {
            FINAL_ITINERARY_PROMPT = FINAL_ITINERARY_PROMPT.replace(
              /{festival}/g,
              tripDetails?.destinationInfo?.festival || "local events",
            );
          }

          const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              itineraryPrompt: FINAL_ITINERARY_PROMPT,
              locationName: locationName,
              tripCategory: tripDetails?.tripCategory,
            }),
          });

          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Backend failed");

          const rawAiResponse = cleanAiResponse(result.itinerary);
          const repairedJson = jsonrepair(rawAiResponse);
          const aiData = JSON.parse(repairedJson);

          itineraryData = normalizeItinerary(aiData);
          finalImageUrl =
            result.imageUrl || result.imageUrls || fallbackImages[0];
          destinationIata = aiData.destinationIata || "N/A";

          await setDoc(savedTripRef, {
            savedTripId: normalizedKey,
            tripPlan: itineraryData,
            imageUrl: finalImageUrl,
            destinationIata,
            createdAt: serverTimestamp(),
          });
        }

        const userTripRef = doc(collection(db, "UserTrips", user.uid, "trips"));
        const { icon, ...cleanTraveler } = tripDetails.traveler;

        await setDoc(userTripRef, {
          userEmail: user.email,
          userId: user.uid,
          savedTripId: normalizedKey,
          startDate: tripDetails.startDate,
          endDate: tripDetails.endDate,
          traveler: cleanTraveler,
          isInternational: tripDetails.isInternational || false,
          departureIata: localDepartureIata,
          destinationIata,
          tripType: tripDetails.tripType || "planned",
          isActive: false,
          createdAt: serverTimestamp(),
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        success = true;
        setLoading(false);
        resetTripDetails();
        router.replace("/(tabs)/mytrip");
      } catch (err) {
        attempts++;
        console.error(`Attempt ${attempts} failed:`, err);
        if (attempts < maxAttempts) {
          await delay(2000);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setError(err.message || "Failed to generate trip.");
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
            onPress={generateAiTrip}
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
