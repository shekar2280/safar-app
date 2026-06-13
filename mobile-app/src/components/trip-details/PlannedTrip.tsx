import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, useThemeColors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { PlannedTripProps } from "@/src/constants";

export default function PlannedTrip({
  cityName,
  isActive,
  isFinished = false,
  onActivate,
  onNavigateToActive,
  itineraryDetails,
  visitedIndices = [],
  skippedIndices = [],
  onToggleVisited,
}: PlannedTripProps) {
  const colors = useThemeColors();
  const { isDark } = useTheme();

  const places = useMemo(() => {
    if (!itineraryDetails || !Array.isArray(itineraryDetails)) return [];
    let raw: any[];
    if (itineraryDetails.length > 0 && itineraryDetails[0].places) {
      raw = itineraryDetails.flatMap(day => day.places || []);
    } else {
      raw = itineraryDetails;
    }

    const unvisited = raw.map((p, idx) => ({ ...p, originalIndex: idx }))
      .filter(p => !visitedIndices.includes(p.originalIndex));
    
    const normal = unvisited.filter(p => !skippedIndices.includes(p.originalIndex));
    const postponed = unvisited.filter(p => skippedIndices.includes(p.originalIndex));

    const activeOrdered = [...normal, ...postponed];
    
    const completed = raw.map((p, idx) => ({ ...p, originalIndex: idx }))
      .filter(p => visitedIndices.includes(p.originalIndex));

    return [...activeOrdered, ...completed];
  }, [itineraryDetails, visitedIndices, skippedIndices]);

  const renderPlaceItem = (item: any, idx: number, isBlurred = false, hideLine = false) => {
    const isVisited = visitedIndices.includes(idx);

    return (
      <View key={idx} style={styles.timelineRow}>
        <View style={styles.timelineSidebar}>
          <View style={[styles.timelineDot, { backgroundColor: isVisited ? colors.GOLD : colors.BORDER }]} />
          {!hideLine && !(idx === places.length - 1 && !isBlurred) && <View style={[styles.timelineLine, { backgroundColor: isVisited ? colors.GOLD : colors.BORDER }]} />}
        </View>
        <View style={[styles.placeCard, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER, flex: 1 }, isBlurred && styles.blurredCard, isVisited && styles.visitedCard]}>
          <View style={styles.vibeRow}>
            <Text style={[styles.placeName, { color: colors.TEXT }, isVisited && styles.visitedText]}>{item.placeName}</Text>
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
              <View style={[styles.vibeBadge, { backgroundColor: colors.GOLD_MUTED, borderColor: colors.GOLD_MUTED }]}>
                <Ionicons name="sparkles" size={10} color={colors.GOLD} style={{ marginRight: 4 }} />
                <Text style={[styles.vibeText, { color: colors.GOLD }]} numberOfLines={1}>{item.vibe.toUpperCase()}</Text>
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

  const renderTeaserItem = (item: any, idx: number) => (
    <View key={idx} style={styles.timelineRow}>
      <View style={styles.timelineSidebar}>
        <View style={[styles.timelineDot, { backgroundColor: 'transparent', borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.GOLD, opacity: 0.5 }]} />
        <View style={[styles.timelineLine, { backgroundColor: colors.BORDER }]} />
      </View>
      <View style={[styles.placeCard, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER, flex: 1, overflow: 'hidden' }]}>
        <View style={styles.vibeRow}>
          <Text style={[styles.placeName, { color: colors.MUTED_TEXT, opacity: 0.7 }]} numberOfLines={1}>{item.placeName}</Text>
          <View style={[styles.teaserBadge, { backgroundColor: colors.GOLD_MUTED }]}>
            <Text style={[styles.teaserBadgeText, { color: colors.GOLD }]}>COMING UP</Text>
          </View>
        </View>
        <View style={[styles.teaserOverlay, { backgroundColor: isDark ? 'rgba(18,18,28,0.7)' : 'rgba(248,248,252,0.78)' }]} pointerEvents="none">
          <Ionicons name="lock-closed-outline" size={13} color={colors.MUTED_TEXT} />
          <Text style={[styles.teaserOverlayText, { color: colors.MUTED_TEXT }]}>Details revealed when you arrive</Text>
        </View>
      </View>
    </View>
  );

  const renderLockedSummary = (count: number) => (
    <View style={styles.timelineRow}>
      <View style={styles.timelineSidebar}>
        <View style={[styles.timelineDot, { backgroundColor: 'transparent', borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.BORDER, opacity: 0.4 }]} />
      </View>
      <View style={[styles.lockedSummaryCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
        <Ionicons name="lock-closed" size={16} color={colors.GOLD} />
        <Text style={[styles.lockedSummaryText, { color: colors.MUTED_TEXT }]}>
          {count === 1 ? '1 more hidden sight ahead' : `${count} more hidden sights ahead`}
        </Text>
      </View>
    </View>
  );


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

        {places.length > 1 && (
          <View style={styles.lockedContainer}>
            <View style={styles.blurredItemsWrapper}>
              {places.slice(1, 2).map((item, idx) => renderPlaceItem(item, idx + 1, true, true))}
              <LinearGradient
                colors={["rgba(255,255,255,0)", isDark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)", colors.BACKGROUND]}
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
              />
            </View>

            <View style={[styles.lockOverlayContainer, { zIndex: 10 }]}>
              {isFinished ? (
                <View style={[styles.premiumLockCard, { opacity: 0.95 }]}>
                  <LinearGradient colors={["#262626", "#1a1a1a"]} style={styles.gradientBg}>
                    <View style={styles.lockIconContainer}>
                      <Ionicons name="trophy" size={28} color={colors.GOLD} />
                      <View style={[styles.lockBadge, { backgroundColor: colors.GOLD }]}>
                        <Ionicons name="checkmark-sharp" size={12} color={Colors.BLACK} />
                      </View>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[styles.lockTitle, { color: Colors.WHITE }]}>Journey Completed</Text>
                      <Text style={[styles.lockSubtitle, { color: "rgba(255,255,255,0.6)", textAlign: 'center' }]}>
                        We hope you had a magical experience!
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.95}
                  onPress={isActive ? onNavigateToActive : onActivate}
                  style={styles.premiumLockCard}
                >
                  <LinearGradient colors={["#262626", "#1a1a1a"]} style={styles.gradientBg}>
                    <View style={styles.lockIconContainer}>
                      <Ionicons
                        name={isActive ? "compass" : "sparkles"}
                        size={28}
                        color={colors.GOLD}
                      />
                      <View style={styles.lockBadge}>
                        <Ionicons
                          name={isActive ? "navigate" : "lock-closed"}
                          size={12}
                          color={Colors.BLACK}
                        />
                      </View>
                    </View>
                    <Text style={[styles.lockTitle, { color: Colors.WHITE }]}>
                      {isActive ? "Ready to Explore?" : "Unlock The Full Guide"}
                    </Text>
                    <Text style={[styles.lockSubtitle, { color: "rgba(255,255,255,0.6)" }]}>
                      {isActive
                        ? "Jump into the Live Guide to get real-time navigation, distances, and your full Fog-of-War itinerary."
                        : "Activate your trip to reveal your full daily schedule, local hidden gems, and AI-powered travel tools."}
                    </Text>
                    <View style={[styles.unlockButton, { backgroundColor: colors.GOLD }]}>
                      <Text style={[styles.unlockButtonText, { color: Colors.BLACK }]}>
                        {isActive ? "GO LIVE" : "Activate Trip"}
                      </Text>
                      <Ionicons
                        name={isActive ? "compass" : "chevron-forward"}
                        size={16}
                        color={Colors.BLACK}
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
      <View style={styles.attributionContainer}>
        <Text style={[styles.attributionText, { color: colors.MUTED_TEXT }]}>
          LOCATIONS PROVIDED BY OPENTRIPMAP
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: 10 },
  header: { paddingHorizontal: 0, marginBottom: 16 },
  overline: {
    fontFamily: "outfitMedium",
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  titleRow: { flexDirection: "row", alignItems: "baseline", marginTop: 0 },
  sectionTitle: { fontSize: 22, fontFamily: "playfairBold" },
  goldDot: {
    width: 6, height: 6, borderRadius: 3,
    marginLeft: 4, marginBottom: 6,
  },
  itineraryList: {
    paddingHorizontal: 0,
    marginBottom: 0,
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
  },
  placeCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
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
    marginTop: 0,
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
    marginBottom: 25,
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
    opacity: 1,
  },
  visitedText: {
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
  teaserBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  teaserBadgeText: {
    fontFamily: 'outfitBold',
    fontSize: 8,
    letterSpacing: 0.5,
  },
  teaserOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  teaserOverlayText: {
    fontFamily: 'outfitMedium',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  lockedSummaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  lockedSummaryText: {
    fontFamily: 'outfitMedium',
    fontSize: 13,
  },
  attributionContainer: {
    marginTop: 20,
    alignItems: 'center',
    opacity: 0.4,
  },
  attributionText: {
    fontFamily: 'outfitBold',
    fontSize: 8,
    letterSpacing: 1.5,
  },
});
