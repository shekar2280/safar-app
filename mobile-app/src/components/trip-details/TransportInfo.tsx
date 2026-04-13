import React, { memo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { Colors, useThemeColors } from "@/src/constants/colors";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { ImageBackground, ScrollView as RNScrollView } from "react-native";
import dayjs from "dayjs";
import { TRANSPORT_INSIGHTS_IMAGES } from "@/src/constants/travel-data";

import { FlightDeal, TransportData } from "@/src/types/interfaces";

const TransportInfo = ({ transportData }: { transportData?: TransportData }) => {
  const colors = useThemeColors();
  const { isDark } = useTheme();

  if (!transportData?.departureIata) return null;

  const { tripType, departureIata, destinationIata, bestTransport, weatherInsight, flights } = transportData;

  const openAgency = (url: string) => {
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open the website. Please check your internet.")
    );
  };

  const BookingCard = ({
    name,
    url,
    image,
    color,
  }: {
    name: string;
    url: string;
    image: any;
    color: string;
  }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]} onPress={() => openAgency(url)} activeOpacity={0.8}>
      <View style={styles.content}>
        <View style={[styles.logoCircle, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F8F8F8", borderColor: colors.BORDER }]}>
          <Image source={image} style={styles.logoImage} contentFit="contain" />
        </View>
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={[styles.agencyName, { color: colors.TEXT }]}>{name}</Text>
          <Text style={[styles.subText, { color: colors.MUTED_TEXT }]}>Find best {tripType} rates</Text>
        </View>
        <View style={[styles.viewBtn, { backgroundColor: color }]}>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={[styles.overline, { color: colors.MUTED_TEXT }]}>TRANSPORT LOGISTICS</Text>
        <View style={styles.titleRow}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>Travel Route</Text>
          <View style={[styles.goldDot, { backgroundColor: colors.GOLD }]} />
        </View>
      </View>
      <LinearGradient
        colors={["#262626", "#1a1a1a"]}
        style={styles.routeContainer}
      >
        <View style={styles.routeHeader}>
          <View style={styles.iataBox}>
            <Text style={[styles.iataCode, { color: "#FFF" }]}>{departureIata}</Text>
            <Text style={[styles.cityLabel, { color: "rgba(255,255,255,0.6)" }]}>DEPARTURE</Text>
          </View>

          <View style={styles.planeLine}>
            <View style={styles.dashLine} />
            <View style={styles.planeCircle}>
              <Ionicons name="airplane" size={24} color={Colors.SECONDARY} />
            </View>
          </View>

          <View style={[styles.iataBox, { alignItems: "flex-end" }]}>
            <Text style={[styles.iataCode, { color: "#FFF" }]}>{destinationIata}</Text>
            <Text style={[styles.cityLabel, { color: "rgba(255,255,255,0.6)" }]}>ARRIVAL</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={{ marginTop: 25, padding: 0 }}>
        <Text style={[styles.smallTitle, { color: colors.MUTED_TEXT }]}>BOOKING OPTIONS</Text>
        <BookingCard
          name="MakeMyTrip"
          url="https://www.makemytrip.com/"
          color="#E11C23"
          image={require("../../../assets/images/trip-details/travel/makemytrip.png")}
        />
        <BookingCard
          name="Cleartrip"
          url="https://www.cleartrip.com/"
          color="#1A1A1A"
          image={require("../../../assets/images/trip-details/travel/clear-trip.png")}
        />
        <BookingCard
          name="Ixigo"
          url="https://www.ixigo.com/"
          color="#FC8019"
          image={require("../../../assets/images/trip-details/travel/ixigo.png")}
        />
      </View>
      {(bestTransport || weatherInsight) && (
        <View style={{ marginBottom: 20, marginTop:10 }}>
          <Text style={[styles.smallTitle, { color: colors.MUTED_TEXT }]}>SAFAR INSIGHTS</Text>
          <View style={{ paddingHorizontal: 0 }}>
            {bestTransport && (
              <ImageBackground
                source={{ uri: TRANSPORT_INSIGHTS_IMAGES.NAVIGATOR }}
                style={styles.insightCardPremium}
                imageStyle={{ borderRadius: 20 }}
              >
                <LinearGradient
                  colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.85)"]}
                  style={styles.insightOverlay}
                >
                  <View style={styles.insightHeaderRow}>
                    <Ionicons name="compass" size={20} color={Colors.SECONDARY} />
                    <Text style={styles.insightTitlePremium}>PRO NAVIGATOR</Text>
                  </View>
                  <Text style={styles.insightTextPremium}>{bestTransport}</Text>
                </LinearGradient>
              </ImageBackground>
            )}
            {weatherInsight && (
              <ImageBackground
                source={{ uri: TRANSPORT_INSIGHTS_IMAGES.WEATHER }}
                style={[styles.insightCardPremium, { marginTop: 14 }]}
                imageStyle={{ borderRadius: 20 }}
              >
                <LinearGradient
                  colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.85)"]}
                  style={styles.insightOverlay}
                >
                  <View style={styles.insightHeaderRow}>
                    <Ionicons name="partly-sunny" size={20} color="#FFC107" />
                    <Text style={styles.insightTitlePremium}>CLIMATIC INSIGHT</Text>
                  </View>
                  <Text style={styles.insightTextPremium}>{weatherInsight}</Text>
                </LinearGradient>
              </ImageBackground>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default memo(TransportInfo);

const styles = StyleSheet.create({
  wrapper: { marginVertical: 10 },
  header: { paddingHorizontal: 0, marginBottom: 16 },
  overline: { fontFamily: "interMedium", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 },
  titleRow: { flexDirection: "row", alignItems: "baseline", marginTop: -4 },
  sectionTitle: { fontSize: 28, fontFamily: "playfairBold" },
  goldDot: { width: 6, height: 6, borderRadius: 3, marginLeft: 4, marginBottom: 6 },
  routeContainer: { 
    borderRadius: 32, 
    padding: 24, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 12 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 20, 
    elevation: 8 
  },
  routeHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iataBox: { flex: 1 },
  iataCode: { fontSize: 32, fontFamily: "playfairBold", letterSpacing: 1 },
  cityLabel: { fontSize: 10, fontFamily: "interMedium", letterSpacing: 1.5, marginTop: 4 },
  planeLine: { flex: 1.5, alignItems: "center", justifyContent: "center" },
  dashLine: { position: "absolute", width: "100%", height: 1, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderStyle: "dashed", borderRadius: 1 },
  planeCircle: { backgroundColor: "rgba(255,255,255,0.1)", width: 52, height: 52, borderRadius: 26, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  smallTitle: { fontFamily: "outfitMedium", fontSize: 10, letterSpacing: 2, marginBottom: 12, marginLeft: 0 },
  card: { borderRadius: 24, marginBottom: 12, padding: 14, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  content: { flexDirection: "row", alignItems: "center" },
  logoCircle: { width: 48, height: 48, borderRadius: 16, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  logoImage: { width: "70%", height: "70%" },
  agencyName: { fontFamily: "outfitBold", fontSize: 16 },
  subText: { fontFamily: "outfit", fontSize: 12, marginTop: 1 },
  viewBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  insightCardPremium: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    backgroundColor: "#000",
  },
  insightOverlay: {
    borderRadius: 20,
    padding: 20,
    minHeight: 130,
    justifyContent: "flex-end",
  },
  insightHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  insightTitlePremium: {
    fontFamily: "interBold",
    fontSize: 11,
    color: "#FFF",
    letterSpacing: 1.5,
  },
  insightTextPremium: {
    fontFamily: "playfairBold",
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 26,
  },
  flightCard: {
    width: 160,
    height: 110,
    marginRight: 12,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  flightGradient: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  flightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  flightDest: {
    fontFamily: "playfairBold",
    fontSize: 22,
    color: "#FFF",
  },
  priceBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  priceLabel: {
    fontFamily: "outfitBold",
    fontSize: 12,
  },
  flightFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  flightDate: {
    fontFamily: "interMedium",
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.5,
  },
});
