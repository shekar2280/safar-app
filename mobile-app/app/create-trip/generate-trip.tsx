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
import { CreateTripContext } from "@/src/context/CreateTripContext";
import { useRouter } from "expo-router";
import { auth } from "@/src/lib/firebase";
import { normalizeItinerary } from "@/src/utils/normalizeItinerary";
import { jsonrepair } from "jsonrepair";
import * as Haptics from "expo-haptics";
import { CITY_TO_IATA } from "@/src/constants/iata";
import { AI_PROMPT } from "@/src/constants/prompts";
import { apiGet, apiPost, JWT_KEY } from "@/src/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/src/context/UserContext";

const { width } = Dimensions.get("window");

export default function GenerateTrip() {
  const context = useContext(CreateTripContext);
  const { tripData } = context || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const user = auth.currentUser;
  const { refreshTrips } = useUser();
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

  const cleanAiResponse = (rawText: string) => {
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
    } catch {
      return "{}";
    }
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const generateAiTrip = async () => {
    if (!tripData || !user) return;
    setLoading(true);
    setError(null);
    setRetryCount(0);

    let attempts = 0;
    const maxAttempts = 2;
    let success = false;

    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;
    const normalizedKey = `${tripData.destinationInfo?.shortName?.toLowerCase()}-${tripData.totalDays}-${tripData.budget?.toLowerCase()}`;
    const localDepartureIata =
      (tripData.departureInfo as any)?.iataCode ||
      CITY_TO_IATA[tripData.departureInfo?.name?.split(",")[0].toLowerCase() || ""] ||
      "BOM";

    let itineraryData: any, finalImageUrl: any, destinationIata: string;

    while (attempts < maxAttempts && !success) {
      try {
        setRetryCount(attempts);

        // 1. Check if a shared cached plan already exists in Neon (replaces Firestore getDoc)
        let cached: any = null;
        try {
          cached = await apiGet(`/api/trips/saved/${encodeURIComponent(normalizedKey)}`);
        } catch {
          // 404 means not cached yet — proceed to generate
        }

        if (cached) {
          console.log(`[CACHE HIT] Returning instant itinerary from DB for key: "${normalizedKey}"`);
          itineraryData = cached.trip_plan;
          finalImageUrl = cached.image_url || "";
          destinationIata = cached.destination_iata || "N/A";
        } else {
          console.log(`[CACHE MISS] No DB cache for key: "${normalizedKey}" — calling Gemini AI`);
          const days = parseInt(tripData.totalDays!.toString());
          const totalPlaces = days * 4;
          const perSlot = days;
          const totalRecs = days * 2;

          const FINAL_ITINERARY_PROMPT = AI_PROMPT
            .replace(/{location}/g, tripData.destinationInfo?.name || "")
            .replace(/{totalDays}/g, tripData.totalDays!.toString())
            .replace(/{totalNight}/g, (days - 1).toString())
            .replace(/{traveler}/g, tripData.traveler?.title || "")
            .replace(/{budget}/g, tripData.budget || "")
            .replace(/{totalPlaces}/g, totalPlaces.toString())
            .replace(/{perSlot}/g, perSlot.toString())
            .replace(/{totalRecs}/g, totalRecs.toString());

          const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              itineraryPrompt: FINAL_ITINERARY_PROMPT,
              locationName: tripData.destinationInfo?.name,
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
        }

        // 3. Save to Neon — upserts shared plan + creates user trip (replaces two Firestore setDoc calls)
        const jwt = await AsyncStorage.getItem(JWT_KEY);
        if (!jwt) throw new Error("Not authenticated with backend");

        const { icon: _icon, ...cleanTraveler } = (tripData.traveler as any) || {};

        await apiPost("/api/trips", {
          normalized_key: normalizedKey,
          trip_plan: itineraryData,
          image_urls: Array.isArray(finalImageUrl)
            ? finalImageUrl
            : finalImageUrl
              ? [finalImageUrl]
              : [],
          destination_iata: destinationIata,
          start_date: tripData.startDate,
          end_date: tripData.endDate,
          traveler: cleanTraveler,
          is_international: tripData.isInternational || false,
          departure_iata: localDepartureIata,
          trip_type: tripData.tripType || "planned",
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        success = true;
        setLoading(false);
        await refreshTrips();
        router.replace("/(tabs)/mytrip" as any);
      } catch (err: any) {
        attempts++;
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
          <TouchableOpacity onPress={generateAiTrip} style={styles.primaryButton}>
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
