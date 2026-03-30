import {
  View,
  Text,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
  Platform,
  Alert,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "@/src/constants/colors";
import { CommonTripContext } from "@/src/context/CommonTripContext";

import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db } from "@/src/lib/firebase";
import TrendingLocationPicker from "@/src/components/trip/TrendingLocationPicker";
import TripTypeToggle from "@/src/components/trip/TripTypeToggle";
import * as Haptics from "expo-haptics";
import { TrendingLocationData, TripType } from "@/src/types/interfaces";
import { TRENDING_PLACE_PROMPT } from "@/src/constants/prompts";

const { width, height } = Dimensions.get("window");

export default function SearchDeparture() {
  const navigation = useNavigation();
  const router = useRouter();
  const context = useContext(CommonTripContext);
  const [loading, setLoading] = useState(false);
  const [tripType, setTripType] = useState<TripType>(TripType.Oneway);
  const [location, setLocation] = useState<TrendingLocationData | null>(null);
  const user = auth.currentUser;

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "Departure",
    });
  }, []);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.showWithGravity(
        message,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
    } else {
      Alert.alert("Notice", message);
    }
  };

  const fetchTrendingPlaces = async (locationInfo: TrendingLocationData) => {
    if (!user) return null;
    let attempts = 0;
    const maxAttempts = 2; 
    let success = false;
    let aiResp = null;

    const FETCH_TRENDING_PLACES = process.env.EXPO_PUBLIC_FETCH_TRENDING_PLACES;
    if (!FETCH_TRENDING_PLACES) return null;

    try {
      const snapshot = await getDoc(
        doc(db, "TrendingPlaces", locationInfo.normalizedKey)
      );

      if (snapshot.exists()) {
        const cachedData = snapshot.data().trendingPlaces;
        if (context) {
          context.setTripDetails({ ...context.tripDetails, trendingPlaces: cachedData });
        }
        return cachedData;
      }

      const prompt = TRENDING_PLACE_PROMPT.replace(
        /{location}/g,
        locationInfo.label
      );

      while (attempts < maxAttempts && !success) {
        try {
          const response = await fetch(FETCH_TRENDING_PLACES, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trendingPlacesPrompt: prompt }),
          });

          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Backend failed");

          let rawText = result.trendingPlaces;
          const cleanText = rawText.replace(/```json|```/g, "").trim();
          aiResp = JSON.parse(cleanText);

          success = true;
        } catch (err: any) {
          console.log(`Attempt ${attempts + 1} failed:`, err.message);
          attempts++;
          if (attempts < maxAttempts) {
            await delay(2000);
          } else {
            throw err;
          }
        }
      }

      if (aiResp && Array.isArray(aiResp) && aiResp.length > 0) {
        if (context) {
          context.setTripDetails({ ...context.tripDetails, trendingPlaces: aiResp });
        }

        await setDoc(doc(db, "TrendingPlaces", locationInfo.normalizedKey), {
          userEmail: user?.email,
          city: locationInfo.city,
          state: locationInfo.state,
          country: locationInfo.country,
          normalizedKey: locationInfo.normalizedKey,
          trendingPlaces: aiResp,
          createdAt: serverTimestamp(),
        });
      }

      return aiResp;
    } catch (error) {
      console.error("AI Fetch Error:", error);
      return null;
    }
  };

  const handleContinue = async () => {
    if (!location || !context) return;

    setLoading(true);

    context.setTripDetails({
      ...context.tripDetails,
      departureInfo: location as any,
      tripType: tripType,
    });

    const data = await fetchTrendingPlaces(location);

    setLoading(false);

    if (data && Array.isArray(data) && data.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push("/discover-trip/trip-manager/select-trending-destination" as any);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast("Unable to find trending places for this location. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <TripTypeToggle
        selectedType={tripType}
        onSelectType={(type) => setTripType(type as TripType)}
      />

      <TrendingLocationPicker
        title="Where from?"
        onLocationChange={(data) => setLocation(data as any)}
      />

      <TouchableOpacity
        onPress={handleContinue}
        disabled={loading || !location}
        style={[styles.continueBtn, (loading || !location) && { opacity: 0.6 }]}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.continueText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: width * 0.06,
    paddingTop: height * 0.12,
    backgroundColor: Colors.WHITE,
    flex: 1,
  },
  continueBtn: {
    position: "absolute",
    bottom: 40,
    left: width * 0.06,
    right: width * 0.06,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 35,
  },
  continueText: {
    fontSize: 18,
    fontFamily: "outfitBold",
    color: "white",
  },
});
