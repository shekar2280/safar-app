import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, useThemeColors } from "@/src/constants/colors";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Button from "@/src/components/common/Button";

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
  const colors = useThemeColors();
  const { isDark } = useTheme();

  const places = Array.isArray(itineraryDetails) ? itineraryDetails : [];

  const renderPlaceItem = (item: any, idx: number, isBlurred = false, hideLine = false) => {
    const isVisited = visitedIndices.includes(idx);

    return (
      <View key={idx} style={styles.timelineRow}>
        <View style={styles.timelineSidebar}>
          <View style={[styles.timelineDot, { backgroundColor: isVisited ? colors.GOLD : colors.BORDER }]} />
          {!hideLine && !(idx === places.length - 1 && !isBlurred) && <View style={[styles.timelineLine, { backgroundColor: isVisited ? colors.GOLD : colors.BORDER }]} />}
        </View>
        <View style={[styles.placeCard, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER, flex: 1 }, isBlurred && styles.blurredCard, isVisited && [styles.visitedCard, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC", borderColor: isDark ? "rgba(255,255,255,0.05)" : "#E2E8F0" }]]}>
          <View style={styles.vibeRow}>
            <Text style={[styles.placeName, { color: colors.TEXT }, isVisited && [styles.visitedText, { color: isDark ? "rgba(255,255,255,0.3)" : "#94A3B8" }]]}>{item.placeName}</Text>
            {isActive && !isBlurred && (
              <TouchableOpacity
                onPress={() => onToggleVisited?.(idx)}
                style={[styles.checkCircle, isVisited && styles.checkCircleActive]}
              >
                <Ionicons
                  name={isVisited ? "checkmark-circle" : "ellipse-outline"}
                  size={24}
                  color={isVisited ? colors.GOLD : isDark ? "rgba(255,255,255,0.2)" : "#CBD5E1"}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.vibeRow}>
            {item.vibe && (
              <View style={[styles.vibeBadge, { backgroundColor: isDark ? "rgba(212,175,55,0.05)" : "rgba(235, 186, 73, 0.08)", borderColor: isDark ? "rgba(212,175,55,0.15)" : "rgba(235, 186, 73, 0.15)" }]}>
                <Ionicons name="sparkles" size={10} color={colors.GOLD} style={{ marginRight: 4 }} />
                <Text style={[styles.vibeText, { color: isDark ? "#D4AF37" : "#6D5E3D" }]} numberOfLines={1}>{item.vibe.toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={10} color={colors.GOLD} />
              <Text style={[styles.timeTagText, { color: colors.MUTED_TEXT }]} numberOfLines={1}>{item.estimatedTravelTime}</Text>
            </View>
          </View>

          <Text style={[styles.placeDetails, { color: colors.MUTED_TEXT }, isVisited && styles.visitedText]}>
            {item.placeDetails}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={[styles.overline, { color: colors.MUTED_TEXT }]}>PERSONAL GUIDE</Text>
        <View style={styles.titleRow}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>Smart Itinerary</Text>
          <View style={[styles.goldDot, { backgroundColor: colors.GOLD }]} />
        </View>
      </View>

      <View style={styles.itineraryList}>
        {places.length > 0 && renderPlaceItem(places[0], 0)}

        {isActive && places.slice(1).map((item, idx) => renderPlaceItem(item, idx + 1))}

        {!isActive && places.length > 1 && (
          <View style={styles.lockedContainer}>
            <View style={styles.blurredItemsWrapper}>
              {places.slice(1, 3).map((item, idx, arr) => renderPlaceItem(item, idx + 1, true, idx === arr.length - 1))}
              <LinearGradient
                colors={["rgba(255,255,255,0)", isDark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)", colors.BACKGROUND]}
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
              />
            </View>

            <View style={[styles.lockOverlayContainer, { zIndex: 10 }]}>
              <TouchableOpacity activeOpacity={0.95} onPress={onActivate} style={styles.premiumLockCard}>
                <LinearGradient colors={["#262626", "#1a1a1a"]} style={styles.gradientBg}>
                  <View style={styles.lockIconContainer}>
                    <Ionicons name="sparkles" size={28} color={colors.GOLD} />
                    <View style={styles.lockBadge}>
                      <Ionicons name="lock-closed" size={12} color={Colors.BLACK} />
                    </View>
                  </View>
                  <Text style={[styles.lockTitle, { color: Colors.WHITE }]}>Unlock The Full Guide</Text>
                  <Text style={[styles.lockSubtitle, { color: "rgba(255,255,255,0.6)" }]}>
                    Activate your trip to reveal your full daily schedule, local hidden gems, and AI-powered travel tools.
                  </Text>
                  <View style={[styles.unlockButton, { backgroundColor: colors.GOLD }]}>
                    <Text style={[styles.unlockButtonText, { color: Colors.BLACK }]}>Go Premium & Unlock</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.BLACK} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {isActive && (
        <Button
          title="GO LIVE"
          onPress={onNavigateToActive}
          icon="compass"
          style={{ width: '100%' }}
        />
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
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  titleRow: { flexDirection: "row", alignItems: "baseline", marginTop: -4 },
  sectionTitle: { fontSize: 28, fontFamily: "playfairBold" },
  goldDot: {
    width: 6, height: 6, borderRadius: 3,
    marginLeft: 4, marginBottom: 6,
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  placeName: {
    flex: 1,
    fontFamily: "playfairBold",
    fontSize: 20,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    flexShrink: 1,
    borderWidth: 1,
  },
  vibeText: {
    fontFamily: "outfitBold",
    fontSize: 9,
    letterSpacing: 0.8,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 1,
  },
  timeTagText: {
    fontFamily: "outfitMedium",
    fontSize: 9,
    flexShrink: 1,
  },
  placeDetails: {
    fontFamily: "outfit",
    fontSize: 13,
    lineHeight: 20,
  },
  premiumLockCard: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 20,
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
    backgroundColor: Colors.GOLD,
    width: 20, height: 20, borderRadius: 10,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "#262626",
  },
  lockTitle: {
    fontFamily: "playfairBold",
    fontSize: 22,
    textAlign: "center",
    marginBottom: 8
  },
  lockSubtitle: {
    fontFamily: "outfit", fontSize: 13,
    textAlign: "center", lineHeight: 20, marginBottom: 24, paddingHorizontal: 10,
  },
  unlockButton: {
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 8,
  },
  unlockButtonText: { fontFamily: "outfitBold", fontSize: 14 },
  successCard: {
    borderRadius: 24, overflow: "hidden",
    elevation: 8,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15,
  },
  successGradient: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  successIconBadge: {
    backgroundColor: "rgba(255,255,255,0.4)",
    width: 44, height: 44, borderRadius: 14,
    justifyContent: "center", alignItems: "center",
  },
  successTitle: { fontFamily: "outfitBold", fontSize: 15 },
  successSubtitle: { fontFamily: "outfit", fontSize: 11, marginTop: 1 },
  goActiveBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  goActiveBtnText: { fontFamily: "outfitBold", fontSize: 10, letterSpacing: 1 },
  checkCircle: {
    padding: 4,
  },
  checkCircleActive: {
    transform: [{ scale: 1.1 }],
  },
  visitedCard: {
    opacity: 0.8,
  },
  visitedText: {
    textDecorationLine: "line-through",
  },
  timelineRow: {
    flexDirection: "row",
    gap: 12,
  },
  timelineSidebar: {
    width: 20,
    alignItems: "center",
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 26,
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    position: 'absolute',
    top: 34,
    bottom: -16,
    left: 9,
    zIndex: 1,
  },
});
