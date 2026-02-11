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
import { AI_PROMPT, CITY_TO_IATA } from "../../constants/Options";
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
import { jsonrepair } from "jsonrepair";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

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
      tripData?.destinationInfo?.name &&
      tripData?.departureInfo?.name &&
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

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const generateAiTrip = async () => {
    setLoading(true);
    setError(null);
    setRetryCount(0);

    let attempts = 0;
    const maxAttempts = 2;
    let success = false;

    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
    const normalizedKey = `${tripData.destinationInfo.shortName.toLowerCase()}-${tripData.totalDays}-${tripData.budget.toLowerCase()}`;
    const localDepartureIata =
      tripData.departureInfo?.iataCode ||
      CITY_TO_IATA[tripData.departureInfo.name.split(",")[0].toLowerCase()] ||
      "BOM";

    let itineraryData, finalImageUrl, destinationIata;

    while (attempts < maxAttempts && !success) {
      try {
        setRetryCount(attempts);

        const savedTripRef = doc(db, "SavedTripData", normalizedKey);
        const existingTrip = await getDoc(savedTripRef);

        if (existingTrip.exists()) {
          const cached = existingTrip.data();
          itineraryData = cached.tripPlan;
          finalImageUrl = cached.imageUrl || "";
          destinationIata = cached.destinationIata || "N/A";
        } else {
          const days = parseInt(tripData.totalDays);
          const totalPlaces = days * 4;
          const perSlot = days;
          const totalRecs = days * 2;

          const FINAL_ITINERARY_PROMPT = AI_PROMPT.replace(
            /{location}/g,
            tripData.destinationInfo.name,
          )
            .replace(/{totalDays}/g, tripData.totalDays)
            .replace(/{totalNight}/g, tripData.totalDays - 1)
            .replace(/{traveler}/g, tripData.traveler.title)
            .replace(/{budget}/g, tripData.budget)
            .replace(/{totalPlaces}/g, totalPlaces)
            .replace(/{perSlot}/g, perSlot)
            .replace(/{totalRecs}/g, totalRecs);

          const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              itineraryPrompt: FINAL_ITINERARY_PROMPT,
              locationName: tripData.destinationInfo.name,
              tripCategory: "GENERAL",
            }),
          });

          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Backend failed");

          const rawAiResponse = cleanAiResponse(result.itinerary);
          const repairedJson = jsonrepair(rawAiResponse);
          const aiData = JSON.parse(repairedJson);

          itineraryData = normalizeItinerary(aiData);
          finalImageUrl = result.imageUrl || result.imageUrls || "";
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
        const { icon, ...cleanTraveler } = tripData.traveler;

        await setDoc(userTripRef, {
          userEmail: user.email,
          userId: user.uid,
          savedTripId: normalizedKey,
          startDate: tripData.startDate,
          endDate: tripData.endDate,
          traveler: cleanTraveler,
          isInternational: tripData.isInternational || false,
          departureIata: localDepartureIata,
          destinationIata, 
          tripType: tripData.tripType || "planned",
          isActive: false,
          createdAt: serverTimestamp(),
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        success = true;
        setLoading(false);
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
            source={require("../../assets/animations/loading.json")}
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
