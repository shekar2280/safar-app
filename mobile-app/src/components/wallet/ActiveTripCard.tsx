import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/src/constants/colors";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import SafarAlert from "@/src/components/ui/SafarAlert";
import { useActiveTrip } from "@/src/context/ActiveTripContext";
import { useUser } from "@/src/context/UserContext";
import { apiPatch } from "@/src/lib/api";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { fallbackImages } from "@/src/constants/travel-data";
import { ActiveTripCardProps } from "@/src/types/interfaces";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/src/lib/firebase";

export default function ActiveTripCard({ trip }: ActiveTripCardProps) {
  const { setActiveTrip } = useActiveTrip();
  const { refreshTrips } = useUser();
  const router = useRouter();
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveVisible, setArchiveVisible] = useState(false);

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
    (trip?.savedTripId
      ? trip.savedTripId.split("-")[0].charAt(0).toUpperCase() +
      trip.savedTripId.split("-")[0].slice(1)
      : "Active Trip");

  const goToPlanner = () => {
    setActiveTrip(trip as any);
    router.push("/day-planner-details" as any);
  };

  const goToWallet = () => {
    router.push({
      pathname: "/wallet-details",
      params: { trip: JSON.stringify(trip), tripId: trip.id },
    } as any);
  };

  const handleResetWallet = () => {
    setArchiveVisible(true);
  };

  const handleArchiveConfirmed = async () => {
    try {
      if (!trip.id) return;
      setArchiveVisible(false);
      setIsArchiving(true);

      const user = auth.currentUser;
      if (!user) throw new Error("User not found");

      const transactionsRef = collection(db, "UserTrips", user.uid, "trips", trip.id, "transactions");
      const q = query(transactionsRef, where("tripId", "==", trip.id));
      const snapshot = await getDocs(q);

      const spendingsToArchive = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.date?.toDate()?.getTime() || Date.now(),
          date: data.date?.toDate()?.toLocaleString() || new Date().toLocaleString(),
          isArchived: true
        };
      });

      if (spendingsToArchive.length > 0) {
        await apiPatch(`/api/trips/${trip.id}/archive-spendings`, { spendings: spendingsToArchive });
      }

      await apiPatch(`/api/trips/${trip.id}/deactivate`, {});

      if (spendingsToArchive.length > 0) {
        const batchDeletes = snapshot.docs.map(d => deleteDoc(doc(db, "UserTrips", user.uid, "trips", trip.id, "transactions", d.id)));
        await Promise.all(batchDeletes);
      }

      await refreshTrips();
      setIsArchiving(false);
    } catch (error) {
      console.error(error);
      setIsArchiving(false);
      Alert.alert("Error", "Failed to archive history.");
    }
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity activeOpacity={0.95} style={styles.card} onPress={goToPlanner} disabled={isArchiving}>
        <Image source={tripImageSource} style={styles.bannerImage} transition={500} />

        <View style={styles.topRow}>
          <BlurView intensity={75} tint="dark" style={styles.liveBadge}>
            <View style={[styles.statusDot, trip.isFinished && { backgroundColor: "#94A3B8" }]} />
            <Text style={styles.liveText}>
              {isArchiving ? "ARCHIVING..." : trip.isFinished ? "COMPLETED" : "ON JOURNEY"}
            </Text>
          </BlurView>

          {!trip.isFinished && !isArchiving && (
            <TouchableOpacity onPress={handleResetWallet} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color="white" />
            </TouchableOpacity>
          )}

          {isArchiving && <ActivityIndicator size="small" color="#FFF" />}
        </View>

        <View style={styles.bottomSection}>
          <BlurView intensity={80} tint="dark" style={styles.glassPanel}>
            <View style={styles.infoCol}>
              <Text style={styles.title} numberOfLines={1}>
                {tripName}
              </Text>
              <View style={styles.budgetRow}>
                <MaterialCommunityIcons name="wallet-outline" size={16} color="rgba(255,255,255,0.6)" />
                <Text style={styles.budgetText}>
                  ₹{Number(trip.totalBudget || 0).toLocaleString("en-IN")}
                </Text>
              </View>
            </View>

            <View style={styles.actionGroup}>
              <TouchableOpacity onPress={goToPlanner} style={styles.actionIconBtn} disabled={isArchiving}>
                <Ionicons name="compass-outline" size={24} color="white" />
                <Text style={styles.actionLabel}>GUIDE</Text>
              </TouchableOpacity>

              <View style={styles.verticalDivider} />

              <TouchableOpacity onPress={goToWallet} style={styles.actionIconBtn} disabled={isArchiving}>
                <Ionicons name="wallet-outline" size={24} color="white" />
                <Text style={styles.actionLabel}>WALLET</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </TouchableOpacity>

      <SafarAlert
        visible={archiveVisible}
        title="Finalize Journey"
        message="Completing this journey will archive your spending records and finalize your current itinerary. This action is permanent."
        type="confirm"
        confirmText="Archive"
        cancelText="Keep Going"
        onConfirm={handleArchiveConfirmed}
        onCancel={() => setArchiveVisible(false)}
      />
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
  card: { height: 160, borderRadius: 30, overflow: "hidden", backgroundColor: "#F0F0F0" },
  bannerImage: { ...StyleSheet.absoluteFillObject },
  topRow: { flexDirection: "row", justifyContent: "space-between", padding: 16, alignItems: 'center' },
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
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#34C759", marginRight: 6 },
  liveText: { color: "white", fontFamily: "outfitBold", fontSize: 10, letterSpacing: 1.2 },
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
  bottomSection: { position: "absolute", bottom: 0, width: "100%", padding: 12 },
  glassPanel: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  infoCol: { flex: 1 },
  title: { color: "white", fontFamily: "outfitBold", fontSize: 20, letterSpacing: -0.5 },
  budgetRow: { flexDirection: "row", alignItems: "center", marginTop: 2, gap: 4 },
  budgetText: { color: "rgba(255,255,255,0.7)", fontFamily: "outfit", fontSize: 13 },
  actionGroup: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionIconBtn: { alignItems: "center", justifyContent: "center", minWidth: 50 },
  actionLabel: { color: "white", fontFamily: "outfitMedium", fontSize: 10, marginTop: 4 },
  verticalDivider: { width: 1, height: 24, backgroundColor: "rgba(255,255,255,0.2)" },
});
