import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  StyleSheet,
} from "react-native";
import moment from "moment";
import { Colors } from "../../constants/Colors";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { auth, db } from "../../config/FirebaseConfig";
import {
  doc,
  collection,
  getDocs,
  writeBatch,
  deleteField,
} from "firebase/firestore";

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
      "This will wipe all spending entries, clear your budget, and deactivate this trip's wallet.",
      [
        { text: "Keep Everything", style: "cancel" },
        {
          text: "Reset Wallet",
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
              Alert.alert(
                "Reset Complete",
                "The wallet has been successfully cleared.",
              );
            } catch (error) {
              Alert.alert("Error", "Failed to reset wallet data.");
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.mainActionArea}
        onPress={navigateToWalletDetails}
        activeOpacity={0.7}
      >
        <Image source={tripImageSource} style={styles.tripImage} />

        <View style={styles.contentInfo}>
          <Text numberOfLines={1} style={styles.tripNameText}>
            {tripName}
          </Text>
          {trip.totalBudget ? (
            <View style={styles.budgetBadge}>
              <Text style={styles.budgetText}>Budget: ₹{trip.totalBudget}</Text>
            </View>
          ) : (
             <View style={styles.budgetBadge}>
              <Text style={styles.noBudgetText}>Budget Not Set</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.verticalDivider} />

      <View style={styles.sideActions}>
        <TouchableOpacity
          onPress={navigateToWalletDetails}
          style={[
            styles.iconButton,
            { backgroundColor: Colors.PRIMARY + "15" },
          ]}
        >
          <FontAwesome5 name="wallet" size={18} color={Colors.PRIMARY} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResetWallet}
          style={[styles.iconButton, { backgroundColor: "#FFF0F0" }]}
        >
          <MaterialIcons name="delete" size={22} color="#FF5252" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  mainActionArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  tripImage: {
    width: 85,
    height: 85,
    borderRadius: 16,
    backgroundColor: Colors.LIGHT_GRAY,
  },
  contentInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },
  tripNameText: {
    fontFamily: "outfitBold",
    fontSize: 17,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  budgetBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  budgetText: {
    fontFamily: "outfitMedium",
    fontSize: 11,
    color: "#2E7D32",
  },
  noBudgetText: {
    fontFamily: "outfitMedium",
    fontSize: 11,
    color: "#080808",
  },
  verticalDivider: {
    width: 1,
    height: "70%",
    backgroundColor: "#EEEEEE",
    marginHorizontal: 12,
  },
  sideActions: {
    gap: 6,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
