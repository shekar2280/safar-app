import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { RESTAURANT_AND_LOCAL_IMAGES } from "../../constants/Options";

export default function RestaurantsInfo({ restaurantsInfo, cityName }) {
  const localExperienceImage = RESTAURANT_AND_LOCAL_IMAGES.Experience;
  const localFoodImage = RESTAURANT_AND_LOCAL_IMAGES.Food;
  
  const openSearch = (name) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + (cityName || ""))}`;
    Linking.openURL(url);
  };

  if (!restaurantsInfo) return null;

  const { localExperiences = [], restaurants = [] } = restaurantsInfo;

  const SectionHeader = ({ title, icon, label, imageSource }) => (
    <View style={styles.sectionHeaderContainer}>
      <Image source={imageSource} style={styles.headerBg} contentFit="cover" />
      <View style={styles.headerOverlay}>
        <View style={styles.labelFloating}>
          <Text style={styles.floatingLabelText}>{label}</Text>
        </View>
        <View style={styles.headerTextRow}>
          <Text style={styles.headerTitleText}>{title}</Text>
          <Ionicons name={icon} size={22} color="white" />
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ marginBottom: 40 }}>
      {/* 🌟 Local Experiences */}
      <View style={styles.mainCard}>
        <SectionHeader
          title="Hidden Treasures"
          label="LOCAL EXPERIENCES"
          icon="sparkles"
          imageSource={localExperienceImage}
        />
        <View style={styles.listContainer}>
          {localExperiences.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.fullWidthCard}
              onPress={() => openSearch(item.experienceName)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.itemTitle}>{item.experienceName}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.PRIMARY}
                />
              </View>
              <Text style={styles.itemDesc}>{item.description}</Text>
              <View style={styles.footer}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.priceRange}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 🍴 Restaurants */}
      <View style={[styles.mainCard, { marginTop: 30 }]}>
        <SectionHeader
          title="Culinary Delights"
          label="FOOD & DINING"
          icon="restaurant"
          imageSource={localFoodImage}
        />
        <View style={styles.listContainer}>
          {restaurants.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.fullWidthCard}
              onPress={() => openSearch(item.restaurantName)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.itemTitle}>{item.restaurantName}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.PRIMARY}
                />
              </View>
              <Text style={styles.itemDesc}>{item.description}</Text>
              <View style={styles.footer}>
                <Text style={styles.priceHighlight}>
                  Avg. ₹{item.approximateCost}
                </Text>
                <View style={styles.rightInfo}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          item.priceRange === "Budget" ? "#4CAF50" : "#FF9800",
                      },
                    ]}
                  />
                  <Text style={styles.rangeText}>{item.priceRange}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginHorizontal: 5,
  },
  sectionHeaderContainer: { height: 160, width: "100%" },
  headerBg: { ...StyleSheet.absoluteFillObject },
  headerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
    padding: 15,
  },
  labelFloating: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  floatingLabelText: {
    color: "white",
    fontFamily: "outfitBold",
    fontSize: 10,
    letterSpacing: 1,
  },
  headerTextRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitleText: { color: "white", fontSize: 22, fontFamily: "outfitBold" },
  listContainer: {
    padding: 15,
  },
  fullWidthCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  itemTitle: {
    fontFamily: "outfitBold",
    fontSize: 17,
    color: "#1A1A1A",
    flex: 1,
  },
  itemDesc: {
    fontFamily: "outfit",
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rightInfo: { flexDirection: "row", alignItems: "center" },
  tag: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: { fontFamily: "outfitMedium", fontSize: 11, color: "#555" },
  priceHighlight: {
    fontFamily: "outfitBold",
    fontSize: 14,
    color: Colors.PRIMARY,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  rangeText: { fontFamily: "outfitMedium", fontSize: 12, color: "#666" },
});
