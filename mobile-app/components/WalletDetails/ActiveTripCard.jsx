import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  StyleSheet,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { auth, db } from "../../config/FirebaseConfig";
import {
  doc,
  collection,
  getDocs,
  writeBatch,
  deleteField,
} from "firebase/firestore";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { useActiveTrip } from "../../context/ActiveTripContext";
import { fallbackImages } from "../../constants/Options";

const { width } = Dimensions.get("window");

export default function ActiveTripCard({ trip }) {
  const { setActiveTrip } = useActiveTrip();
  const router = useRouter();

  const randomFallback = useMemo(() => {
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  }, [trip?.id]);

  const tripImageSource = useMemo(() => {
    const img = trip?.imageUrl;
    if (Array.isArray(img) && img.length > 0) {
      return { uri: img[1] || img[0] };
    }
    if (typeof img === "string" && img.trim().length > 0) {
      return { uri: img };
    }
    return randomFallback;
  }, [trip?.imageUrl, randomFallback]);

  const tripName = trip?.concertData?.artist
    ? `${trip.concertData.artist} Concert`
    : trip?.tripPlan?.tripName ||
      trip?.tripPlan?.tripMetadata?.location ||
      (trip?.savedTripId
        ? trip.savedTripId.split("-")[0].charAt(0).toUpperCase() +
          trip.savedTripId.split("-")[0].slice(1)
        : "Active Trip");

  const goToPlanner = () => {
    setActiveTrip(trip);
    router.push({
      pathname: "/day-planner-details",
    });
  };

  const goToWallet = () => {
    router.push({
      pathname: "/wallet-details",
      params: { trip: JSON.stringify(trip), tripId: trip.id },
    });
  };

  const handleResetWallet = () => {
    Alert.alert("Deactivate Hub", "This session will be archived.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Deactivate",
        style: "destructive",
        onPress: async () => {
          try {
            const user = auth.currentUser;
            if (!user || !trip.id) return;
            const batch = writeBatch(db);
            const transRef = collection(
              db,
              "UserTrips",
              user.uid,
              "trips",
              trip.id,
              "transactions",
            );
            const snapshot = await getDocs(transRef);
            snapshot.forEach((tDoc) => batch.delete(tDoc.ref));
            const tripDocRef = doc(db, "UserTrips", user.uid, "trips", trip.id);
            batch.update(tripDocRef, {
              isActive: false,
              totalBudget: deleteField(),
              activatedAt: deleteField(),
            });
            await batch.commit();
          } catch (error) {
            Alert.alert("Error", "Action failed.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        activeOpacity={0.95}
        style={styles.card}
        onPress={goToPlanner}
      >
        <Image
          source={tripImageSource}
          style={styles.bannerImage}
          transition={500}
        />

        <View style={styles.topRow}>
          <BlurView intensity={75} tint="dark" style={styles.liveBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.liveText}>ON JOURNEY</Text>
          </BlurView>

          <TouchableOpacity onPress={handleResetWallet} style={styles.closeBtn}>
            <Ionicons name="close" size={18} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSection}>
          <BlurView intensity={80} tint="dark" style={styles.glassPanel}>
            <View style={styles.infoCol}>
              <Text style={styles.title} numberOfLines={1}>
                {tripName}
              </Text>
              <View style={styles.budgetRow}>
                <MaterialCommunityIcons
                  name="wallet-outline"
                  size={16}
                  color="rgba(255,255,255,0.6)"
                />
                <Text style={styles.budgetText}>
                  ₹{Number(trip.totalBudget || 0).toLocaleString("en-IN")}
                </Text>
              </View>
            </View>

            <View style={styles.actionGroup}>
              <TouchableOpacity
                onPress={goToPlanner}
                style={styles.actionIconBtn}
              >
                <Ionicons name="compass-outline" size={24} color="white" />
                <Text style={styles.actionLabel}>GUIDE</Text>
              </TouchableOpacity>

              <View style={styles.verticalDivider} />

              <TouchableOpacity
                onPress={goToWallet}
                style={styles.actionIconBtn}
              >
                <Ionicons name="wallet-outline" size={24} color="white" />
                <Text style={styles.actionLabel}>WALLET</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
    borderRadius: 30,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
     borderWidth: 0.3,
    borderColor: Colors.WHITE,
  },
  card: {
    height: 160,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#F0F0F0",
  },
  bannerImage: { ...StyleSheet.absoluteFillObject },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34C759",
    marginRight: 6,
  },
  liveText: {
    color: "white",
    fontFamily: "outfitBold",
    fontSize: 10,
    letterSpacing: 1.2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(214, 17, 17, 0.49)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 12,
  },
  glassPanel: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  infoCol: {
    flex: 1,
  },
  title: {
    color: "white",
    fontFamily: "outfitBold",
    fontSize: 20,
    letterSpacing: -0.5,
  },
  budgetRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },
  budgetText: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: "outfit",
    fontSize: 13,
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actionIconBtn: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
  },
  actionLabel: {
    color: "white",
    fontFamily: "outfitMedium",
    fontSize: 10,
    marginTop: 4,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});
