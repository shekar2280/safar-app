import { View, Text, Dimensions } from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import LottieView from "lottie-react-native";
import { Colors } from "../../../constants/Colors";
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
import Constants from "expo-constants";
import { TrendingTripContext } from "../../../context/TrendingTripContext";
import { AI_PROMPT } from "../../../constants/Options";
const { width, height } = Dimensions.get("window");

export default function GenerateTrip() {
  const { trendingData } = useContext(TrendingTripContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const user = auth.currentUser;
  const hasGenerated = useRef(false);

  useEffect(() => {
    const isTripReady =
      trendingData?.locationInfo?.title &&
      trendingData?.totalDays &&
      trendingData?.traveler?.title &&
      trendingData?.budget &&
      trendingData?.startDate &&
      trendingData?.endDate;

    if (isTripReady && user && !hasGenerated.current) {
      hasGenerated.current = true;
      generateAiTrip();
    } else if (!user) {
      setError("User not authenticated.");
    }
  }, [trendingData]);

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
      return data?.results?.[0]?.urls?.regular || null;
    } catch (error) {
      console.error("Error fetching Unsplash image:", error);
      return null;
    }
  };

  const generateAiTrip = async () => {
    setLoading(true);
    setError(null);

    try {
      const normalizedKey = `${trendingData.locationInfo.title.toLowerCase()}-${
        trendingData.totalDays
      }-${trendingData.budget.toLowerCase()}-${trendingData.tripType.toLowerCase()}`;

      const savedTripRef = doc(db, "SavedTripData", normalizedKey);
      const existingTrip = await getDoc(savedTripRef);

      const { startDate, endDate, traveler, ...tripTemplateData } = trendingData;
      const { icon, ...cleanTraveler } = trendingData.traveler;

      if (existingTrip.exists()) {
        const data = existingTrip.data();
        const userTripRef = doc(collection(db, "UserTrips"));
        await setDoc(userTripRef, {
          userEmail: user.email,
          userId: user.uid,
          savedTripId: normalizedKey,
          startDate: trendingData.startDate,
          endDate: trendingData.endDate,
          traveler: cleanTraveler,
          isActive: false,
          createdAt: serverTimestamp(),
        });
        setLoading(false);
        router.push("(tabs)/mytrip");
        return;
      }

      const FINAL_PROMPT = AI_PROMPT.replace(
        /{location}/g,
        trendingData?.locationInfo?.title
      )
        .replace(/{departure}/g, trendingData?.departureInfo?.label)
        .replace(/{totalDays}/g, trendingData?.totalDays)
        .replace(/{totalNight}/g, trendingData?.totalDays - 1)
        .replace(/{tripType}/g, trendingData?.tripType)
        .replace(/{traveler}/g, trendingData?.traveler?.title)
        .replace(/{budget}/g, trendingData?.budget);

      const aiResponse = await generateTripPlan(FINAL_PROMPT);

      const cleanedResponse = cleanAiResponse(aiResponse);
      const parsedTripData = JSON.parse(cleanedResponse);

      const normalizedTrip = normalizeItinerary(parsedTripData);

      const { trendingPlaces, ...cleanedTrendingData } = trendingData;

      const imageUrl = await fetchUnsplashImage(
        trendingData?.locationInfo?.title || "travel"
      );

      await setDoc(savedTripRef, {
        savedTripId: normalizedKey,
        tripData: tripTemplateData,
        tripPlan: normalizedTrip,
        imageUrl: imageUrl,
      });

      const userTripRef = doc(collection(db, "UserTrips"));
      await setDoc(userTripRef, {
        userEmail: user.email,
        userId: user.uid,
        savedTripId: normalizedKey,
        startDate: trendingData.startDate,
        endDate: trendingData.endDate,
        traveler: cleanTraveler,
        isActive: false,
        createdAt: serverTimestamp(),
      });

      setLoading(false);
      router.push("(tabs)/mytrip");
    } catch (err) {
      console.error("❌ Error generating AI trip:", err);

      let message = "Something went wrong. Please try again.";
      if (err?.message?.includes("503")) {
        message = "Under maintenance, try again later.";
      }

      setError(message);
      setLoading(false);
      hasGenerated.current = false;
    }
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
      <Text
        style={{
          fontSize: width * 0.07,
          fontFamily: "outfitBold",
          textAlign: "center",
        }}
      >
        {loading && (
          <LottieView
            source={require("../../../assets/animations/loading.json")}
            autoPlay
            loop
            style={{
              width: width * 0.7,
              height: width * 0.7,
              marginTop: height * 0.05,
            }}
          />
        )}
        {error ? " " : "Generating your trip"}
      </Text>

      {error && (
        <View style={{ alignItems: "center", marginTop: height * 0.03 }}>
          <Text style={{ fontSize: width * 0.2 }}>❌</Text>
          <Text
            style={{
              marginTop: height * 0.02,
              fontSize: width * 0.045,
              fontFamily: "outfitBold",
              color: "red",
              textAlign: "center",
              paddingHorizontal: width * 0.05,
            }}
          >
            {error}
          </Text>
        </View>
      )}
    </View>
  );
}
