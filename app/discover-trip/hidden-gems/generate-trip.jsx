import { View, Text, Dimensions } from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import LottieView from "lottie-react-native";
import { Colors } from "../../../constants/Colors";
import { AI_PROMPT } from "../../../constants/Options";
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
  const { discoverData, setDiscoverData } = useContext(DiscoverTripContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const user = auth.currentUser;
  const hasGenerated = useRef(false);

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
      const normalizedKey = `${discoverData.locationInfo.title.toLowerCase()}-${
        discoverData.totalDays
      }-${discoverData.budget.toLowerCase()}-${discoverData.tripType.toLowerCase()}`;

      const savedTripRef = doc(db, "SavedTripData", normalizedKey);
      const existingTrip = await getDoc(savedTripRef);

      const { startDate, endDate, traveler, ...tripTemplateData } =
        discoverData;
      const { icon, ...cleanTraveler } = discoverData.traveler;

      if (existingTrip.exists()) {
        console.log("♻️ Using cached trip data");
        const data = existingTrip.data();
        const userTripRef = doc(collection(db, "UserTrips"));
        await setDoc(userTripRef, {
          userEmail: user.email,
          userId: user.uid,
          savedTripId: normalizedKey,
          startDate: discoverData.startDate,
          endDate: discoverData.endDate,
          traveler: cleanTraveler,
          createdAt: serverTimestamp(),
        });
        setLoading(false);
        router.push("(tabs)/mytrip");
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

      const aiResponse = await generateTripPlan(FINAL_PROMPT);

      const cleanedResponse = cleanAiResponse(aiResponse);
      const parseddiscoverData = JSON.parse(cleanedResponse);

      const normalizedTrip = normalizeItinerary(parseddiscoverData);

      const imageUrl = await fetchUnsplashImage(
        discoverData?.locationInfo?.title || "travel"
      );

      await setDoc(savedTripRef, {
        savedTripId: normalizedKey,
        discoverData: tripTemplateData,
        tripPlan: normalizedTrip,
        imageUrl: imageUrl,
      });

      const userTripRef = doc(collection(db, "UserTrips"));
      await setDoc(userTripRef, {
        userEmail: user.email,
        userId: user.uid,
        savedTripId: normalizedKey,
        startDate: discoverData.startDate,
        endDate: discoverData.endDate,
        traveler: cleanTraveler,
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
        paddingTop: height * 0.12,
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
            source={require("../../../assets/animations/travel.json")}
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
        <View style={{ alignItems: "center", marginTop: height * 0.05 }}>
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
