import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import React, { useMemo } from "react";
import moment from "moment";
import { Colors } from "../../constants/Colors";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";
import { concertImages, fallbackImages } from "../../constants/Options";
import { Image } from "expo-image";

const { width, height } = Dimensions.get("window");

export default function UserTripCard({ trip, onDelete }) {
  const router = useRouter();

  const tripData =
    trip?.tripData ||
    trip?.discoverData ||
    trip?.festiveData ||
    trip?.concertData ||
    trip?.trendingData ||
    {};

  const tripPlan = trip?.tripPlan;

  const randomFallback = useMemo(() => {
    const randomUrl = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    return randomUrl;
  }, [trip?.id]);

  const concertFallback = useMemo(() => {
    return concertImages[Math.floor(Math.random() * concertImages.length)];
  }, [trip?.id]);

  const getFinalImageSource = () => {
    if (trip?.concertData) {
      return concertFallback;
    }
    if (trip?.imageUrl) {
      return { uri: trip.imageUrl };
    }
    return randomFallback;
  };

  const finalSource = getFinalImageSource();

  const confirmDelete = () => {
    Alert.alert("Delete Trip", "Are you sure you want to delete this trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "UserTrips", trip.id));
            onDelete?.(trip.id);
          } catch (error) {
            console.error("Failed to delete trip:", error);
          }
        },
      },
    ]);
  };

  return (
    <View
      style={{
        marginTop: height * 0.025,
        flexDirection: "row",
        gap: width * 0.025,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
          gap: width * 0.025,
        }}
        onPress={() =>
          router.push({
            pathname: "/trip-details",
            params: {
              trip: JSON.stringify(trip),
              imageUrl: trip.imageUrl || "",
            },
          })
        }
      >
        <Image
          source={finalSource}
          transition={500}
          style={{
            width: width * 0.25,
            height: width * 0.25,
            borderRadius: width * 0.025,
          }}
        />

        <View style={{ flexShrink: 1 }}>
          <Text
            style={{
              fontFamily: "outfitBold",
              fontSize: width * 0.045,
            }}
            numberOfLines={1}
          >
            {trip?.concertData
              ? `${trip.concertData.artist} Concert`
              : tripPlan?.tripName}
          </Text>
          <Text
            style={{
              fontFamily: "outfitMedium",
              fontSize: width * 0.035,
              color: Colors.GRAY,
            }}
          >
            {moment(tripData.startDate).format("DD MMM YYYY")}
          </Text>
          <Text
            style={{
              fontFamily: "outfitMedium",
              fontSize: width * 0.035,
              color: Colors.GRAY,
            }}
          >
            Travelers: {trip?.traveler?.title || "1"}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={confirmDelete}>
        <MaterialIcons name="delete" size={width * 0.07} color="#FF6347" />
      </TouchableOpacity>
    </View>
  );
}