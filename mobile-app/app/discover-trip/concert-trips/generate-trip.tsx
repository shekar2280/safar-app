import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import LottieView from "lottie-react-native";
import { Colors } from "@/src/constants/colors";
import { CITY_TO_IATA } from "@/src/constants/iata";
import { CONCERT_TRIP_AI_PROMPT } from "@/src/constants/prompts";
import { useRouter } from "expo-router";
import { auth, db } from "@/src/lib/firebase";
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { ConcertTripContext } from "@/src/context/ConcertTripContext";
import { normalizeItinerary } from "@/src/utils/normalizeItinerary";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

export default function GenerateConcertTrip() {
  const context = useContext(ConcertTripContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const user = auth.currentUser;
  const hasGenerated = useRef(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!context) return;
    const { concertData } = context;
    const isTripReady =
      concertData?.artist &&
      concertData?.locationInfo &&
      concertData?.travelers &&
      concertData?.budget &&
      concertData?.locationInfo?.concertDate;

    if (isTripReady && user && !loading && !hasGenerated.current) {
      hasGenerated.current = true;
      generateAiTrip();
    } else if (!user) {
      setError("User not authenticated.");
    }
  }, [context?.concertData, user]);

  const cleanAiResponse = (rawText: string) => {
    if (!rawText) return "{}";
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return "{}";

      let jsonString = jsonMatch[0];

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

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const generateAiTrip = async () => {
    if (!context || !user) return;
    const { concertData } = context;
    hasGenerated.current = true;
    setLoading(true);
    setError(null);
    setRetryCount(0);

    try {
      const FINAL_ITINERARY_PROMPT = CONCERT_TRIP_AI_PROMPT.replace(
        /{travelers}/g,
        concertData?.travelers?.people ?? "1",
      )
        .replace(/{artist}/g, concertData?.artist)
        .replace(/{concertDate}/g, concertData?.locationInfo?.concertDate || "")
        .replace(/{departure}/g, concertData?.departureInfo?.name || "")
        .replace(/{tripType}/g, concertData?.tripType || "")
        .replace(/{location}/g, concertData?.locationInfo?.name || "")
        .replace(/{budget}/g, concertData?.budget || "");

      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
      if (!API_BASE_URL) throw new Error("API URL not configured");

      let attempts = 0;
      const maxAttempts = 2;
      let success = false;
      let itineraryData;
      let destinationIata = "N/A";

      const localDepartureIata =
        (concertData.departureInfo as any)?.iataCode ||
        CITY_TO_IATA[
          (concertData.departureInfo?.name || "").split(",")[0].toLowerCase()
        ] ||
        "BOM";

      while (attempts < maxAttempts && !success) {
        try {
          setRetryCount(attempts + 1);
          const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              itineraryPrompt: FINAL_ITINERARY_PROMPT,
              locationName: concertData?.locationInfo?.name,
              tripCategory: "CONCERT",
            }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Backend failed");

          const rawAiResponse = cleanAiResponse(result.itinerary);

          let aiData;
          try {
            aiData = JSON.parse(rawAiResponse);
          } catch (parseErr) {
            console.error("Standard JSON Parse failed, trying to fix...");
            const manualFix = rawAiResponse.replace(/\\n/g, "").trim();
            aiData = JSON.parse(manualFix);
          }

          itineraryData = normalizeItinerary(aiData);
          destinationIata = aiData.destinationIata || "N/A";
          success = true;
        } catch (err) {
          attempts++;
          if (attempts < maxAttempts) await delay(2500);
          else
            throw new Error("AI returned invalid data format multiple times.");
        }
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
        imageUrl: concertData?.locationInfo?.imageUrl || "",
        isInternational: concertData?.isInternational || false,
        bookingUrl: concertData?.locationInfo?.bookingUrl || "",
        departureIata: localDepartureIata,
        destinationIata: destinationIata,
        startDate: concertData.startDate,
        endDate: concertData.endDate,
        isActive: false,
        createdAt: serverTimestamp(),
        totalBudget: 0,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setLoading(false);
      router.replace("/(tabs)/mytrip" as any);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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

  if (!context) return null;

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
            onPress={() => router.replace("/(tabs)/mytrip" as any)}
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
