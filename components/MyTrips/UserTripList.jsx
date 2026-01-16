import { View, Text, TouchableOpacity, Dimensions, Alert } from "react-native";
import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { Colors } from "./../../constants/Colors";
import UserTripCard from "./UserTripCard";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../../config/FirebaseConfig";
import { concertImages, fallbackImages } from "../../constants/Options";
import { Image } from "expo-image";

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

  const randomFallback = useMemo(() => {
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  }, [latestTrip?.id]);

  const concertFallback = useMemo(() => {
    return concertImages[Math.floor(Math.random() * concertImages.length)];
  }, [latestTrip?.id]);

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

  const getFinalImageSource = () => {
    if (latestTrip?.concertData) {
      const concertImg =
        latestTrip?.concertData?.artistImageUrl ||
        latestTrip?.concertData?.locationInfo?.imageUrl ||
        latestTrip?.imageUrl;

      if (concertImg) {
        return { uri: concertImg };
      }
      return concertFallback;
    }
    if (latestTrip?.imageUrl) {
      return { uri: latestTrip.imageUrl };
    }
    return randomFallback;
  };

  const finalSource = getFinalImageSource();

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
            const user = auth.currentUser;
            const tripRef = doc(
              db,
              "UserTrips",
              user.uid,
              "trips",
              latestTrip.id
            );
            await deleteDoc(tripRef);
            handleDelete(latestTrip.id);
          } catch (error) {
            console.error("Delete Error:", error);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ marginTop: height * 0.025 }}>
      <Image
        source={finalSource}
        transition={500}
        style={{
          width: "100%",
          height: height * 0.25,
          borderRadius: width * 0.04,
        }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />

      <Text
        style={{
          fontFamily: "outfitBold",
          fontSize: width * 0.05,
          marginTop: height * 0.015,
        }}
        numberOfLines={1}
      >
        {latestTrip?.concertData?.artist
          ? `${latestTrip.concertData.artist} Concert`
          : latestTrip?.tripPlan?.tripName ||
            latestTrip?.savedTripId?.split("-")[0].charAt(0).toUpperCase() +
              latestTrip?.savedTripId?.split("-")[0].slice(1) ||
            "My Trip"}
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
              params: {
                trip: JSON.stringify(latestTrip),
                imageUrl:
                  typeof finalSource === "object"
                    ? finalSource.uri
                    : finalSource,
              },
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

        <TouchableOpacity onPress={confirmDelete}>
          <MaterialIcons name="delete" size={34} color="#FF6347" />
        </TouchableOpacity>
      </View>

      {otherTrips.map((trip) => (
        <UserTripCard key={trip.id} trip={trip} onDelete={handleDelete} />
      ))}
    </View>
  );
}