import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function PlannedTrip({ itineraryDetails, cityName }) {
  const router = useRouter();

  const placesArray = Array.isArray(itineraryDetails)
    ? itineraryDetails
    : itineraryDetails?.places || [];

  const locationNavigation = (placeName) => {
    const query = encodeURIComponent(`${placeName} ${cityName || ""}`);
    const url = `https://www.google.com/maps/dir/?api=1&destination=$8{query}`;
    Linking.openURL(url);
  };

  if (!placesArray.length) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.emptyText}>No discovery data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* <TouchableOpacity
        style={styles.plannerLinkBtn}
        onPress={() => router.push("/day-planner-details")}
      >
        <Ionicons name="calendar" size={20} color="white" />
        <Text style={styles.plannerLinkText}>View My Day Planner</Text>
        <Ionicons name="arrow-forward" size={18} color="white" />
      </TouchableOpacity> */}

      <View style={styles.outlineContainer}>
        <View style={styles.labelWrapper}>
          <Text style={styles.outlineLabel}>DISCOVERY POOL</Text>
        </View>

        <Text style={styles.sectionTitle}>Places to Explore</Text>

        {placesArray.map((item, index) => (
          <View key={index} style={styles.placeCard}>
            <View style={styles.cardHeader}>
              <View style={styles.titleContainer}>
                <Text style={styles.placeTitle}>{item.placeName}</Text>
                <Text style={styles.timeTag}>{item.timeSlot}</Text>
              </View>

              <TouchableOpacity
                style={styles.navIconBtn}
                onPress={() => locationNavigation(item.placeName)}
              >
                <FontAwesome5 name="directions" size={18} color="white" />
              </TouchableOpacity>
            </View>

            <Text style={styles.placeDesc} numberOfLines={4}>
              {item.placeDetails}
            </Text>

            <View style={styles.footerRow}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={Colors.PRIMARY}
                />
                <Text style={styles.metaText}>{item.bestTimeToVisit}</Text>
              </View>
              {item.ticketPricing > 0 && (
                <View style={styles.metaItem}>
                  <Ionicons
                    name="wallet-outline"
                    size={14}
                    color={Colors.PRIMARY}
                  />
                  <Text style={styles.metaText}>₹{item.ticketPricing}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 25, marginBottom: 25 },
  plannerLinkBtn: {
    backgroundColor: Colors.PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 18,
    marginBottom: 25,
    gap: 12,
    elevation: 4,
    shadowColor: Colors.PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  plannerLinkText: {
    color: "white",
    fontFamily: "outfitBold",
    fontSize: 16,
  },
  outlineContainer: {
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 24,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  labelWrapper: {
    position: "absolute",
    top: -12,
    left: 20,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
  },
  outlineLabel: {
    fontFamily: "outfitBold",
    fontSize: 11,
    color: Colors.PRIMARY,
    letterSpacing: 1.5,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: "outfitBold",
    color: "#0F172A",
    marginBottom: 20,
  },
  placeCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  titleContainer: { flex: 1, marginRight: 10 },
  placeTitle: {
    fontFamily: "outfitBold",
    fontSize: 18,
    color: "#1E293B",
  },
  timeTag: {
    fontFamily: "outfitMedium",
    fontSize: 10,
    color: "#64748B",
    textTransform: "uppercase",
    marginTop: 2,
  },
  navIconBtn: {
    backgroundColor: Colors.PRIMARY,
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  placeDesc: {
    fontFamily: "outfit",
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 15,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontFamily: "outfit",
    fontSize: 12,
    color: "#64748B",
  },
  emptyText: {
    textAlign: "center",
    fontFamily: "outfit",
    color: "#94A3B8",
    marginTop: 20,
  },
});
