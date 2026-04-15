import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { Colors, useThemeColors } from "@/src/constants/colors";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import {
  RESTAURANT_AND_LOCAL_IMAGES,
  INDIA_FOOD_COLLECTION,
  INTL_FOOD_COLLECTION,
} from "@/src/constants";
import { LinearGradient } from "expo-linear-gradient";
import { Restaurant, LocalExperience, RestaurantsInfoProps } from "@/src/types";
import Button from "@/src/components/common/Button";

const { width } = Dimensions.get("window");

const getTransformCloudinaryUrl = (url: string, w: number, h: number, gravity = "center"): string => {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/c_fill,g_${gravity},w_${w},h_${h},f_auto,q_auto/`);
};

export default function RestaurantsInfo({ restaurantsInfo, cityName }: RestaurantsInfoProps) {
  const colors = useThemeColors();
  const { isDark } = useTheme();
  const globalCloudinaryFood = RESTAURANT_AND_LOCAL_IMAGES.Food;
  const isIndia = cityName?.toUpperCase().includes("IND");
  const foodCollection = isIndia ? INDIA_FOOD_COLLECTION : INTL_FOOD_COLLECTION;

  const openSearch = (name: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + (cityName || ""))}`;
    Linking.openURL(url);
  };

  const openGeneralRestaurantSearch = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Best Restaurants in " + cityName)}`;
    Linking.openURL(url);
  };

  if (!restaurantsInfo) return null;

  const { localExperiences = [], restaurants = [] } = restaurantsInfo;

  const getFoodImageSource = (idx: number) => {
    let sourceUrl = globalCloudinaryFood;
    if (idx < foodCollection.length) sourceUrl = foodCollection[idx];
    return { uri: getTransformCloudinaryUrl(sourceUrl, 400, 400, "auto") };
  };

  return (
    <View style={styles.wrapper}>
      {localExperiences.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.header}>
            <Text style={[styles.overline, { color: colors.MUTED_TEXT }]}>AUTHENTIC DISCOVERY</Text>
            <View style={styles.titleRow}>
              <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>Local Vibes</Text>
              <View style={[styles.goldDot, { backgroundColor: colors.GOLD }]} />
            </View>
          </View>

          <View style={styles.experienceList}>
            {localExperiences.map((item, idx) => (
              <View key={idx} style={[styles.experienceItem, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.expListName, { color: colors.TEXT }]}>{item.experienceName}</Text>
                  <Text style={[styles.expListDesc, { color: colors.MUTED_TEXT }]}>
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {localExperiences.length > 0 && restaurants.length > 0 && (
        <View style={styles.divider} />
      )}

      {restaurants.length > 0 && (
        <View style={[styles.sectionContainer, { marginTop: localExperiences.length > 0 ? 0 : 40 }]}>
          <View style={styles.header}>
            <Text style={[styles.overline, { color: colors.MUTED_TEXT }]}>EPICUREAN SPOTLIGHT</Text>
            <View style={styles.titleRow}>
              <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>Elite Dining</Text>
              <View style={[styles.goldDot, { backgroundColor: colors.GOLD }]} />
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.restaurantScroll}
            snapToInterval={width * 0.6 + 12}
            decelerationRate="fast"
            snapToAlignment="center"
          >
            {restaurants.map((item, idx) => {
              const imageSource = getFoodImageSource(idx);
              const dishes = item.recommendedDishes || [];

              return (
                <View
                  key={idx}
                  style={[styles.restaurantCard, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}
                >
                  <View style={styles.imageContainer}>
                    <Image source={imageSource} style={styles.restaurantImage} contentFit="cover" />
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.7)"]}
                      style={styles.imageOverlay}
                    />
                    <View style={styles.cardHeaderActions}>
                      <View style={[styles.priceBadge, { backgroundColor: isDark ? "#000" : "#ffffffff", borderColor: isDark ? "#333" : "#F1F5F9", borderWidth: 1 }]}>
                        <Text style={[styles.priceBadgeText, { color: colors.TEXT }]}>{item.priceRange}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.visitTextContainer, { backgroundColor: "rgba(0,0,0,0.6)", borderColor: "#444" }]}
                      onPress={() => openSearch(item.restaurantName)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.visitText}>VIEW ON MAPS</Text>
                      <Ionicons name="arrow-forward" size={12} color="#FFF" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.restaurantDetails}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.restaurantName, { color: colors.TEXT }]} numberOfLines={1}>{item.restaurantName}</Text>
                      <Ionicons name="star" size={14} color={Colors.SECONDARY} style={{ marginLeft: 6 }} />
                    </View>

                    <Text style={[styles.restaurantDesc, { color: colors.MUTED_TEXT }]}>{item.description}</Text>

                    {dishes.length > 0 && (
                      <View style={styles.dishesSection}>
                        <View style={styles.dishHeader}>
                          <Ionicons name="restaurant-outline" size={12} color={colors.GOLD} />
                          <Text style={[styles.dishLabel, { color: colors.GOLD }]}>MUST TRY</Text>
                        </View>
                        <View style={styles.chipsContainer}>
                          {dishes.map((dish, dIdx) => (
                            <View key={dIdx} style={[styles.dishChip, { backgroundColor: isDark ? "rgba(212,175,55,0.05)" : "rgba(235, 186, 73, 0.08)", borderColor: isDark ? "rgba(212,175,55,0.15)" : "rgba(235, 186, 73, 0.15)" }]}>
                              <Text style={[styles.dishChipText, { color: isDark ? "#D4AF37" : "#6D5E3D" }]}>{dish.toUpperCase()}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.ctaContainer}>
            <Button
              title="Explore More Authentic Dining"
              onPress={openGeneralRestaurantSearch}
              icon="compass-outline"
              style={{ marginHorizontal: 10 }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: 10, marginHorizontal: -width * 0.03 },
  divider: {
    height: 1,
    width: width * 0.923,
    marginLeft: width * 0.025,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginVertical: 15,
  },
  sectionContainer: {},
  header: { paddingHorizontal: width * 0.03, marginBottom: 16 },
  overline: { fontFamily: "interMedium", fontSize: 10, color: Colors.MUTED_TEXT, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 },
  titleRow: { flexDirection: "row", alignItems: "baseline", marginTop: 0 },
  sectionTitle: { fontSize: 28, fontFamily: "playfairBold", color: Colors.TEXT },
  goldDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.SECONDARY, marginLeft: 4, marginBottom: 6 },

  experienceList: { paddingHorizontal: width * 0.03 },
  experienceItem: {
    flexDirection: "row",
    padding: 20,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  expIconContainer: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(235, 186, 73, 0.1)",
    alignItems: "center", justifyContent: "center",
    marginRight: 16, marginTop: 2
  },
  expListName: { fontFamily: "playfairBold", fontSize: 18, color: Colors.TEXT, marginBottom: 6 },
  expListDesc: { fontFamily: "inter", fontSize: 13, color: Colors.GRAY, lineHeight: 20 },

  restaurantScroll: { paddingHorizontal: width * 0.03, gap: 15, paddingBottom: 20 },
  restaurantCard: {
    width: width * 0.7,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    borderWidth: 1,
  },
  imageContainer: { height: 180, position: "relative" },
  restaurantImage: { width: "100%", height: "100%" },
  imageOverlay: { ...StyleSheet.absoluteFillObject },
  cardHeaderActions: {
    position: "absolute",
    top: 15,
    left: 15,
    right: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  priceBadge: {
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    elevation: 4
  },
  priceBadgeText: { fontFamily: "outfitBold", fontSize: 11, color: Colors.PRIMARY },
  mapsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)"
  },
  visitTextContainer: {
    position: "absolute",
    bottom: 15,
    right: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)"
  },
  visitText: {
    color: Colors.WHITE,
    fontFamily: "interBold",
    fontSize: 10,
    letterSpacing: 1
  },
  restaurantDetails: { padding: 20 },
  nameRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  restaurantName: { flex: 1, fontFamily: "playfairBold", fontSize: 20 },
  restaurantDesc: { fontFamily: "inter", fontSize: 13, lineHeight: 20, marginBottom: 15 },

  dishesSection: { marginTop: 5 },
  dishHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  dishLabel: { fontFamily: "interBold", fontSize: 10, color: Colors.SECONDARY, letterSpacing: 1 },
  chipsContainer: { flexDirection: "column", gap: 8 },
  dishChip: {
    backgroundColor: "rgba(235, 186, 73, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(235, 186, 73, 0.15)",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start"
  },
  dishChipText: { fontFamily: "interBold", fontSize: 9, color: "#6D5E3D" },

  ctaContainer: { marginTop: 15, paddingHorizontal: 4 },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 18,
    borderRadius: 15,
    margin: 10,
    elevation: 5,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  searchButtonText: { color: Colors.WHITE, fontFamily: "interBold", fontSize: 15, textAlign: "center" },
});
