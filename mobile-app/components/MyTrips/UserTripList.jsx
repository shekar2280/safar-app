import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Alert,
} from "react-native";
import React, { useMemo } from "react";
import moment from "moment";
import { Colors } from "./../../constants/Colors";
import UserTripCard from "./UserTripCard";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../../config/FirebaseConfig";
import { concertImages, fallbackImages } from "../../constants/Options";
import { Image } from "expo-image";

const { width, height } = Dimensions.get("window");

export default function UserTripList({ userTrips, onDelete }) {
  const router = useRouter();
  const trips = userTrips || [];
  const latestTrip = trips[0];
  const otherTrips = trips.slice(1);

  const randomFallback = useMemo(
    () => fallbackImages[Math.floor(Math.random() * fallbackImages.length)],
    [latestTrip?.id],
  );
  const concertFallback = useMemo(
    () => concertImages[Math.floor(Math.random() * concertImages.length)],
    [latestTrip?.id],
  );

  const finalSource = useMemo(() => {
    if (!latestTrip) return randomFallback;

    if (latestTrip.concertData?.artistImageUrl) {
      return { uri: latestTrip.concertData.artistImageUrl };
    }

    const img = latestTrip.imageUrl;
    if (Array.isArray(img) && img.length > 0) {
      return { uri: img[0] };
    }
    if (typeof img === "string" && img.trim().length > 0) {
      return { uri: img };
    }

    return latestTrip.concertData ? concertFallback : randomFallback;
  }, [latestTrip, randomFallback, concertFallback]);

  if (!latestTrip) return null;

  const tripStartDate =
    latestTrip.startDate ||
    latestTrip?.tripData?.startDate ||
    latestTrip?.concertData?.startDate;

  const confirmDeleteLatest = () => {
    Alert.alert("Delete Trip", "Remove your latest trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(
              doc(
                db,
                "UserTrips",
                auth.currentUser.uid,
                "trips",
                latestTrip.id,
              ),
            );
            onDelete(latestTrip.id);
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.heroCard}
        onPress={() =>
          router.push({
            pathname: "/trip-details",
            params: {
              trip: JSON.stringify(latestTrip),
              imageUrl: finalSource?.uri || finalSource,
            },
          })
        }
      >
        <Image
          source={finalSource}
          style={styles.heroImage}
          transition={500}
          contentFit="cover"
          placeholder={randomFallback}
        />
        <View style={styles.heroOverlay}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>LATEST</Text>
            </View>
            <TouchableOpacity
              onPress={confirmDeleteLatest}
              style={styles.heroDeleteBtn}
            >
              <MaterialIcons name="delete-outline" size={24} color="#FF4444" />
            </TouchableOpacity>
          </View>
          <Text style={styles.heroTitle} numberOfLines={1}>
            {latestTrip?.tripPlan?.tripName ||
              latestTrip?.concertData?.artist ||
              "My Trip"}
          </Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.heroMeta}>
              {tripStartDate
                ? moment(tripStartDate).format("DD MMM YYYY")
                : "Date TBD"}
            </Text>
            <Text style={styles.heroMeta}>
              {latestTrip?.traveler?.title || "Traveler"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Trip History</Text>
      {otherTrips.map((trip) => (
        <UserTripCard key={trip.id} trip={trip} onDelete={onDelete} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  heroCard: {
    height: height * 0.28,
    borderRadius: 25,
    marginTop: 15,
    overflow: "hidden",
    backgroundColor: "#333",
    elevation: 8,
  },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "space-between",
    padding: 20,
  },
  heroBadge: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  heroDeleteBtn: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 25,
  },
  heroBadgeText: { color: "white", fontSize: 12, fontFamily: "outfitBold" },
  heroTitle: {
    color: "white",
    fontSize: 24,
    fontFamily: "outfitBold",
    marginTop: "auto",
  },
  heroMeta: { color: "white", fontFamily: "outfit", fontSize: 14 },
  sectionTitle: {
    fontSize: 22,
    fontFamily: "outfitBold",
    marginTop: 25,
    color: "#1A1A1A",
  },
});
