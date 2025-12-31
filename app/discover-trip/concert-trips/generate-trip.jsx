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
  CONCERT_TRIP_AI_PROMPT,
  TRAVEL_AI_PROMPT,
} from "../../../constants/Options";
import { generateTripPlan } from "../../../config/AiModel";
import { useRouter } from "expo-router";
import { auth, db } from "../../../config/FirebaseConfig";
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { ConcertTripContext } from "../../../context/ConcertTripContext";
import { normalizeItinerary } from "../../../utils/normalizeItinerary";

const { width, height } = Dimensions.get("window");

export default function GenerateConcertTrip() {
  const { concertData } = useContext(ConcertTripContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const user = auth.currentUser;
  const hasGenerated = useRef(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const isTripReady =
      concertData?.artist &&
      concertData?.locationInfo &&
      concertData?.traveler &&
      concertData?.budget &&
      concertData?.locationInfo?.concertDate;

    if (isTripReady && user && !hasGenerated.current) {
      hasGenerated.current = true;
      generateAiTrip();
    } else if (!user) {
      setError("User not authenticated.");
    }
  }, [concertData]);

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
    if (transportType === "flight") return `${day}/${month}/${year}`;
    if (transportType === "train") return `${year}${month}${day}`;
    return "";
  }

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const generateAiTrip = async () => {
    setLoading(true);
    setError(null);
    setRetryCount(0);

    const flightDate = formatDateForMMT(concertData.startDate, "flight");
    const trainDate = formatDateForMMT(concertData.startDate, "train");

    try {
      const FINAL_ITINERARY_PROMPT = CONCERT_TRIP_AI_PROMPT.replace(
        /{travelers}/g,
        concertData?.traveler?.people ?? "1"
      )
        .replace(/{artist}/g, concertData?.artist)
        .replace(/{concertDate}/g, concertData?.locationInfo?.concertDate)
        .replace(/{departure}/g, concertData?.departureInfo?.name)
        .replace(/{tripType}/g, concertData?.tripType)
        .replace(/{location}/g, concertData?.locationInfo?.title)
        .replace(/{startDate}/g, concertData?.startDate)
        .replace(/{budget}/g, concertData?.budget);

      let attempts = 0;
      const maxAttempts = 3;
      let success = false;
      let itineraryData;

      while (attempts < maxAttempts && !success) {
        try {
          setRetryCount(attempts + 1);
          const res = await generateTripPlan(FINAL_ITINERARY_PROMPT);
          itineraryData = normalizeItinerary(JSON.parse(cleanAiResponse(res)));
          success = true;
        } catch (err) {
          attempts++;
          if (attempts < maxAttempts) await delay(2500);
          else
            throw new Error("AI returned invalid data format multiple times.");
        }
      }
      const FINAL_TRAVEL_PROMPT = TRAVEL_AI_PROMPT.replace(
        /{tripType}/g,
        concertData?.tripType
      )
        .replace(/{departure}/g, concertData?.departureInfo?.name)
        .replace(/{location}/g, concertData?.locationInfo?.title)
        .replace(/{date}/g, concertData.startDate)
        .replace(/{flightDate}/g, flightDate)
        .replace(/{trainDate}/g, trainDate);

      const transportRes = await generateTripPlan(FINAL_TRAVEL_PROMPT);
      let transportData;
      try {
        transportData = JSON.parse(cleanAiResponse(transportRes));
      } catch (e) {
        transportData = { transportDetails: { outbound: [], return: [] } };
      }
      const tripSubCollection = collection(db, "UserTrips", user.uid, "trips");
      const newUserTripRef = doc(tripSubCollection);
      const sanitizedConcertData = JSON.parse(JSON.stringify(concertData));

      await setDoc(newUserTripRef, {
        id: newUserTripRef.id,
        userEmail: user.email,
        userId: user.uid,
        concertData: sanitizedConcertData,
        tripPlan: itineraryData,
        transportDetails: transportData.transportDetails || [],
        imageUrl:concertData?.locationInfo?.imageUrl ||"",
        bookingUrl: concertData?.locationInfo?.bookingUrl || "",
        startDate: concertData.startDate,
        endDate: concertData.endDate,
        isActive: false,
        createdAt: serverTimestamp(),
        totalBudget: 0,
      });
      setLoading(false);
      router.replace("/(tabs)/mytrip");
    } catch (err) {
      console.error("GENERATION ERROR:", err);
      setError(err.message || "Failed to generate concert trip.");
      setLoading(false);
      hasGenerated.current = false;
    }
  };

  const getLoadingMessage = () => {
    if (retryCount <= 1) return "Generating your concert trip...";
    return `Retrying connection (${retryCount}/3)...`;
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={{ alignItems: "center" }}>
          <LottieView
            source={require("../../../assets/animations/concert-1.json")}
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
