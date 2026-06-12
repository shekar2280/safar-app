import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Dimensions,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { Colors, useThemeColors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { HotelOption, HotelInfoProps } from "@/src/constants";
import Button from "@/src/components/common/Button";
import { LOCAL_HOTEL_IMAGES } from "@/src/constants";

const { width } = Dimensions.get("window");

export default function HotelInfo({ hotelData = [], cityName, isLoading }: HotelInfoProps) {
  const colors = useThemeColors();
  const { isDark } = useTheme();
  const openHotelInMaps = (hotelName: string) => {
    const query = encodeURIComponent(`${hotelName} ${cityName}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url);
  };

  const openGeneralSearch = () => {
    const query = encodeURIComponent(`Best Hotels in ${cityName}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={[styles.overline, { color: colors.MUTED_TEXT }]}>STAY CURATION</Text>
        <View style={styles.titleRow}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>Elite Stays</Text>
          <View style={[styles.goldDot, { backgroundColor: colors.GOLD }]} />
        </View>
      </View>

      {hotelData.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hotelScroll}
          snapToInterval={width * 0.7 + 20}
          decelerationRate="fast"
          snapToAlignment="center"
        >
          {hotelData.map((hotel, index) => {
            const imageSource = { uri: LOCAL_HOTEL_IMAGES[index % LOCAL_HOTEL_IMAGES.length] };

            return (
              <MotiView
                key={index}
                from={{ opacity: 0, translateX: 20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: index * 100, type: "timing" }}
                style={[styles.hotelCard, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}
              >
                <TouchableOpacity
                  onPress={() => openHotelInMaps(hotel.hotelName)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={imageSource}
                    style={[styles.hotelImage, { backgroundColor: colors.SURFACE_LIGHT }]}
                    contentFit="cover"
                    transition={300}
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.8)"]}
                    style={styles.imageOverlay}
                  />
                  <View style={[styles.priceBadge, { backgroundColor: isDark ? "rgba(0,0,0,0.8)" : colors.WHITE }]}>
                    <Text style={[styles.priceText, { color: isDark ? colors.WHITE : colors.PRIMARY }]}>₹{hotel.pricePerNight}</Text>
                    <Text style={[styles.perNight, { color: colors.MUTED_TEXT }]}>/NIGHT</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.hotelDetails}>
                  <View style={styles.hotelMeta}>
                    <Text style={[styles.hotelName, { color: colors.TEXT }]} numberOfLines={1}>{hotel.hotelName}</Text>
                    <View style={[styles.ratingRow, { backgroundColor: isDark ? "rgba(212,175,55,0.1)" : "rgba(235, 186, 73, 0.1)" }]}>
                      <Ionicons name="star" size={14} color={colors.GOLD} />
                      <Text style={[styles.ratingText, { color: colors.GOLD }]}>{hotel.rating}</Text>
                    </View>
                  </View>

                  <Text style={[styles.hotelDesc, { color: colors.MUTED_TEXT }]}>{hotel.description}</Text>

                  {hotel.suitabilityReason && (
                    <View style={[styles.suitabilityCard, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#FDF9F0", borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(235, 186, 73, 0.15)" }]}>
                      <Ionicons name="sparkles" size={12} color={colors.GOLD} />
                      <Text style={[styles.suitabilityText, { color: colors.MUTED_TEXT }]}>{hotel.suitabilityReason}</Text>
                    </View>
                  )}
                </View>
              </MotiView>
            );
          })}
        </ScrollView>
      ) : isLoading ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.MUTED_TEXT }]}>Exploring best options for your {cityName} journey...</Text>
        </View>
      ) : (
        <View style={[styles.emptyCard, { backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "#FDF9F0", borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(235, 186, 73, 0.15)" }]}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="sparkles" size={20} color={colors.GOLD} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.TEXT }]}>Excursion Destination</Text>
          <Text style={[styles.emptyDesc, { color: colors.MUTED_TEXT }]}>
            No Elite Stays needed. This location is best experienced as a day trip or excursion from a larger nearby city.
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          title="Explore More Stays"
          onPress={openGeneralSearch}
          icon="arrow-forward"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: 10 },
  header: { paddingHorizontal: 0, marginBottom: 16 },
  overline: {
    fontFamily: "interMedium",
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  titleRow: { flexDirection: "row", alignItems: "baseline", marginTop: 0 },
  sectionTitle: { fontSize: 28, fontFamily: "playfairBold" },
  goldDot: {
    width: 6, height: 6, borderRadius: 3,
    marginLeft: 4, marginBottom: 6,
  },
  hotelScroll: { paddingHorizontal: 0, gap: 15, paddingBottom: 15 },
  hotelCard: {
    width: width * 0.7,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  hotelImage: { width: "100%", height: 180 },
  imageOverlay: { ...StyleSheet.absoluteFillObject, height: 180 },
  priceBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  priceText: { fontFamily: "interBold", fontSize: 14 },
  perNight: { fontFamily: "inter", fontSize: 8 },
  hotelDetails: { padding: 16 },
  hotelMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  hotelName: { flex: 1, fontFamily: "playfairBold", fontSize: 18, marginRight: 10 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontFamily: "interBold", fontSize: 12 },
  hotelDesc: { fontFamily: "outfit", fontSize: 12, lineHeight: 18, marginTop: 4 },
  suitabilityCard: {
    marginTop: 15,
    padding: 12,
    borderRadius: 14,
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
  },
  suitabilityText: {
    flex: 1,
    fontFamily: "outfit",
    fontSize: 11,
    lineHeight: 16,
  },
  emptyState: { padding: 40, alignItems: "center" },
  emptyText: { fontFamily: "inter", fontSize: 14, textAlign: "center" },
  emptyCard: {
    marginHorizontal: 4,
    marginVertical: 8,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(212,175,55,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: "playfairBold",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 6,
  },
  emptyDesc: {
    fontFamily: "outfit",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  footer: { marginTop: 10, paddingHorizontal: 4 },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 15,
    gap: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    margin: 10,
  },
  searchButtonText: {
    fontFamily: "interBold",
    fontSize: 15,
    textAlign: "center",
  },
});
