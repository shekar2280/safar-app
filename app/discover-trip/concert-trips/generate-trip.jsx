import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import LottieView from "lottie-react-native";
import { Colors } from "../../../constants/Colors";
import { CONCERT_TRIP_AI_PROMPT } from "../../../constants/Options";
import { generateTripPlan } from "../../../config/AiModel";
import { useRouter } from "expo-router";
import { auth, db } from "../../../config/FirebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ConcertTripContext } from "../../../context/ConcertTripContext";

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
      generateAiConcertTrip();
    } else if (!user) {
      setError("User not authenticated.");
    }
  }, [concertData]);

  const cleanAiResponse = (rawText) => {
    return rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const generateAiConcertTrip = async () => {
    setLoading(true);
    setError(null);
    setRetryCount(0);

    let attempts = 0;
    const maxAttempts = 3;
    let success = false;
    let aiResponse = null;

    const FINAL_PROMPT = CONCERT_TRIP_AI_PROMPT.replace(
      /{travelers}/g,
      concertData?.traveler?.people ?? "1"
    )
      .replace(/{artist}/g, concertData?.artist)
      .replace(/{concertDate}/g, concertData?.locationInfo?.concertDate)
      .replace(/{departure}/g, concertData?.departureInfo?.name)
      .replace(/{tripType}/g, concertData?.tripType)
      .replace(/{location}/g, concertData?.locationInfo?.title)
      .replace(/{startDate}/g, concertData?.startDate);

    try {
      while (attempts < maxAttempts && !success) {
        try {
          setRetryCount(attempts);
          aiResponse = await generateTripPlan(FINAL_PROMPT);
          success = true;
        } catch (err) {
          attempts++;
          if (attempts < maxAttempts) {
            const waitTime = attempts * 2000;
            await delay(waitTime);
          } else {
            throw err;
          }
        }
      }

      const cleanedResponse = cleanAiResponse(aiResponse);
      let parsedConcertData;

      try {
        parsedConcertData = JSON.parse(cleanedResponse);
      } catch (parseErr) {
        throw new Error("Failed to parse AI response. Please try again.");
      }

      const docId = `${Date.now()}`;
      await setDoc(doc(db, "UserTrips", docId), {
        userEmail: user.email,
        concertData,
        tripPlan: parsedConcertData,
        docId: docId,
        createdAt: serverTimestamp(),
        isActive: false,
      });

      setLoading(false);
      router.push("(tabs)/mytrip");
    } catch (err) {
      let message = "Something went wrong. Please try again.";
      if (err?.message?.includes("503") || err?.message?.includes("429")) {
        message =
          "The AI server is currently busy. Please try again in a moment.";
      }
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
            source={require("../../../assets/animations/concert-1.json")}
            autoPlay
            loop
            style={{
              width: width * 0.7,
              height: width * 0.7,
              marginTop: height * 0.05,
            }}
          />
        )}
        {getLoadingMessage()}
      </Text>

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
