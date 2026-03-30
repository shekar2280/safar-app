import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Colors } from "@/src/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { RESTAURANT_AND_LOCAL_IMAGES } from "@/src/constants/travel-data";
import { LinearGradient } from "expo-linear-gradient";
import { Restaurant, LocalExperience } from "@/src/types/interfaces";

const { width } = Dimensions.get("window");

const INDIA_FOOD_COLLECTION: string[] = [
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726134/thali_mr4ier.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726144/roti_mtjvsm.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726140/biryani_qio38y.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726134/pav_qxp2ln.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726133/dosa_k6vajd.jpg",
];

const INTL_FOOD_COLLECTION: string[] = [
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726983/ramen_gjr5ip.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726982/tacos_tz41vf.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726979/hamburger_wqp27v.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726978/pizza_trzxxq.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726976/croissant_ivn0w4.jpg",
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774726134/thali_mr4ier.jpg",
];

const getTransformCloudinaryUrl = (url: string, w: number, h: number, gravity = "center"): string => {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/c_fill,g_${gravity},w_${w},h_${h},f_auto,q_auto/`);
};

interface RestaurantsInfoProps {
  restaurantsInfo?: {
    restaurants?: Restaurant[];
    localExperiences?: LocalExperience[];
  } | null;
  cityName: string;
}

export default function RestaurantsInfo({ restaurantsInfo, cityName }: RestaurantsInfoProps) {
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
      <View style={styles.sectionContainer}>
        <View style={styles.header}>
          <Text style={styles.overline}>AUTHENTIC DISCOVERY</Text>
          <View style={styles.titleRow}>
            <Text style={styles.sectionTitle}>Curated Vibes</Text>
            <View style={styles.goldDot} />
          </View>
        </View>

        <View style={styles.experienceList}>
          {localExperiences.map((item, idx) => (
            <View key={idx} style={styles.experienceItem}>
              <View style={styles.expBullet} />
              <View style={{ flex: 1 }}>
                <Text style={styles.expListName}>{item.experienceName}</Text>
                <Text style={styles.expListPrice}>{item.priceRange} • Local Perspective</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.sectionContainer, { marginTop: 40 }]}>
        <View style={styles.header}>
          <Text style={styles.overline}>EPICUREAN SPOTLIGHT</Text>
          <View style={styles.titleRow}>
            <Text style={styles.sectionTitle}>Elite Dining</Text>
            <View style={styles.goldDot} />
          </View>
        </View>

        <View style={styles.waterfallList}>
          {restaurants.map((item, idx) => {
            const isLeftImage = idx % 2 === 0;
            const imageSource = getFoodImageSource(idx);
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.splitCard, !isLeftImage && { flexDirection: "row-reverse" }]}
                onPress={() => openSearch(item.restaurantName)}
                activeOpacity={0.9}
              >
                <Image source={imageSource} style={styles.splitImage} contentFit="cover" />
                <View style={styles.splitDetails}>
                  <View style={[styles.expertBadge, { alignSelf: "flex-start", marginBottom: 8 }]}>
                    <Text style={styles.expertBadgeText}>TOP PICK</Text>
                  </View>
                  <Text style={styles.splitName}>{item.restaurantName}</Text>
                  <Text style={styles.splitDesc}>{item.description}</Text>
                  <View style={styles.splitFooter}>
                    <Text style={styles.splitPrice}>{item.priceRange}</Text>
                    <View style={styles.priceCircle} />
                    <Text style={styles.splitPrice}>₹{item.approximateCost}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.ctaContainer}>
          <Text style={styles.ctaSubtitle}>
            Discover even more flavors. Search all top-rated restaurants in {cityName}.
          </Text>
          <TouchableOpacity activeOpacity={0.9} style={styles.searchButton} onPress={openGeneralRestaurantSearch}>
            <LinearGradient
              colors={[Colors.PRIMARY, "#2C2C2C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              <Ionicons name="restaurant-outline" size={20} color={Colors.WHITE} style={{ marginRight: 10 }} />
              <Text style={styles.searchButtonText}>Explore More Dining in {cityName}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 0, marginBottom: 0 },
  sectionContainer: {},
  header: { paddingHorizontal: 4, marginBottom: 20 },
  overline: { fontFamily: "outfitMedium", fontSize: 10, color: Colors.MUTED_TEXT, letterSpacing: 3, textTransform: "uppercase", marginBottom: 2 },
  titleRow: { flexDirection: "row", alignItems: "baseline", marginTop: -4 },
  sectionTitle: { fontSize: 28, fontFamily: "playfairBold", color: Colors.TEXT },
  goldDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.SECONDARY, marginLeft: 4, marginBottom: 6 },
  experienceList: { paddingHorizontal: 4, marginBottom: 10 },
  experienceItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)" },
  expBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.SECONDARY, marginRight: 16 },
  expListName: { fontFamily: "playfairBold", fontSize: 18, color: Colors.TEXT, marginBottom: 2 },
  expListPrice: { fontFamily: "outfit", fontSize: 13, color: Colors.MUTED_TEXT },
  waterfallList: { paddingHorizontal: 4 },
  splitCard: { flexDirection: "row", backgroundColor: Colors.SURFACE, borderRadius: 24, minHeight: 180, marginBottom: 20, overflow: "hidden", elevation: 4, shadowOpacity: 0.05, borderWidth: 1, borderColor: "rgba(0,0,0,0.03)" },
  splitImage: { width: "40%", height: "100%" },
  splitDetails: { flex: 1, padding: 16, justifyContent: "center" },
  splitName: { fontFamily: "playfairBold", fontSize: 18, color: Colors.TEXT, marginBottom: 6 },
  splitDesc: { fontFamily: "outfit", fontSize: 12, color: "#6B7280", lineHeight: 18, marginBottom: 12 },
  splitFooter: { flexDirection: "row", alignItems: "center", gap: 8 },
  splitPrice: { fontFamily: "outfitBold", fontSize: 12, color: Colors.MUTED_TEXT },
  priceCircle: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.MUTED_TEXT, opacity: 0.3 },
  expertBadge: { backgroundColor: Colors.SECONDARY, flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 4 },
  expertBadgeText: { fontFamily: "outfitBold", fontSize: 10, color: Colors.BLACK, letterSpacing: 0.5 },
  ctaContainer: { marginTop: 10, paddingHorizontal: 4, alignItems: "center" },
  ctaSubtitle: { fontFamily: "outfit", fontSize: 14, color: Colors.MUTED_TEXT, textAlign: "center", marginBottom: 20, lineHeight: 20, paddingHorizontal: 20 },
  searchButton: { width: "100%", borderRadius: 20, overflow: "hidden", elevation: 6, shadowColor: Colors.PRIMARY, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12 },
  gradientBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 18 },
  searchButtonText: { color: Colors.WHITE, fontFamily: "outfitBold", fontSize: 16 },
});
