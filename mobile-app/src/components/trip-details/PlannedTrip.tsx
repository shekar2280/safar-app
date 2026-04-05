import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "@/src/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface PlannedTripProps {
  itineraryDetails?: any;
  cityName: string;
  isActive: boolean;
  onActivate: () => void;
  onNavigateToActive: () => void;
  visitedIndices?: number[];
  onToggleVisited?: (index: number) => void;
}

export default function PlannedTrip({
  cityName,
  isActive,
  onActivate,
  onNavigateToActive,
  itineraryDetails,
  visitedIndices = [],
  onToggleVisited,
}: PlannedTripProps) {

  const places = Array.isArray(itineraryDetails) ? itineraryDetails : [];

  const renderPlaceItem = (item: any, idx: number, isBlurred = false) => {
    const isVisited = visitedIndices.includes(idx);

    return (
      <View key={idx} style={[styles.placeCard, isBlurred && styles.blurredCard, isVisited && styles.visitedCard]}>
        <View style={styles.vibeRow}>
          <Text style={[styles.placeName, isVisited && styles.visitedText]}>{item.placeName}</Text>
          {isActive && !isBlurred && (
            <TouchableOpacity
              onPress={() => onToggleVisited?.(idx)}
              style={[styles.checkCircle, isVisited && styles.checkCircleActive]}
            >
              <Ionicons
                name={isVisited ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={isVisited ? Colors.SECONDARY : "#CBD5E1"}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.vibeRow}>
          {item.vibe && (
            <View style={styles.vibeBadge}>
              <Ionicons name="sparkles" size={10} color="#6D5E3D" style={{ marginRight: 4 }} />
              <Text style={styles.vibeText} numberOfLines={1}>{item.vibe.toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={10} color={Colors.SECONDARY} />
            <Text style={styles.timeTagText} numberOfLines={1}>{item.estimatedTravelTime}</Text>
          </View>
        </View>

        <Text style={[styles.placeDetails, isVisited && styles.visitedText]}>
          {item.placeDetails}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.overline}>PERSONAL GUIDE</Text>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Smart Itinerary</Text>
          <View style={styles.goldDot} />
        </View>
      </View>

      <View style={styles.itineraryList}>
        {places.length > 0 && renderPlaceItem(places[0], 0)}

        {isActive && places.slice(1).map((item, idx) => renderPlaceItem(item, idx + 1))}

        {!isActive && places.length > 1 && (
          <View style={styles.lockedContainer}>
            <View style={styles.blurredItemsWrapper}>
              {places.slice(1, 3).map((item, idx) => renderPlaceItem(item, idx + 1, true))}
              <LinearGradient
                colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.8)", Colors.WHITE]}
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
              />
            </View>

            <View style={styles.lockOverlayContainer}>
              <TouchableOpacity activeOpacity={0.95} onPress={onActivate} style={styles.premiumLockCard}>
                <LinearGradient colors={[Colors.PRIMARY, "#1a1a1a"]} style={styles.gradientBg}>
                  <View style={styles.lockIconContainer}>
                    <Ionicons name="sparkles" size={28} color={Colors.SECONDARY} />
                    <View style={styles.lockBadge}>
                      <Ionicons name="lock-closed" size={12} color={Colors.BLACK} />
                    </View>
                  </View>
                  <Text style={styles.lockTitle}>Unlock The Full Guide</Text>
                  <Text style={styles.lockSubtitle}>
                    Activate your trip to reveal your full daily schedule, local hidden gems, and AI-powered travel tools.
                  </Text>
                  <View style={styles.unlockButton}>
                    <Text style={styles.unlockButtonText}>Go Premium & Unlock</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.BLACK} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {isActive && (
        <TouchableOpacity activeOpacity={0.9} onPress={onNavigateToActive} style={styles.successCard}>
          <LinearGradient
            colors={[Colors.SECONDARY, "#D4AF37"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.successGradient}
          >
            <View style={styles.successIconBadge}>
              <Ionicons name="compass" size={24} color={Colors.WHITE} />
            </View>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.successTitle}>Active Itinerary</Text>
              <Text style={styles.successSubtitle}>Access your real-time journey & navigation.</Text>
            </View>
            <View style={styles.goActiveBtn}>
              <Text style={styles.goActiveBtnText}>GO LIVE</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 0, marginBottom: 10 },
  header: { paddingHorizontal: 0, marginBottom: 20 },
  overline: {
    fontFamily: "outfitMedium",
    fontSize: 10,
    color: Colors.GRAY,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  titleRow: { flexDirection: "row", alignItems: "baseline", marginTop: -4 },
  sectionTitle: { fontSize: 28, fontFamily: "playfairBold", color: Colors.TEXT },
  goldDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.SECONDARY, marginLeft: 4, marginBottom: 6,
  },
  itineraryList: {
    paddingHorizontal: 0,
    marginBottom: 20,
  },
  lockedContainer: {
    position: "relative",
    marginTop: -10,
  },
  blurredItemsWrapper: {
    position: 'relative'
  },
  blurredCard: {
    opacity: 0.6,
  },
  lockOverlayContainer: {
    position: "absolute",
    inset: 0,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  placeCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  placeName: {
    flex: 1,
    fontFamily: "playfairBold",
    fontSize: 20,
    color: Colors.TEXT,
  },
  vibeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  vibeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(235, 186, 73, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    flexShrink: 1,
    borderWidth: 1,
    borderColor: "rgba(235, 186, 73, 0.15)",
  },
  vibeText: {
    fontFamily: "outfitBold",
    fontSize: 9,
    color: "#6D5E3D",
    letterSpacing: 0.8,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.03)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 1,
  },
  timeTagText: {
    fontFamily: "outfitMedium",
    fontSize: 9,
    color: Colors.GRAY,
    flexShrink: 1,
  },
  placeDetails: {
    fontFamily: "outfit",
    fontSize: 13,
    color: Colors.GRAY,
    lineHeight: 20,
  },
  premiumLockCard: {
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
    elevation: 20,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    marginTop: 20,
  },
  gradientBg: { padding: 30, alignItems: "center", justifyContent: "center" },
  lockIconContainer: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center", alignItems: "center",
    marginBottom: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  lockBadge: {
    position: "absolute", bottom: -2, right: -2,
    backgroundColor: Colors.SECONDARY,
    width: 20, height: 20, borderRadius: 10,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: Colors.PRIMARY,
  },
  lockTitle: {
    fontFamily: "playfairBold",
    fontSize: 22,
    color: Colors.WHITE,
    textAlign: "center",
    marginBottom: 8
  },
  lockSubtitle: {
    fontFamily: "outfit", fontSize: 13, color: "rgba(255,255,255,0.6)",
    textAlign: "center", lineHeight: 20, marginBottom: 24, paddingHorizontal: 10,
  },
  unlockButton: {
    backgroundColor: Colors.SECONDARY,
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 8,
  },
  unlockButtonText: { fontFamily: "outfitBold", fontSize: 14, color: Colors.BLACK },
  successCard: {
    borderRadius: 24, overflow: "hidden",
    elevation: 8,
    shadowColor: Colors.SECONDARY,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15,
  },
  successGradient: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  successIconBadge: {
    backgroundColor: "rgba(255,255,255,0.4)",
    width: 44, height: 44, borderRadius: 14,
    justifyContent: "center", alignItems: "center",
  },
  successTitle: { fontFamily: "outfitBold", fontSize: 15, color: Colors.BLACK },
  successSubtitle: { fontFamily: "outfit", fontSize: 11, color: "rgba(0,0,0,0.6)", marginTop: 1 },
  goActiveBtn: { backgroundColor: Colors.BLACK, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  goActiveBtnText: { fontFamily: "outfitBold", fontSize: 10, color: Colors.WHITE, letterSpacing: 1 },
  checkCircle: {
    padding: 4,
  },
  checkCircleActive: {
    transform: [{ scale: 1.1 }],
  },
  visitedCard: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    opacity: 0.8,
  },
  visitedText: {
    textDecorationLine: "line-through",
    color: "#94A3B8",
  },
});
