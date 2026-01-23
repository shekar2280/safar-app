import React from "react";
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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { auth, db } from "../../config/FirebaseConfig";
import {
  doc,
  collection,
  getDocs,
  writeBatch,
  deleteField,
} from "firebase/firestore";
import { Image } from "expo-image";

const { width } = Dimensions.get("window");

export default function ActiveTripCard({ trip }) {
  const router = useRouter();

  const tripImageSource = trip?.imageUrl
    ? { uri: trip.imageUrl }
    : require("../../assets/images/homepage.jpg");

  const tripName = trip?.concertData?.artist
    ? `${trip.concertData.artist} Concert`
    : trip?.tripPlan?.tripName ||
      trip?.tripPlan?.tripMetadata?.location ||
      (trip?.savedTripId
        ? trip.savedTripId.split("-")[0].charAt(0).toUpperCase() +
          trip.savedTripId.split("-")[0].slice(1)
        : "Active Trip");

  const navigateToWalletDetails = () => {
    router.push({
      pathname: "/wallet-details",
      params: { trip: JSON.stringify(trip), tripId: trip.id },
    });
  };

  const handleResetWallet = () => {
    Alert.alert(
      "Reset Wallet Data?",
      "This will wipe all spending and deactivate this wallet.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
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

              const tripDocRef = doc(
                db,
                "UserTrips",
                user.uid,
                "trips",
                trip.id,
              );
              batch.update(tripDocRef, {
                isActive: false,
                totalBudget: deleteField(),
                activatedAt: deleteField(),
              });

              await batch.commit();
              Alert.alert("Success", "Wallet cleared.");
            } catch (error) {
              Alert.alert("Error", "Failed to reset.");
            }
          },
        },
      ],
    );
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={navigateToWalletDetails}
      activeOpacity={0.9}
    >
      <Image
        source={tripImageSource}
        style={styles.bannerImage}
        transition={400}
      />
      <View style={styles.overlay} />

      <View style={styles.content}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {tripName}
          </Text>

          <Text style={styles.budgetText}>
            {trip.totalBudget
              ? `Budget: ₹${Number(trip.totalBudget).toLocaleString("en-IN")}`
              : "Budget: ₹0"}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.chevronBtn}>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </View>
          <TouchableOpacity onPress={handleResetWallet} style={styles.resetBtn}>
            <MaterialIcons name="clear" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 120,
    borderRadius: 20,
    marginBottom: 10,
    overflow: "hidden",
    backgroundColor: "#000",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  bannerImage: { ...StyleSheet.absoluteFillObject },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    color: "white",
    fontFamily: "outfitBold",
    fontSize: 20,
  },
  budgetText: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: "outfit",
    fontSize: 13,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  resetBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(208, 22, 22, 0.56)",
    justifyContent: "center",
    alignItems: "center",
  },
  chevronBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },
});
