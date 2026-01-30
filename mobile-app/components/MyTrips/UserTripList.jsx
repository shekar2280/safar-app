import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Alert,
} from "react-native";
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
      const aTime = a.createdAt
        ? a.createdAt.seconds * 1000 + a.createdAt.nanoseconds / 1e6
        : 0;
      const bTime = b.createdAt
        ? b.createdAt.seconds * 1000 + b.createdAt.nanoseconds / 1e6
        : 0;
      return bTime - aTime;
    });
    setTrips(sorted);
  }, [userTrips]);

  const latestTrip = trips[0];
  const otherTrips = trips.slice(1);

  const randomFallback = useMemo(() => {
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  }, [latestTrip?.id]);

  const concertFallback = useMemo(() => {
    return concertImages[Math.floor(Math.random() * concertImages.length)];
  }, [latestTrip?.id]);

  if (!latestTrip) return null;

  const finalSource = latestTrip?.concertData
    ? latestTrip?.concertData?.artistImageUrl
      ? { uri: latestTrip.concertData.artistImageUrl }
      : concertFallback
    : latestTrip?.imageUrl
      ? { uri: latestTrip.imageUrl }
      : randomFallback;

  const tripStartDate =
    latestTrip.startDate ||
    latestTrip?.tripData?.startDate ||
    latestTrip?.concertData?.startDate;

  const handleDelete = (tripId) => {
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
  };

  const confirmDeleteLatest = () => {
    Alert.alert(
      "Delete Trip",
      "Are you sure you want to delete your latest trip?",
      [
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
                latestTrip.id,
              );
              await deleteDoc(tripRef);
              handleDelete(latestTrip.id);
            } catch (error) {
              console.error("Delete Error:", error);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={listStyles.container}>
      <View style={listStyles.featuredHeader}>
        <TouchableOpacity
          activeOpacity={0.9}
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
          style={listStyles.heroCard}
        >
          <Image
            source={finalSource}
            style={listStyles.heroImage}
            transition={600}
          />
          <View style={listStyles.heroOverlay}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <View style={listStyles.heroBadge}>
                <Text style={listStyles.heroBadgeText}>LATEST</Text>
              </View>

              <TouchableOpacity
                onPress={confirmDeleteLatest}
                style={listStyles.heroDeleteBtn}
              >
                <MaterialIcons
                  name="delete-outline"
                  size={24}
                  color="rgba(247, 13, 13, 0.73)"
                />
              </TouchableOpacity>
            </View>

            <Text style={listStyles.heroTitle} numberOfLines={1}>
              {latestTrip?.concertData?.artist
                ? `${latestTrip.concertData.artist} Concert`
                : latestTrip?.savedTripId
                    ?.split("-")[0]
                    .charAt(0)
                    .toUpperCase() +
                    latestTrip?.savedTripId?.split("-")[0].slice(1) ||
                  "My Trip"}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={listStyles.heroMeta}>
                {tripStartDate
                  ? moment(tripStartDate).format("DD MMM YYYY")
                  : "Date TBD"}
              </Text>
              <Text style={listStyles.heroMeta}>
                {latestTrip?.traveler?.title || "Traveler"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={listStyles.historyHeader}>
        <Text style={listStyles.sectionTitle}>Trip History</Text>
        <Text style={listStyles.tripCount}>{otherTrips.length} Saved</Text>
      </View>

      {otherTrips.map((trip) => (
        <UserTripCard key={trip.id} trip={trip} onDelete={handleDelete} />
      ))}
    </View>
  );
}

const listStyles = StyleSheet.create({
  container: { marginTop: 20 },
  sectionTitle: { fontSize: 22, fontFamily: "outfitBold", color: "#1A1A1A" },
  featuredHeader: { marginBottom: 15 },
  heroCard: {
    height: height * 0.28,
    borderRadius: 25,
    marginTop: 15,
    overflow: "hidden",
    backgroundColor: "#000",
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
    alignSelf: "flex-start",
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroDeleteBtn: {
    backgroundColor: "rgba(0, 0, 0, 0.63)",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    borderRadius: 30,
    width: 50,
    height: 50,
  },
  heroBadgeText: { color: "white", fontSize: 10, fontFamily: "outfitBold" },
  heroTitle: {
    color: "white",
    fontSize: 24,
    fontFamily: "outfitBold",
    marginTop: "auto",
  },
  heroMeta: {
    color: "white",
    fontFamily: "outfit",
    fontSize: 14,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  tripCount: { fontFamily: "outfit", color: Colors.GRAY, fontSize: 14 },
});
