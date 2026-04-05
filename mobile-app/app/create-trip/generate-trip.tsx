import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import LottieView from "lottie-react-native";
import { Colors } from "@/src/constants/colors";
import { CreateTripContext } from "@/src/context/CreateTripContext";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth } from "@/src/lib/firebase";
import { normalizeItinerary } from "@/src/utils/normalizeItinerary";
import { jsonrepair } from "jsonrepair";
import * as Haptics from "expo-haptics";
import { CITY_TO_IATA } from "@/src/constants/iata";
import { AI_PROMPT } from "@/src/constants/prompts";
import { apiGet, apiPost, JWT_KEY, updateUserProfile } from "@/src/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/src/context/UserContext";
import { ConcertTripContext } from "@/src/context/ConcertTripContext";

const { width } = Dimensions.get("window");

export default function GenerateTrip() {
  const insets = useSafeAreaInsets();
  const context = useContext(CreateTripContext);
  const concertContext = useContext(ConcertTripContext);
  const { tripData } = context || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const user = auth.currentUser;
  const { refreshTrips, userProfile } = useUser();
  const hasGenerated = useRef(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const isTripReady =
      tripData?.destinationInfo?.name &&
      tripData?.departureInfo?.name &&
      tripData?.totalDays &&
      tripData?.traveler?.title &&
      tripData?.budget;

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
        let cached: any = null;
        try {
          cached = await apiGet(`/api/trips/saved/${encodeURIComponent(normalizedKey)}`);
        } catch {
        }

        if (cached) {
          itineraryData = cached.trip_plan;
          finalImageUrl = cached.image_url || "";
          destinationIata = cached.destination_iata || "N/A";
        } else {
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
            .replace(/{totalRecs}/g, totalRecs.toString())
            .replace(/{travelerMode}/g, tripData.travelerMode || "SOLO");

          const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              itineraryPrompt: FINAL_ITINERARY_PROMPT,
              locationName: tripData.destinationInfo?.name,
              tripCategory: "GENERAL",
              latitude: tripData.destinationInfo?.coordinates?.lat,
              longitude: tripData.destinationInfo?.coordinates?.lon,
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

        const jwt = await AsyncStorage.getItem(JWT_KEY);
        if (!jwt) throw new Error("Not authenticated with backend");

        const { icon: _icon, ...cleanTraveler } = (tripData.traveler as any) || {};

        const isConcert = !!tripData.destinationInfo?.festival;

        const festivalName = tripData.destinationInfo?.festival;
        const artistFallback = festivalName ? festivalName.replace(" Concert", "") : "";
        const finalArtist = concertContext?.concertData?.artist || artistFallback;

        const concertPayload = isConcert ? {
          artist: finalArtist,
          title: festivalName,
          venueName: tripData.destinationInfo?.name,
          venueAddress: (tripData.destinationInfo as any)?.venueAddress,
          concertDate: tripData.destinationInfo?.concertDate,
          concertTime: (tripData.destinationInfo as any)?.concertTime,
          bookingUrl: (tripData.destinationInfo as any)?.bookingUrl,
          priceRange: (tripData.destinationInfo as any)?.priceRange,
          image_urls: tripData.destinationInfo?.imageUrl ? [tripData.destinationInfo.imageUrl] : []
        } : null;

        await apiPost("/api/trips", {
          normalized_key: normalizedKey,
          trip_plan: itineraryData,
          destination_iata: destinationIata,
          total_days: tripData.totalDays,
          traveler: cleanTraveler,
          is_international: tripData.isInternational || false,
          departure_iata: localDepartureIata,
          traveler_mode: tripData.travelerMode || "SOLO",
          concert_data: concertPayload,
        });

        const userHome = userProfile?.homeLocation;
        const currentDeparture = tripData.departureInfo;
        
        if (currentDeparture && JSON.stringify(currentDeparture) !== JSON.stringify(userHome)) {
          updateUserProfile({ home_location: currentDeparture }).catch(e => 
            console.error("Failed to update home location:", e)
          );
        }

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      {loading && (
        <View style={styles.loadingWrapper}>
          <LottieView
            source={require("../../assets/animations/loading.json")}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text style={styles.loadingText}>{getLoadingMessage().toUpperCase()}</Text>
          <Text style={styles.loadingSub}>WE ARE CRAFTING YOUR UNIQUE JOURNEY</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorWrapper}>
          <Text style={styles.errorTitle}>INTERRUPTION</Text>
          <Text style={styles.errorText}>{error.toUpperCase()}</Text>
          <View style={styles.buttonStack}>
            <TouchableOpacity onPress={generateAiTrip} style={styles.primaryButton}>
              <Text style={styles.buttonText}>RETRY GENERATION</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/mytrip" as any)}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>RETURN TO HOME</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingWrapper: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 40,
  },
  lottie: {
    width: width * 0.6,
    height: width * 0.6,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "outfitBold",
    color: Colors.PRIMARY,
    letterSpacing: 4,
    textAlign: "center",
    marginTop: 20,
  },
  loadingSub: {
    fontSize: 9,
    fontFamily: "outfitBold",
    color: Colors.MUTED_TEXT,
    letterSpacing: 2,
    marginTop: 8,
  },
  errorWrapper: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 12,
    fontFamily: "outfitBold",
    color: Colors.PRIMARY,
    letterSpacing: 5,
    marginBottom: 20,
    opacity: 0.5,
  },
  errorText: {
    fontFamily: "outfitBold",
    fontSize: 14,
    color: Colors.PRIMARY,
    textAlign: "center",
    lineHeight: 22,
    letterSpacing: 1,
    marginBottom: 40,
  },
  buttonStack: {
    width: "100%",
    gap: 15,
  },
  primaryButton: {
    backgroundColor: Colors.PRIMARY,
    height: 65,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 6,
  },
  buttonText: {
    color: Colors.WHITE,
    fontFamily: "outfitBold",
    fontSize: 13,
    letterSpacing: 2,
  },
  secondaryButton: {
    height: 65,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: Colors.MUTED_TEXT,
    fontFamily: "outfitBold",
    fontSize: 13,
    letterSpacing: 2,
  },
});
