import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function PlannedTrip({ itineraryDetails }) {
  const filteredDays = Object.entries(itineraryDetails || {})
    .filter(([key]) => key.toLowerCase().startsWith("day"))
    .sort(([a], [b]) => {
      const numA = parseInt(a.replace("day", ""));
      const numB = parseInt(b.replace("day", ""));
      return numA - numB;
    });

  const openInMaps = (placeName) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`;
    Linking.openURL(url);
  };

  if (!filteredDays.length) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.outlineContainer}>
        <View style={styles.labelWrapper}>
          <Text style={styles.outlineLabel}>DAILY ITINERARY</Text>
        </View>

        <Text style={styles.sectionTitle}>Your Journey Plan</Text>

        {filteredDays.map(([dayKey, dayValue], dayIdx) => (
          <View key={dayKey} style={styles.daySection}>
            <View style={styles.dayHeader}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>
                  {dayKey.toUpperCase().replace("DAY", "DAY ")}
                </Text>
              </View>
              <View style={styles.horizontalLine} />
            </View>

            {dayValue.places?.map((place, idx) => (
              <View key={idx} style={styles.placeContainer}>
                <View style={styles.timelineLeft}>
                  <View style={styles.timelineDot}>
                    <View style={styles.dotInner} />
                  </View>
                  {idx !== dayValue.places.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>

                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.placeCard}
                  onPress={() => openInMaps(place.placeName)}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.textDetails}>
                      <Text style={styles.placeTitle}>{place.placeName}</Text>
                      <Text numberOfLines={3} style={styles.placeDesc}>
                        {place.placeDetails}
                      </Text>

                      <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color={Colors.GRAY}
                          />
                          <Text style={styles.metaText}>
                            {place.bestTimeToVisit}
                          </Text>
                        </View>
                        {place.ticketPricing > 0 && (
                          <View style={styles.metaItem}>
                            <Ionicons
                              name="ticket-outline"
                              size={14}
                              color={Colors.GRAY}
                            />
                            <Text style={styles.metaText}>
                              ₹{place.ticketPricing}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.navIconBox}>
                      <Ionicons
                        name="navigate-circle"
                        size={32}
                        color={Colors.PRIMARY}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
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
    borderColor: "#E0E0E0",
    borderRadius: 22,
    padding: 15,
    paddingTop: 25,
    backgroundColor: Colors.WHITE,
  },
  labelWrapper: {
    position: "absolute",
    top: -12,
    left: 20,
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 10,
  },
  outlineLabel: {
    fontFamily: "outfitBold",
    fontSize: 12,
    color: Colors.PRIMARY,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: "outfitBold",
    color: "#1A1A1A",
    marginBottom: 20,
  },
  daySection: {
    marginBottom: 20,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  dayBadge: {
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 10,
  },
  dayBadgeText: {
    color: "white",
    fontFamily: "outfitBold",
    fontSize: 12,
  },
  horizontalLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#EEE",
    marginLeft: 10,
  },
  placeContainer: {
    flexDirection: "row",
    minHeight: 100,
  },
  timelineLeft: {
    width: 30,
    alignItems: "center",
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  dotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.PRIMARY,
  },
  timelineLine: {
    position: "absolute",
    top: 16,
    bottom: 0,
    width: 2,
    backgroundColor: "#EEE",
    zIndex: 1,
  },
  placeCard: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
    padding: 12,
    marginBottom: 15,
    marginLeft: 5,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  textDetails: {
    flex: 1,
  },
  placeTitle: {
    fontFamily: "outfitBold",
    fontSize: 16,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  placeDesc: {
    fontFamily: "outfit",
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontFamily: "outfit",
    fontSize: 11,
    color: Colors.GRAY,
  },
  navIconBox: {
    marginLeft: 10,
    justifyContent: "center",
  },
});
