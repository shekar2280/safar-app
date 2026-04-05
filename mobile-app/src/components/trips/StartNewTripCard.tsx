import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Colors } from "@/src/constants/colors";
import LottieView from "lottie-react-native";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function StartNewTripCard() {
  return (
    <View
      style={{
        padding: width * 0.06,
        marginTop: height * 0.03,
        alignItems: "center",
        gap: height * 0.025,
      }}
    >
      <LottieView
        source={require("../../../assets/animations/notrips.json")}
        autoPlay
        loop
        style={{ width: width * 0.98, height: height * 0.35 }}
      />

      <Text style={{ fontSize: width * 0.06, fontFamily: "playfairBold", textAlign: "center" }}>
        No Trips Planned Yet
      </Text>

      <Text
        style={{
          fontSize: width * 0.045,
          fontFamily: "playfair",
          textAlign: "center",
          color: Colors.GRAY,
          marginHorizontal: width * 0.05,
        }}
      >
        Time to plan a new travel experience! Get started below.
      </Text>
    </View>
  );
}
