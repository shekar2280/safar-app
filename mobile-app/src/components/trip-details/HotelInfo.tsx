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
import { Colors } from "@/src/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { HotelOption } from "@/src/types/interfaces";
import { LOCAL_HOTEL_IMAGES } from "@/src/constants/travel-data";

const { width } = Dimensions.get("window");

interface HotelInfoProps {
  hotelData?: HotelOption[];
  cityName: string;
}

export default function HotelInfo({ hotelData = [], cityName }: HotelInfoProps) {
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
        <Text style={styles.overline}>STAY CURATION</Text>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Elite Stays</Text>
          <View style={styles.goldDot} />
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
                style={styles.hotelCard}
              >
                <TouchableOpacity
                  onPress={() => openHotelInMaps(hotel.hotelName)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={imageSource}
                    style={styles.hotelImage}
                    contentFit="cover"
                    transition={500}
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.8)"]}
                    style={styles.imageOverlay}
                  />
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceText}>₹{hotel.pricePerNight}</Text>
                    <Text style={styles.perNight}>/NIGHT</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.hotelDetails}>
                  <View style={styles.hotelMeta}>
                    <Text style={styles.hotelName} numberOfLines={1}>{hotel.hotelName}</Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color={Colors.SECONDARY} />
                      <Text style={styles.ratingText}>{hotel.rating}</Text>
                    </View>
                  </View>

                  <Text style={styles.hotelDesc}>{hotel.description}</Text>

                  {hotel.suitabilityReason && (
                    <View style={styles.suitabilityCard}>
                      <Ionicons name="sparkles" size={12} color={Colors.SECONDARY} />
                      <Text style={styles.suitabilityText}>{hotel.suitabilityReason}</Text>
                    </View>
                  )}
                </View>
              </MotiView>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Exploring best options for your {cityName} journey...</Text>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.searchButton}
          onPress={openGeneralSearch}
        >
          <Text style={styles.searchButtonText}>Explore More Stays</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.WHITE} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: 5, paddingBottom: 20 },
  header: { paddingHorizontal: 0, marginBottom: 20 },
  overline: {
    fontFamily: "interMedium",
    fontSize: 10,
    color: Colors.MUTED_TEXT,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  titleRow: { flexDirection: "row", alignItems: "baseline", marginTop: 2 },
  sectionTitle: { fontSize: 28, fontFamily: "playfairBold", color: Colors.TEXT },
  goldDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.SECONDARY, marginLeft: 4, marginBottom: 6,
  },
  hotelScroll: { paddingHorizontal: 0, gap: 15, paddingBottom: 15 },
  hotelCard: {
    width: width * 0.7,
    backgroundColor: Colors.WHITE,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    elevation: 8,
    shadowColor: Colors.BLACK,
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
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  priceText: { fontFamily: "interBold", fontSize: 14, color: Colors.PRIMARY },
  perNight: { fontFamily: "inter", fontSize: 8, color: Colors.MUTED_TEXT },
  hotelDetails: { padding: 16 },
  hotelMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  hotelName: { flex: 1, fontFamily: "playfairBold", fontSize: 18, color: Colors.TEXT, marginRight: 10 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(235, 186, 73, 0.1)", paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontFamily: "interBold", fontSize: 12, color: Colors.SECONDARY },
  hotelDesc: { fontFamily: "outfit", fontSize: 12, color: Colors.GRAY, lineHeight: 18, marginTop: 4 },
  suitabilityCard: {
    marginTop: 15,
    backgroundColor: "rgba(235, 186, 73, 0.05)",
    padding: 12,
    borderRadius: 14,
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(235, 186, 73, 0.1)",
  },
  suitabilityText: {
    flex: 1,
    fontFamily: "outfit",
    fontSize: 11,
    color: "#6D5E3D",
    lineHeight: 16,
  },
  emptyState: { padding: 40, alignItems: "center" },
  emptyText: { fontFamily: "inter", fontSize: 14, color: Colors.MUTED_TEXT, textAlign: "center" },
  footer: { marginTop: 10, paddingHorizontal: 4 },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 18,
    borderRadius: 15,
    gap: 8,
    elevation: 5,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    margin: 10,
  },
  searchButtonText: {
    fontFamily: "interBold",
    fontSize: 15,
    color: Colors.WHITE,
    textAlign: "center",
  },
});
