import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Dimensions,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/src/constants/colors";
import { useTheme } from "@/src/context/ThemeContext";
import { getDistance } from "@/src/utils/geoUtils";
import { useActiveTrip } from "@/src/context/ActiveTripContext";
import { auth } from "@/src/lib/firebase";
import { Image } from "expo-image";
import { fallbackImages } from "@/src/constants/travel-data";
import { PlaceItem, LocalExperience, SightItem, ExperienceItem, JourneyItem } from "@/src/types/interfaces";
import SafarAlert from "@/src/components/ui/SafarAlert";
import { useLocationTracker } from "@/src/hooks/useLocationTracker";
import { LocationStatus } from "@/src/components/planner/LocationStatus";
import { PlannerItem } from "@/src/components/planner/PlannerItem";

const { height } = Dimensions.get("window");

export default function DailyPlanner() {
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;
  const { activeTrip, markAsDone } = useActiveTrip();
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

    return {
      active: mappedJourney.filter((item) => !item.isDone),
      completed: mappedJourney.filter((item) => item.isDone),
    };
  }, [effectiveLocation, activeTrip?.visitedIndices, activeTrip?.tripPlan]);

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
      setProcessingIndex(item.originalIndex);
      await markAsDone(item.placeName, user.uid, activeTrip.id, item.originalIndex);
      setProcessingIndex(null);
    }
  };

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
              <View>
                <Text style={[styles.tripNameText, { color: colors.PRIMARY }, isFinished && { color: colors.MUTED_TEXT }]}>
                  {activeTrip?.tripPlan?.tripName}
                </Text>
              </View>
              {isFinished && (
                <View style={[styles.archivedBadge, { backgroundColor: isDark ? "#1A1A1A" : "#F1F5F9", borderColor: colors.BORDER }]}>
                  <Text style={[styles.archivedBadgeText, { color: colors.MUTED_TEXT }]}>ARCHIVED</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.pathLabelRow}>
            <Text style={[styles.sectionLabel, { color: colors.MUTED_TEXT }]}>PLANNED ROUTE</Text>
            <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />
          </View>

          {sections.active.length > 0 ? (
            sections.active.map((item, index) => (
              <PlannerItem
                key={`active-${item.originalIndex}`}
                item={item}
                index={index}
                isFinished={isFinished}
                isDark={isDark}
                colors={colors}
                sections={sections}
                processingIndex={processingIndex}
                onMarkAsDone={handleMarkAsDone}
                onOpenNavigation={openNavigation}
                onFindFood={findNearbyFood}
              />
            ))
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
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
});
