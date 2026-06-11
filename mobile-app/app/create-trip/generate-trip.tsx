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
import { Colors, useThemeColors } from "@/src/constants/colors";
import { useTheme } from "@/src/context/ThemeContext";
import { CreateTripContext } from "@/src/context/CreateTripContext";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth } from "@/src/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
import { normalizeItinerary } from "@/src/utils/normalizeItinerary";
import { jsonrepair } from "jsonrepair";
import * as Haptics from "expo-haptics";
import { CITY_TO_IATA } from "@/src/constants/iata";
import { 
  AI_PROMPT, 
  HIDDEN_GEMS_AI_PROMPT, 
  FESTIVE_AI_PROMPT, 
  CONCERT_TRIP_AI_PROMPT 
} from "@/src/constants/prompts";
import { apiGet, apiPost, JWT_KEY, updateUserProfile } from "@/src/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/src/context/UserContext";
import { useQueryClient } from "@tanstack/react-query";
import { tripQueryKeys } from "@/src/hooks/queries/useTrips";
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
  const { userProfile } = useUser();
  const queryClient = useQueryClient();
  const hasGenerated = useRef(false);
  const [retryCount, setRetryCount] = useState(0);
  const colors = useThemeColors();
  const { isDark } = useTheme();

  useEffect(() => {
    const isTripReady =
      tripData?.destinationInfo?.name &&
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

    const normalizedKey = `${tripData.destinationInfo?.shortName?.toLowerCase()}-${tripData.totalDays}-${tripData.budget?.toLowerCase()}`;

    let itineraryData: any, finalImageUrl: any, destinationIata: string;

    while (attempts < maxAttempts && !success) {
      try {
        setRetryCount(attempts);
        
        const days = parseInt(tripData.totalDays!.toString());
        const totalPlaces = days * 4;
        const perSlot = days;
        const totalRecs = days * 2;

        let basePrompt = AI_PROMPT;
        const category = tripData.tripCategory;

        if (category === "HIDDEN_GEMS") {
          basePrompt = HIDDEN_GEMS_AI_PROMPT;
        } else if (category === "FESTIVE") {
          basePrompt = FESTIVE_AI_PROMPT;
        } else if (category === "CONCERT") {
          basePrompt = CONCERT_TRIP_AI_PROMPT;
        }

        let FINAL_ITINERARY_PROMPT = basePrompt
          .replace(/{location}/g, tripData.destinationInfo?.name || "")
          .replace(/{totalDays}/g, tripData.totalDays!.toString())
          .replace(/{totalNight}/g, (days - 1).toString())
          .replace(/{traveler}/g, tripData.traveler?.title || "")
          .replace(/{travelers}/g, tripData.traveler?.title || "") 
          .replace(/{budget}/g, tripData.budget || "")
          .replace(/{totalPlaces}/g, totalPlaces.toString())
          .replace(/{perSlot}/g, perSlot.toString())
          .replace(/{totalRecs}/g, totalRecs.toString())
          .replace(/{travelerMode}/g, tripData.travelerMode || "SOLO")
          .replace(/{venueName}/g, (tripData.destinationInfo as any)?.venueName || tripData.destinationInfo?.name || "");

        if ((tripData as any).festival) {
          FINAL_ITINERARY_PROMPT = FINAL_ITINERARY_PROMPT.replace(/{festival}/g, (tripData as any).festival);
        }
        
        if (concertContext?.concertData?.artist) {
          FINAL_ITINERARY_PROMPT = FINAL_ITINERARY_PROMPT.replace(/{artist}/g, concertContext.concertData.artist);
        }

        const result = await apiPost<{ itinerary: string, imageUrl?: string, imageUrls?: string[] }>("/api/v1/discovery/generate", {
          itineraryPrompt: FINAL_ITINERARY_PROMPT,
          locationName: tripData.destinationInfo?.name,
          tripCategory: category || "GENERAL",
          latitude: tripData.destinationInfo?.coordinates?.lat,
          longitude: tripData.destinationInfo?.coordinates?.lon,
        });

        const rawAiResponse = cleanAiResponse(result.itinerary);
        const repairedJson = jsonrepair(rawAiResponse);
        const aiData = JSON.parse(repairedJson);

        itineraryData = normalizeItinerary(aiData);
        finalImageUrl = result.imageUrl || result.imageUrls || "";
        destinationIata = aiData.destinationIata || "N/A";

        const jwt = await AsyncStorage.getItem(JWT_KEY);
        if (!jwt) throw new Error("Not authenticated with backend");

        const { icon: _icon, ...cleanTraveler } = (tripData.traveler as any) || {};

        const isConcert = tripData.tripCategory === "CONCERT";
        const festivalName = (tripData.destinationInfo as any)?.festival;
        const finalArtist = (tripData.destinationInfo as any)?.artist || concertContext?.concertData?.artist;

        const concertPayload = isConcert ? {
          artist: finalArtist,
          title: festivalName || `${finalArtist} Concert`,
          venueName: (tripData.destinationInfo as any)?.venueName || tripData.destinationInfo?.name,
          venueAddress: (tripData.destinationInfo as any)?.venueAddress,
          concertDate: (tripData as any).concertDate || (tripData.destinationInfo as any)?.concertDate,
          concertTime: (tripData.destinationInfo as any)?.concertTime,
          bookingUrl: (tripData.destinationInfo as any)?.bookingUrl,
          priceRange: (tripData.destinationInfo as any)?.priceRange,
          image_urls: concertContext?.concertData?.artistImageUrl 
            ? [concertContext.concertData.artistImageUrl] 
            : (tripData.destinationInfo?.imageUrl ? [tripData.destinationInfo.imageUrl] : [])
        } : null;

        const newlyCreatedTrip = await apiPost<any>("/api/v1/trips", {
          trip_plan: itineraryData,
          image_urls: Array.isArray(finalImageUrl) ? finalImageUrl : (finalImageUrl ? [finalImageUrl] : []),
          total_days: tripData.totalDays,
          traveler: cleanTraveler,
          traveler_mode: tripData.travelerMode || "SOLO",
          concert_data: concertPayload,
        });

        const imageUrls: string[] = newlyCreatedTrip.image_urls ?? [];
        const mappedTrip = {
          id: String(newlyCreatedTrip.id),
          savedTripId: newlyCreatedTrip.id,
          userEmail: "",
          userId: String(newlyCreatedTrip.user_id ?? ""),
          totalDays: newlyCreatedTrip.total_days ?? 1,
          traveler: newlyCreatedTrip.traveler,
          travelerMode: newlyCreatedTrip.traveler_mode,
          isActive: newlyCreatedTrip.is_active,
          isFinished: newlyCreatedTrip.is_finished,
          totalBudget: newlyCreatedTrip.total_budget || 0,
          visitedIndices: newlyCreatedTrip.visited_indices || [],
          archivedSpendings: newlyCreatedTrip.archived_spendings || [],
          activatedAt: newlyCreatedTrip.activated_at,
          completedAt: newlyCreatedTrip.completed_at,
          updatedAt: newlyCreatedTrip.updated_at,
          createdAt: newlyCreatedTrip.created_at,
          tripPlan: newlyCreatedTrip.trip_plan,
          concertData: newlyCreatedTrip.concert_data,
          imageUrl: newlyCreatedTrip.image_url || newlyCreatedTrip.imageUrl || (imageUrls.length > 0 ? imageUrls : undefined),
        };

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        success = true;

        queryClient.setQueryData(tripQueryKeys.lists(), (old: any) => {
          return old ? [mappedTrip, ...old] : [mappedTrip];
        });
        
        queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
        setLoading(false);
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
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      {loading && (
        <View style={styles.loadingWrapper}>
          <LottieView
            source={require("../../assets/animations/loading.json")}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text style={[styles.loadingText, { color: colors.TEXT }]}>{getLoadingMessage().toUpperCase()}</Text>
          <Text style={[styles.loadingSub, { color: colors.MUTED_TEXT }]}>WE ARE CRAFTING YOUR UNIQUE JOURNEY</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorWrapper}>
          <View style={styles.errorIconContainer}>
             <Ionicons name="sparkles" size={40} color={colors.GOLD} style={styles.sparkleIcon} />
             <Ionicons name="cloud-offline-outline" size={80} color={isDark ? "white" : "black"} />
          </View>
          
          <Text style={[styles.errorTitle, { color: colors.TEXT }]}>SYSTEM OVERLOAD</Text>
          
          <Text style={[styles.errorText, { color: colors.MUTED_TEXT }]}>
            Our travel engines are a bit overwhelmed. We couldn't map out your route this time.
          </Text>

          <View style={styles.buttonStack}>
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: isDark ? "white" : "black" }]} 
              onPress={generateAiTrip}
            >
              <Text style={[styles.buttonText, { color: isDark ? "black" : "white" }]}>RETRY GENERATION</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.secondaryButton, { borderColor: colors.GOLD, backgroundColor: Colors.GOLD }]} 
              onPress={() => router.replace("/(tabs)/mytrip" as any)}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.BLACK }]}>RETURN HOME</Text>
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
    letterSpacing: 4,
    textAlign: "center",
    marginTop: 20,
  },
  loadingSub: {
    fontSize: 9,
    fontFamily: "outfitBold",
    letterSpacing: 2,
    marginTop: 8,
  },
  errorWrapper: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 30,
  },
  errorIconContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sparkleIcon: {
    position: 'absolute',
    top: -15,
    right: -15,
  },
  errorTitle: {
    fontSize: 22,
    fontFamily: "outfitBold",
    letterSpacing: 2,
    marginBottom: 12,
    textAlign: 'center'
  },
  errorText: {
    fontFamily: "outfitMedium",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  buttonStack: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    fontFamily: "outfitBold",
    fontSize: 14,
    letterSpacing: 1.5,
  },
  secondaryButton: {
    width: '100%',
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontFamily: "outfitBold",
    fontSize: 14,
    letterSpacing: 1.5,
  },
});