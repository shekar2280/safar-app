import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import LottieView from "lottie-react-native";
import { Colors } from "../../../constants/Colors";
import { AI_PROMPT, DiscoverTripImages, fallbackImages } from "../../../constants/Options";
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
import { DiscoverTripContext } from "../../../context/DiscoverTripContext";
import Constants from "expo-constants";

const { width, height } = Dimensions.get("window");

export default function GenerateTrip() {
  const { discoverData } = useContext(DiscoverTripContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const user = auth.currentUser;
  const hasGenerated = useRef(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const isTripReady =
      discoverData?.locationInfo?.title &&
      discoverData?.totalDays &&
      discoverData?.traveler?.title &&
      discoverData?.budget &&
      discoverData?.startDate &&
      discoverData?.endDate;

    if (isTripReady && user && !hasGenerated.current) {
      hasGenerated.current = true;
      generateAiTrip();
    } else if (!user) {
      setError("User not authenticated.");
    }
  }, [discoverData]);

  const cleanAiResponse = (rawText) => {
    return rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
  };

  const fetchUnsplashImage = async (locationName) => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          locationName + " famous place"
        )}&per_page=1&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${Constants.expoConfig.extra.UNSPLASH_API_KEY}`,
          },
        }
      );
      const data = await response.json();
      const raw = data?.results?.[0]?.urls?.raw;

      if (raw) {
        return `${raw}&auto=format&fit=crop&w=900&h=600&q=70`;
      }

      return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    } catch (error) {
      const randomIndex = Math.floor(Math.random() * fallbackImages.length);
      return fallbackImages[randomIndex];
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
    let aiResponse = null;

    try {
      const normalizedKey = `${discoverData.locationInfo.title.toLowerCase()}-${
        discoverData.totalDays
      }-${discoverData.budget.toLowerCase()}-${discoverData.tripType.toLowerCase()}`;

      const savedTripRef = doc(db, "SavedTripData", normalizedKey);
      const existingTrip = await getDoc(savedTripRef);

      const { startDate, endDate, traveler, ...tripTemplateData } =
        discoverData;
      const { icon, ...cleanTraveler } = discoverData.traveler;

      if (existingTrip.exists()) {
        const userTripRef = doc(collection(db, "UserTrips"));
        await setDoc(userTripRef, {
          userEmail: user.email,
          userId: user.uid,
          savedTripId: normalizedKey,
          startDate: discoverData.startDate,
          endDate: discoverData.endDate,
          traveler: cleanTraveler,
          isActive: false,
          createdAt: serverTimestamp(),
        });
        setLoading(false);
        router.replace("/(tabs)/mytrip");
        return;
      }

      const FINAL_PROMPT = AI_PROMPT.replace(
        /{location}/g,
        discoverData?.locationInfo?.title
      )
        .replace(/{departure}/g, discoverData?.departureInfo?.name)
        .replace(/{totalDays}/g, discoverData?.totalDays)
        .replace(/{totalNight}/g, discoverData?.totalDays - 1)
        .replace(/{tripType}/g, discoverData?.tripType)
        .replace(/{traveler}/g, discoverData?.traveler?.title)
        .replace(/{budget}/g, discoverData?.budget);

      while (attempts < maxAttempts && !success) {
        try {
          setRetryCount(attempts);
          aiResponse = await generateTripPlan(FINAL_PROMPT);
          success = true;
        } catch (err) {
          attempts++;
          if (attempts < maxAttempts) {
            await delay(attempts * 2000);
          } else {
            throw err;
          }
        }
      }

      const cleanedResponse = cleanAiResponse(aiResponse);
      const parsedData = JSON.parse(cleanedResponse);
      const normalizedTrip = normalizeItinerary(parsedData);

      const locationTitle = discoverData?.locationInfo?.title;
      let finalImageUrl = "";

      if(DiscoverTripImages[locationTitle]){
        finalImageUrl = DiscoverTripImages[locationTitle];
      }else{  
        finalImageUrl = await fetchUnsplashImage(discoverData?.locationInfo?.title);
      }

      await setDoc(savedTripRef, {
        savedTripId: normalizedKey,
        discoverData: tripTemplateData,
        tripPlan: normalizedTrip,
        imageUrl: finalImageUrl,
      });

      const userTripRef = doc(collection(db, "UserTrips"));
      await setDoc(userTripRef, {
        userEmail: user.email,
        userId: user.uid,
        savedTripId: normalizedKey,
        startDate: discoverData.startDate,
        endDate: discoverData.endDate,
        traveler: cleanTraveler,
        isActive: false,
        createdAt: serverTimestamp(),
      });

      setLoading(false);
      router.replace("/(tabs)/mytrip");
    } catch (err) {
      let message = "Something went wrong. Please try again.";
      if (err?.message?.includes("503") || err?.message?.includes("429")) {
        message =
          "The AI server is currently busy. Please try again in a moment.";
      }
      setError(message);
      setLoading(false);
      hasGenerated.current = false;
    }
  };

  const getLoadingMessage = () => {
    if (retryCount === 0) return "Generating your trip...";
    if (retryCount === 1) return "Retrying...";
    return "Almost there, finishing touches...";
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
            source={require("../../../assets/animations/travel.json")}
            autoPlay
            loop
            style={{ width: width * 0.7, height: width * 0.7 }}
          />
          <Text
            style={{
              fontSize: width * 0.06,
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
              paddingHorizontal: 20,
            }}
          >
            {error}
          </Text>

          <TouchableOpacity
            onPress={() => generateAiTrip()}
            style={{
              marginTop: 20,
              backgroundColor: Colors.PRIMARY,
              padding: 15,
              borderRadius: 15,
              width: width * 0.7,
            }}
          >
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontFamily: "outfitBold",
                fontSize: 16,
              }}
            >
              Try Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/mytrip")}
            style={{
              marginTop: 15,
              padding: 15,
              borderRadius: 15,
              borderWidth: 1,
              borderColor: Colors.PRIMARY,
              width: width * 0.7,
            }}
          >
            <Text
              style={{
                color: Colors.PRIMARY,
                textAlign: "center",
                fontFamily: "outfitBold",
                fontSize: 16,
              }}
            >
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
