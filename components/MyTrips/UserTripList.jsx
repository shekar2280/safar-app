import { View, Text, Image, TouchableOpacity, Dimensions, Alert } from "react-native";
import { useEffect, useState } from "react";
import moment from "moment";
import { Colors } from "./../../constants/Colors";
import UserTripCard from "./UserTripCard";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";

const { width, height } = Dimensions.get("window");

export default function UserTripList({ userTrips }) {
  const [trips, setTrips] = useState([]);
  const router = useRouter();

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

  const confirmDelete = () => {
    Alert.alert("Delete Trip", "Are you sure you want to delete this trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "UserTrips", latestTrip.id));
          } catch (error) {
            console.error("Failed to delete trip:", error);
          }
        },
      },
    ]);
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
            {latestTrip.traveler?.title || "1"}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: height * 0.02,
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/trip-details",
              params: { trip: JSON.stringify(latestTrip), imageUrl },
            })
          }
          style={{
            flex: 1,
            backgroundColor: Colors.PRIMARY,
            height: 56,
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            elevation: 3,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          <Text
            style={{
              color: Colors.WHITE,
              fontFamily: "outfitBold",
              fontSize: 16,
            }}
          >
            See your plan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={confirmDelete}
        >
          <MaterialIcons name="delete" size={34} color="#FF6347" />
        </TouchableOpacity>
      </View>

      {/* 🗂 Other Trips */}
      {otherTrips.map((trip) => (
        <UserTripCard key={trip.id} trip={trip} onDelete={handleDelete} />
      ))}
    </View>
  );
}
