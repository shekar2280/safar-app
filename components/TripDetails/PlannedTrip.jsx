import { View, Text, Image, Dimensions } from "react-native";
import React from "react";
import { Colors } from "../../constants/Colors";

export default function PlannedTrip({ itineraryDetails }) {
  const screenWidth = Dimensions.get("window").width;

  const filteredDays = Object.entries(itineraryDetails || {})
    .filter(([key]) => key.toLowerCase().startsWith("day"))
    .sort(([a], [b]) => {
      const numA = parseInt(a.replace("day", ""));
      const numB = parseInt(b.replace("day", ""));
      return numA - numB;
    });

  if (!filteredDays.length) {
    return (
      <View style={{ padding: 15 }}>
        <Text style={{ fontSize: 18, fontFamily: "outfit" }}>
          ❗ No itinerary details available.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 30 }}>
      <Text
        style={{
          fontSize: 24,
          fontFamily: "outfitBold",
          marginBottom: 15,
          marginLeft: 5,
        }}
      >
        🗓️ Trip Plan
      </Text>

      <Image
        source={require("../../assets/images/daily-plan.jpeg")}
        style={{
          width: screenWidth - 40,
          height: 200,
          marginBottom: 10,
          borderRadius: 20,
          alignSelf: "center",
        }}
        resizeMode="cover"
      />

      {filteredDays.map(([dayKey, dayValue]) => (
        <View
          key={dayKey}
          style={{
            marginTop: 15,
            borderWidth: 1.5,
            borderColor: Colors.LIGHT_GRAY,
            borderRadius: 12,
            padding: 10,
            backgroundColor: Colors.WHITE,
            marginHorizontal: 5,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontFamily: "outfitBold",
              marginBottom: 10,
              color: Colors.PRIMARY,
            }}
          >
            📍 {dayKey.toUpperCase()}
          </Text>

          {dayValue.places?.length ? (
            dayValue.places.map((place, idx) => (
              <View
                key={idx}
                style={{
                  marginBottom: 15,
                  backgroundColor: Colors.LIGHT_GRAY,
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "outfitBold",
                    color: Colors.PRIMARY,
                  }}
                >
                  {place.placeName || "Unknown Place"}
                </Text>

                {place.bestTimeToVisit && (
                  <Text style={{ fontFamily: "outfit" }}>
                    🕐 Best Time: {place.bestTimeToVisit}
                  </Text>
                )}
                {place.estimatedTravelTime && (
                  <Text style={{ fontFamily: "outfit" }}>
                    ⏱ Travel: {place.estimatedTravelTime}
                  </Text>
                )}
                {place.placeDetails && (
                  <Text style={{ fontFamily: "outfit" }}>
                    💬 {place.placeDetails}
                  </Text>
                )}
                {place.ticketPricing !== undefined && (
                  <Text style={{ fontFamily: "outfit" }}>
                    🎟️ Ticket: ₹{place.ticketPricing}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text style={{ fontFamily: "outfit", color: Colors.GRAY }}>
              No places added for this day.
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}
