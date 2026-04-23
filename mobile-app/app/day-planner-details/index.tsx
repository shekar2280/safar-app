import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/src/constants/colors";
import { useTheme } from "@/src/context/ThemeContext";
import { getDistance } from "@/src/utils/geoUtils";
import { useActiveTrip } from "@/src/context/ActiveTripContext";
import { auth } from "@/src/lib/firebase";
import { Image } from "expo-image";
import { fallbackImages } from "@/src/constants";
import { PlaceItem, LocalExperience, SightItem, ExperienceItem, JourneyItem, VisibilityState } from "@/src/types";
import SafarAlert from "@/src/components/ui/SafarAlert";
import { useLocationTracker } from "@/src/hooks/useLocationTracker";
import { LocationStatus } from "@/src/components/planner/LocationStatus";
import { PlannerItem } from "@/src/components/planner/PlannerItem";
import { LockedSight } from "@/src/components/planner/LockedSight";

const { height } = Dimensions.get("window");

export default function DailyPlanner() {
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;
  const { activeTrip, toggleVisited, toggleSkipped, finalizeTrip } = useActiveTrip();
  const colors = useThemeColors();
  const { isDark } = useTheme();

  const {
    userLocation,
    showLocationAlert,
    isLocationBlocked,
    loading,
    refreshLocation,
    setShowLocationAlert,
  } = useLocationTracker();

  const [processingIndex, setProcessingIndex] = useState<number | null>(null);
  const [concluding, setConcluding] = useState(false);
  const [showConcludeAlert, setShowConcludeAlert] = useState(false);
  const isFinished = activeTrip?.isFinished || false;

  const effectiveLocation = userLocation;

  const randomFallback = useMemo(() => {
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  }, [activeTrip?.id]);

  const displayImage = useMemo(() => {
    const img = activeTrip?.imageUrl;
    if (Array.isArray(img) && img.length > 0) {
      return { uri: img[2] || img[0] };
    }
    if (typeof img === "string" && img.trim().length > 0) {
      return { uri: img };
    }
    return randomFallback;
  }, [activeTrip?.imageUrl, randomFallback]);

  const sections = useMemo(() => {
    if (!activeTrip?.tripPlan) return { active: [] as JourneyItem[], completed: [] as JourneyItem[] };

    const { dailyItinerary, recommendations } = activeTrip.tripPlan;
    const completedIndices = activeTrip.visitedIndices || [];
    const skippedIndices = activeTrip.skipped_indices || [];

    const rawArray: any[] = Array.isArray(dailyItinerary)
      ? dailyItinerary
      : (dailyItinerary as any)?.places || [];

    const itineraryArray: PlaceItem[] = (rawArray.length > 0 && rawArray[0].places)
      ? rawArray.flatMap((day: any) => day.places || [])
      : rawArray;

    const allSights: SightItem[] = itineraryArray.map((p, idx) => ({
      ...p,
      isLocation: true,
      originalIndex: idx,
      isDone: completedIndices.includes(idx),
      isSkipped: skippedIndices.includes(idx),
      distance: (effectiveLocation && p.geoCoordinates)
        ? getDistance(
          effectiveLocation.latitude,
          effectiveLocation.longitude,
          p.geoCoordinates.latitude,
          p.geoCoordinates.longitude,
        )
        : null,
    }));

    const allExps: ExperienceItem[] = (recommendations?.localExperiences || []).map((e, idx) => ({
      ...e,
      placeName: e.experienceName,
      isDone: false,
      isLocation: false,
    }));

    const sortedSights = [...allSights].sort(
      (a, b) => (a.distance ?? 999) - (b.distance ?? 999),
    );

    const mappedJourney: JourneyItem[] = sortedSights.map((sight, index) => ({
      ...sight,
      activity: allExps[index] || null,
    }));

    const completed = mappedJourney.filter((item) => item.isDone);
    
    let active: JourneyItem[];
    if (isFinished) {
      active = [];
    } else {
      const unvisited = mappedJourney.filter((item) => !item.isDone);
      const normal = unvisited.filter(item => !(item as any).isSkipped);
      const postponed = unvisited.filter(item => (item as any).isSkipped);
      active = [...normal, ...postponed];
    }

    return { active, completed };
  }, [effectiveLocation, activeTrip?.visitedIndices, activeTrip?.skipped_indices, activeTrip?.tripPlan, isFinished]);

  const visibilityMap = useMemo((): VisibilityState[] => {
    return sections.active.map((_, idx) => {
      if (idx === 0) return 'full';
      if (idx === 1) return 'teaser';
      return 'locked';
    });
  }, [sections.active]);

  const lockedCount = useMemo(
    () => sections.active.filter((_, idx) => visibilityMap[idx] === 'locked').length,
    [sections.active, visibilityMap]
  );

  const openNavigation = (placeName: string) => {
    const query = encodeURIComponent(`${placeName} ${activeTrip?.tripPlan?.tripName}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url);
  };

  const findNearbyFood = (placeName: string) => {
    const searchQuery = encodeURIComponent(`Best Restaurants near ${placeName} ${activeTrip?.tripPlan?.tripName || ""}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
    Linking.openURL(url);
  };

  const handleMarkAsDone = async (item: JourneyItem) => {
    if (user && activeTrip) {
      const idx = item.originalIndex;
      setProcessingIndex(idx);
      await toggleVisited(activeTrip.id, idx);
      refreshLocation(true);
      setProcessingIndex(null);
    }
  };

  const handleSkipPlace = async (item: JourneyItem) => {
    if (user && activeTrip) {
      const idx = item.originalIndex;
      setProcessingIndex(idx);
      await toggleSkipped(activeTrip.id, idx);
      refreshLocation(true);
      setProcessingIndex(null);
    }
  };

  const handleConcludeJourney = () => {
    setShowConcludeAlert(true);
  };

  const handleConfirmConclude = async () => {
    setShowConcludeAlert(false);
    if (!activeTrip) return;
    setConcluding(true);
    await finalizeTrip(activeTrip.id);
    setConcluding(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.BACKGROUND, paddingTop: insets.top }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={[styles.loadingTitle, { color: colors.TEXT }]}>Curating Your Journey</Text>
          <Text style={[styles.loadingSubtitle, { color: colors.MUTED_TEXT }]}>
            Handpicking the best sights for this moment...
          </Text>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.skeletonRow, { opacity: 1 - i * 0.25 }]}>
              <View style={[styles.skeletonDot, { backgroundColor: colors.BORDER }]} />
              <View style={styles.skeletonLines}>
                <View style={[styles.skeletonLine, { width: "70%", backgroundColor: colors.BORDER }]} />
                <View style={[styles.skeletonLine, { width: "45%", backgroundColor: colors.BORDER, marginTop: 8 }]} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.BACKGROUND }}>
        <Image source={displayImage} style={styles.headerImage} contentFit="cover" transition={500} />

        <LocationStatus
          effectiveLocation={effectiveLocation}
          isFinished={isFinished}
          isDark={isDark}
          onRefresh={() => refreshLocation(true)}
        />

        <View style={[styles.scrollContentContainer, { backgroundColor: colors.BACKGROUND }]}>
          <View style={styles.mainHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerTitleTextBlock}>
                <Text style={[styles.tripNameText, { color: colors.PRIMARY }, isFinished && { color: colors.MUTED_TEXT }]}>
                  {activeTrip?.tripPlan?.tripName}
                </Text>
              </View>

              {isFinished ? (
                <View style={[styles.archivedBadge, { backgroundColor: isDark ? "#1A1A1A" : "#F1F5F9", borderColor: colors.BORDER }]}>
                  <Text style={[styles.archivedBadgeText, { color: colors.MUTED_TEXT }]}>ARCHIVED</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.concludeBtn,
                    {
                      backgroundColor: isDark
                        ? "rgba(212,175,55,0.12)"
                        : "rgba(212,175,55,0.10)",
                      borderColor: isDark
                        ? "rgba(212,175,55,0.35)"
                        : "rgba(212,175,55,0.4)",
                    },
                  ]}
                  onPress={handleConcludeJourney}
                  disabled={concluding}
                  accessibilityLabel="Conclude Journey"
                >
                  <Ionicons
                    name={concluding ? "hourglass-outline" : "flag-outline"}
                    size={13}
                    color="#D4AF37"
                  />
                  <Text style={styles.concludeBtnText}>
                    {concluding ? "Saving…" : "Conclude"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.pathLabelRow}>
            <Text style={[styles.sectionLabel, { color: colors.MUTED_TEXT }]}>PLANNED ROUTE</Text>
            <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />
          </View>

          {sections.active.length > 0 ? (
            <>
              {sections.active.map((item, index) => {
                const vs = visibilityMap[index];
                if (vs === 'locked') return null;
                return (
                  <PlannerItem
                    key={`active-${item.originalIndex}`}
                    item={item}
                    index={index}
                    isFinished={isFinished}
                    isDark={isDark}
                    colors={colors}
                    sections={sections}
                    processingIndex={processingIndex}
                    visibilityState={vs}
                    onMarkAsDone={handleMarkAsDone}
                    onSkip={handleSkipPlace}
                    onOpenNavigation={openNavigation}
                    onFindFood={findNearbyFood}
                  />
                );
              })}

              {lockedCount > 0 && (
                <LockedSight
                  count={lockedCount}
                  isDark={isDark}
                  colors={colors}
                />
              )}
            </>
          ) : (
            <View style={styles.emptyView}>
              <Ionicons name="checkmark-done-circle" size={40} color="#10B981" />
              <Text style={styles.emptyText}>All tasks completed for now!</Text>
            </View>
          )}

          {sections.completed.length > 0 && (
            <>
              <View style={[styles.pathLabelRow, { marginTop: 40 }]}>
                <Text style={[styles.sectionLabel, { color: colors.MUTED_TEXT }]}>COMPLETED SIGHTS</Text>
                <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />
              </View>
              {sections.completed.map((item, index) => (
                <PlannerItem
                  key={`completed-${item.originalIndex}`}
                  item={item}
                  index={index}
                  isCompleted
                  isFinished={isFinished}
                  isDark={isDark}
                  colors={colors}
                  sections={sections}
                  processingIndex={processingIndex}
                  onMarkAsDone={handleMarkAsDone}
                  onOpenNavigation={openNavigation}
                  onFindFood={findNearbyFood}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>

      <SafarAlert
        visible={showLocationAlert}
        title={isLocationBlocked ? "Location Access Blocked" : "Enable Location"}
        message={
          isLocationBlocked
            ? "You've disabled location access. Please enable it in your device settings to see distance to sights and use navigation."
            : "Safar needs your location to calculate real-time distances to sights and provide navigation for your trip."
        }
        type={isLocationBlocked ? "error" : "confirm"}
        confirmText={isLocationBlocked ? "Open Settings" : "Enable GPS"}
        onConfirm={() => {
          setShowLocationAlert(false);
          if (isLocationBlocked) {
            Linking.openSettings();
          } else {
            refreshLocation(true);
          }
        }}
        onCancel={() => setShowLocationAlert(false)}
      />

      <SafarAlert
        visible={showConcludeAlert}
        title="Conclude Journey"
        message="This will lock your itinerary and archive your progress. Unvisited sights will be removed from view. This cannot be undone."
        type="confirm"
        confirmText="Conclude"
        cancelText="Not Yet"
        onConfirm={handleConfirmConclude}
        onCancel={() => setShowConcludeAlert(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  loadingContainer: {
    justifyContent: "center",
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 0,
  },
  loadingTitle: {
    fontFamily: "playfairBold",
    fontSize: 24,
    marginTop: 20,
    marginBottom: 6,
  },
  loadingSubtitle: {
    fontFamily: "outfit",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 40,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
    gap: 14,
  },
  skeletonDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  skeletonLines: {
    flex: 1,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
  },
  headerImage: { width: "100%", height: height * 0.4 },
  scrollContentContainer: {
    paddingHorizontal: 0,
    minHeight: height,
    marginTop: -5,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 100,
  },
  mainHeader: { marginBottom: 20, paddingLeft: 16, paddingRight: 20 },
  welcomeText: {
    fontFamily: "outfit",
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  tripNameText: {
    fontFamily: "playfairBold",
    fontSize: 28,
  },
  sectionLabel: {
    fontFamily: "outfitBold",
    fontSize: 11,
    letterSpacing: 2,
    marginRight: 12,
  },
  pathLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    paddingLeft: 16,
    paddingRight: 20,
  },
  divider: { flex: 1, height: 1 },
  emptyView: { alignItems: "center", padding: 40 },
  emptyText: { fontFamily: "outfitMedium", color: "#94A3B8", marginTop: 10 },
  headerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
  },
  headerTitleTextBlock: {
    flex: 1,
    marginRight: 12,
  },
  archivedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  archivedBadgeText: {
    fontFamily: "outfitBold",
    fontSize: 10,
    letterSpacing: 1,
  },
  concludeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  concludeBtnText: {
    fontFamily: "outfitBold",
    fontSize: 11,
    color: "#D4AF37",
    letterSpacing: 0.5,
  },
});
