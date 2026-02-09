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
import {
  Ionicons,
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function PlannedTrip({
  itineraryDetails,
  cityName,
  onActivatePress,
  hideActivateBanner,
}) {
  const placesArray = Array.isArray(itineraryDetails)
    ? itineraryDetails
    : itineraryDetails?.places || [];

  const getTimeSlotColor = (timeSlot) => {
    const slot = timeSlot?.toLowerCase() || "";
    if (slot.includes("morning")) return "#f0c33b";
    if (slot.includes("afternoon")) return "#F97316";
    if (slot.includes("evening") || slot.includes("night")) return "#6366F1";
    return "#64748B";
  };

  const locationNavigation = (placeName) => {
    const query = encodeURIComponent(`${placeName} ${cityName || ""}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
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
      <View style={styles.outlineContainer}>
        <View style={styles.labelWrapper}>
          <Text style={styles.outlineLabel}>DISCOVERY POOL</Text>
        </View>

        <Text style={styles.sectionTitle}>Places to Explore</Text>

        {!hideActivateBanner && (
          <TouchableOpacity
            style={styles.activateTripBanner}
            onPress={onActivatePress}
            activeOpacity={0.8}
          >
            <View style={styles.activateIconBg}>
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={20}
                color="#FFFFFF"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.activateTitle}>Activate your trip</Text>
              <Text style={styles.activateSubtitle}>
                Unlock your personal guide and trip-based wallet.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.PRIMARY} />
          </TouchableOpacity>
        )}

        {placesArray.map((item, index) => (
          <View key={index} style={styles.placeCard}>
            <View style={styles.cardHeader}>
              <View style={styles.titleContainer}>
                <Text style={styles.placeTitle}>{item.placeName}</Text>
                <Text style={[styles.timeTag, { gap: 5 }]}>
                  Best Time:{" "}
                  <Text
                    style={[
                      styles.timeTag,
                      { color: getTimeSlotColor(item.timeSlot) },
                    ]}
                  >
                    {item.timeSlot}
                  </Text>
                </Text>
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
                <View style={styles.metaItemRow}>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="wallet-outline"
                      size={14}
                      color={Colors.PRIMARY}
                    />
                    <Text style={styles.metaText}>₹{item.ticketPricing}</Text>
                  </View>

                  <View style={styles.warningContainer}>
                    <MaterialIcons
                      name="info-outline"
                      size={12}
                      color="#f13232"
                    />
                    <Text style={styles.warningText}>
                      Prices are indicative
                    </Text>
                  </View>
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
    marginBottom: 15,
  },
  // ACTIVATE TRIP STYLES
  activateTripBanner: {
    backgroundColor: "#F0F7FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  activateIconBg: {
    backgroundColor: Colors.PRIMARY,
    padding: 8,
    borderRadius: 12,
  },
  activateTitle: {
    fontFamily: "outfitBold",
    fontSize: 14,
    color: "#1E40AF",
  },
  activateSubtitle: {
    fontFamily: "outfit",
    fontSize: 12,
    color: "#3B82F6",
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
    fontFamily: "outfitBold",
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
    flexDirection: "column",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
  },
  metaItemRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
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
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  warningText: {
    fontFamily: "outfit",
    fontSize: 10,
    color: "#f13232",
    fontStyle: "italic",
  },
  emptyText: {
    textAlign: "center",
    fontFamily: "outfit",
    color: "#94A3B8",
    marginTop: 20,
  },
});
