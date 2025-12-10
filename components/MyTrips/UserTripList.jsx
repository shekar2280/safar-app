import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { Colors } from "./../../constants/Colors";
import UserTripCard from "./UserTripCard";
import Constants from "expo-constants";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function UserTripList({ userTrips }) {
  const [trips, setTrips] = useState([]);
  const router = useRouter();

  const UNSPLASH_API_KEY = Constants.expoConfig.extra.UNSPLASH_API_KEY;

  useEffect(() => {
    const sorted = [...userTrips].sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
    setTrips(sorted);
  }, [userTrips]);

  const latestTrip = trips[0];

  if (!latestTrip) return null;
  const latestTripData =
    latestTrip?.tripData ||
    latestTrip?.discoverData ||
    latestTrip?.festiveData ||
    latestTrip?.concertData ||
    latestTrip?.trendingData ||
    {};

  const tripStartDate =
    latestTrip.startDate ||
    latestTripData.startDate ||
    latestTrip?.concertData?.startDate;
    
  const otherTrips = trips.slice(1);

  let imageUrl;

  if (latestTrip?.concertData) {
    imageUrl = require("../../assets/images/concert.jpg");
  } else if (latestTrip?.imageUrl) {
    imageUrl = latestTrip.imageUrl;
  } else {
    imageUrl = require("../../assets/images/homepage.jpg");
  }

  const handleDelete = (tripId) => {
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
  };

  if (!latestTrip) return null;

  return (
    <View style={{ marginTop: height * 0.025 }}>
      <Image
        source={typeof imageUrl === "string" ? { uri: imageUrl } : imageUrl}
        style={{
          width: "100%",
          height: height * 0.25,
          resizeMode: "cover",
          borderRadius: width * 0.04,
        }}
      />

      <Text
        style={{
          fontFamily: "outfitBold",
          fontSize: width * 0.05,
          marginTop: height * 0.015,
          justifyContent: "space-between",
        }}
        numberOfLines={1}
      >
        {latestTrip?.concertData
          ? `${latestTrip.concertData.artist} Concert`
          : latestTrip?.tripPlan?.tripName}
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: height * 0.005,
        }}
      >
        <Text
          style={{
            fontFamily: "outfit",
            fontSize: width * 0.04,
            color: Colors.GRAY,
          }}
        >
          {tripStartDate
            ? moment(tripStartDate).format("DD MMM YYYY")
            : "No date"}
        </Text>

        <View style={{ flexDirection: "row", gap: width * 0.005 }}>
          <Text
            style={{
              fontFamily: "outfit",
              fontSize: width * 0.04,
              color: Colors.GRAY,
            }}
          >
            Travelers:
          </Text>
          <Text
            style={{
              fontFamily: "outfit",
              fontSize: width * 0.04,
              color: Colors.GRAY,
            }}
          >
            {latestTrip.traveler?.title|| "1"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/trip-details",
            params: {
              trip: JSON.stringify(latestTrip),
              imageUrl,
            },
          })
        }
        style={{
          backgroundColor: Colors.PRIMARY,
          padding: height * 0.018,
          borderRadius: width * 0.04,
          marginTop: height * 0.015,
        }}
      >
        <Text
          style={{
            color: Colors.WHITE,
            textAlign: "center",
            fontFamily: "outfitMedium",
            fontSize: width * 0.04,
          }}
        >
          See your plan
        </Text>
      </TouchableOpacity>

      {/* 🗂 Other Trips */}
      {otherTrips.map((trip) => (
        <UserTripCard key={trip.id} trip={trip} onDelete={handleDelete} />
      ))}
    </View>
  );
}
