import { View, Text, Dimensions } from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import LottieView from "lottie-react-native";
import { Colors } from "../../../constants/Colors";
import { FESTIVE_AI_PROMPT } from "../../../constants/Options";
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
import { FestiveTripContext } from "../../../context/FestiveTripContext";
import Constants from "expo-constants";

const { width, height } = Dimensions.get("window");

export default function GenerateTrip() {
  const { festiveData, setFestiveData } = useContext(FestiveTripContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const user = auth.currentUser;
  const hasGenerated = useRef(false);

  useEffect(() => {
    const isTripReady =
      festiveData?.locationInfo?.title &&
      festiveData?.totalDays &&
      festiveData?.traveler?.title &&
      festiveData?.budget &&
      festiveData?.startDate &&
      festiveData?.endDate;

    if (isTripReady && user && !hasGenerated.current) {
      hasGenerated.current = true;
      generateAiTrip();
    } else if (!user) {
      setError("User not authenticated.");
    }
  }, [festiveData]);

  const cleanAiResponse = (rawText) => {
    return rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
  };

  function formatDateForMMT(dateStr, transportType) {
    const date = new Date(dateStr);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); 
    const day = String(date.getDate()).padStart(2, "0");

    if (transportType === "flight") {
      // Flight format: DD/MM/YYYY
      return `${day}/${month}/${year}`;
    } else if (transportType === "train") {
      // Train format: YYYYMMDD
      return `${year}${month}${day}`;
    } else {
      throw new Error("Invalid transportType. Use 'flight' or 'train'.");
    }
  }
  const flightDate = formatDateForMMT(festiveData.startDate, "flight"); 
  const trainDate = formatDateForMMT(festiveData.startDate, "train");

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
      const normalizedKey = `${festiveData.locationInfo.title.toLowerCase()}-${
        festiveData.totalDays
      }-${festiveData.budget.toLowerCase()}-${festiveData.tripType.toLowerCase()}`;

      const savedTripRef = doc(db, "SavedTripData", normalizedKey);
      const existingTrip = await getDoc(savedTripRef);

      const { startDate, endDate, traveler, ...tripTemplateData } = festiveData;
      const { icon, ...cleanTraveler } = festiveData.traveler;

      if (existingTrip.exists()) {
        console.log("♻️ Using cached trip data");
        const data = existingTrip.data();
        const userTripRef = doc(collection(db, "UserTrips"));
        await setDoc(userTripRef, {
          userEmail: user.email,
          userId: user.uid,
          savedTripId: normalizedKey,
          startDate: festiveData.startDate,
          endDate: festiveData.endDate,
          traveler: cleanTraveler,
          createdAt: serverTimestamp(),
        });
        setLoading(false);
        router.push("(tabs)/mytrip");
        return;
      }

      const FINAL_PROMPT = FESTIVE_AI_PROMPT.replace(
        /{location}/g,
        festiveData?.locationInfo?.title
      )
        .replace(/{departure}/g, festiveData?.departureInfo?.name)
        .replace(/{totalDays}/g, festiveData?.totalDays)
        .replace(/{totalNight}/g, festiveData?.totalDays - 1)
        .replace(/{flightDate}/g, flightDate)
        .replace(/{trainDate}/g, trainDate)
        .replace(/{tripType}/g, festiveData?.tripType)
        .replace(/{traveler}/g, festiveData?.traveler?.title)
        .replace(/{festival}/g, festiveData?.locationInfo?.festival)
        .replace(/{budget}/g, festiveData?.budget);

      const aiResponse = await generateTripPlan(FINAL_PROMPT);

      const cleanedResponse = cleanAiResponse(aiResponse);
      let parsedfestiveData;

      try {
        parsedfestiveData = JSON.parse(cleanedResponse);
      } catch (parseErr) {
        throw new Error("Failed to parse AI response. Please try again.");
      }

      const normalizedTrip = normalizeItinerary(parsedfestiveData);

      const imageUrl = await fetchUnsplashImage(
        festiveData?.locationInfo?.title || "travel"
      );

      await setDoc(savedTripRef, {
        savedTripId: normalizedKey,
        festiveData: tripTemplateData,
        tripPlan: normalizedTrip,
        imageUrl: imageUrl,
      });

      const userTripRef = doc(collection(db, "UserTrips"));
      await setDoc(userTripRef, {
        userEmail: user.email,
        userId: user.uid,
        savedTripId: normalizedKey,
        startDate: festiveData.startDate,
        endDate: festiveData.endDate,
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
            source={require("../../../assets/animations/festive-loading.json")}
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
