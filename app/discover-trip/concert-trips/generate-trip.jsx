import { View, Text, Dimensions } from "react-native";
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
  const { concertData, setConcertData } = useContext(ConcertTripContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const user = auth.currentUser;
  const hasGenerated = useRef(false);

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

  const generateAiConcertTrip = async () => {
    setLoading(true);
    setError(null);

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
      const aiResponse = await generateTripPlan(FINAL_PROMPT);

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
      });

      setLoading(false);
      router.push("(tabs)/mytrip");
    } catch (err) {
      console.error("❌ Error generating concert trip:", err);
      setError("Something went wrong. Please try again.");
      hasGenerated.current = false;
      setLoading(false);
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
        {error ? " " : "Generating your concert trip"}
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
