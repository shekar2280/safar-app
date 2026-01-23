import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Dimensions,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { Image } from "expo-image";

const { width, height } = Dimensions.get("window");

export default function TransportInfo({ transportData }) {

  if (
    !transportData ||
    (!Array.isArray(transportData.outbound) &&
      !Array.isArray(transportData.return))
  ) {
    return null;
  }

  const renderSegments = (segments, title) => (
    <View style={{ marginBottom: height * 0.03 }}>
      <Text
        style={{
          fontSize: width * 0.045,
          fontFamily: "outfitBold",
          marginBottom: height * 0.015,
        }}
      >
        {title}
      </Text>

      {segments.map((segment, index) => (
        <View
          key={index}
          style={{
            marginBottom: height * 0.03,
            paddingBottom: height * 0.015,
            borderBottomWidth: index !== segments.length - 1 ? 1 : 0,
            borderColor: Colors.LIGHT_GRAY,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: height * 0.005,
            }}
          >
            <Text
              style={{
                fontSize: width * 0.035,
                fontFamily: "outfitBold",
                flex: 1,
                paddingRight: width * 0.02,
              }}
            >
              {segment.transportType === "Flight"
                ? "✈️"
                : segment.transportType === "Train"
                ? "🚆"
                : "🚌"}{" "}
              {segment.transportType}-{index + 1}: {segment.from} → {segment.to}
            </Text>

            {segment.bookingURL && (
              <TouchableOpacity
                onPress={() => Linking.openURL(segment.bookingURL)}
                style={{
                  backgroundColor: Colors.PRIMARY,
                  paddingVertical: height * 0.008,
                  paddingHorizontal: width * 0.04,
                  borderRadius: width * 0.02,
                }}
              >
                <Text
                  style={{
                    color: Colors.WHITE,
                    fontFamily: "outfit",
                    fontSize: width * 0.035,
                  }}
                >
                  Book
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={{ fontSize: width * 0.037, fontFamily: "outfit" }}>
            Provider: {segment.provider}{" "}
            {segment.transportNumber ? `(${segment.transportNumber})` : ""}
          </Text>
          <Text style={{ fontSize: width * 0.037, fontFamily: "outfit" }}>
            Departure: {segment.departureTime}
          </Text>
          <Text style={{ fontSize: width * 0.037, fontFamily: "outfit" }}>
            Arrival: {segment.arrivalTime}
          </Text>
          <Text style={{ fontSize: width * 0.037, fontFamily: "outfit" }}>
            Price: ₹{segment.price}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View
      style={{
        marginTop: height * 0.025,
        borderWidth: 2,
        borderColor: Colors.LIGHT_GRAY,
        padding: width * 0.04,
        borderRadius: width * 0.035,
        backgroundColor: Colors.WHITE,
      }}
    >
      <Text
        style={{
          fontSize: width * 0.05,
          fontFamily: "outfitBold",
          marginBottom: height * 0.02,
          alignItems: "center",
        }}
      >
        <Image
          source={require("../../assets/images/transport.png")}
          style={{ width: 30, height: 30, marginTop: height * 0.05 }}
        />{" "}
        Transport Options
      </Text>

      {Array.isArray(transportData.outbound) &&
        renderSegments(transportData.outbound, "Outbound (Departure)")}
      {Array.isArray(transportData.return) &&
        renderSegments(transportData.return, "Return (Back to Departure)")}
    </View>
  );
}
