import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Colors, useThemeColors } from "@/src/constants/colors";
import { useTheme } from "@/src/context/ThemeContext";
import { getDistance } from "@/src/utils/geoUtils";
import { useActiveTrip } from "@/src/context/ActiveTripContext";
import { auth } from "@/src/lib/firebase";
import { Image } from "expo-image";
import { fallbackImages } from "@/src/constants/travel-data";
import LocationPicker from "@/src/components/trip/LocationPicker";
import { PlaceItem, LocalExperience, LocationData } from "@/src/types/interfaces";
import Button from "@/src/components/common/Button";

const { width, height } = Dimensions.get("window");

interface GeoCoords {
  latitude: number;
  longitude: number;
}

interface SightItem extends PlaceItem {
  isLocation: boolean;
  isDone: boolean;
  distance: number | null;
  originalIndex: number;
}

interface ExperienceItem extends LocalExperience {
  placeName: string;
  isDone: boolean;
  isLocation: boolean;
}

interface JourneyItem extends SightItem {
  activity: ExperienceItem | null;
}

export default function DailyPlanner() {
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;
  const { activeTrip, markAsDone } = useActiveTrip();
  const colors = useThemeColors();
  const { isDark } = useTheme();

  const [userLocation, setUserLocation] = useState<GeoCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);
  const isFinished = activeTrip?.isFinished || false;

  const [manualLocation, setManualLocation] = useState<GeoCoords | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);

  const effectiveLocation = manualLocation || userLocation;

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

    const itineraryArray: PlaceItem[] = Array.isArray(dailyItinerary)
      ? dailyItinerary
      : (dailyItinerary as any)?.places || [];

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
      isDone: false, // Recommendations aren't part of the main visited_indices for now
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

  const handleLocationChange = (loc: LocationData | null) => {
    if (loc?.coordinates?.latitude && loc?.coordinates?.longitude) {
      setManualLocation({
        latitude: Number(loc.coordinates.latitude),
        longitude: Number(loc.coordinates.longitude),
      });
      setIsManualMode(false);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const refresh = async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();

          if (status !== "granted") {
            setIsManualMode(true);
            setLoading(false);
            return;
          }

          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          if (isActive) {
            setUserLocation(loc.coords);
            setLoading(false);
          }
        } catch (e) {
          console.error("Location Error:", e);
          setIsManualMode(true);
          setLoading(false);
        }
      };

      if (!manualLocation) refresh();

      return () => {
        isActive = false;
      };
    }, [manualLocation]),
  );

  const openNavigation = (placeName: string) => {
    const query = encodeURIComponent(
      `${placeName} ${activeTrip?.tripPlan?.tripName}`,
    );
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url);
  };

  const findNearbyFood = (placeName: string) => {
    const searchQuery = encodeURIComponent(
      `Best Restaurants near ${placeName} ${activeTrip?.tripPlan?.tripName || ""}`,
    );
    const url = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
    Linking.openURL(url);
  };

  const renderItem = (item: JourneyItem, index: number, isCompleted = false) => {
    const isFirst = index === 0 && !isCompleted;
    const isLast = (isCompleted && index === sections.completed.length - 1) || (!isCompleted && index === sections.active.length - 1 && sections.completed.length === 0);

    return (
      <View
        key={`journey-item-${item.originalIndex}`}
        style={[styles.itemWrapper, isCompleted && styles.completedWrapper]}
      >
        <View style={styles.timelineContainer}>
          <View
            style={[
              styles.timelineDot,
              { backgroundColor: colors.BACKGROUND, borderColor: colors.BORDER },
              isFirst && (isFinished ? styles.archivedDot : styles.activeDot),
              isCompleted && (isFinished ? styles.archivedDot : styles.doneDot),
            ]}
          >
            {isCompleted && <Feather name="check" size={10} color={isDark ? colors.BLACK : colors.WHITE} />}
          </View>
          {!isLast && (
            <View
              style={[
                styles.timelineLine,
                isCompleted
                  ? (isFinished ? { backgroundColor: colors.GRAY } : { backgroundColor: colors.GREEN })
                  : [styles.plannedLine, { borderColor: isDark ? "rgba(255,255,255,0.4)" : colors.BORDER }],
                isFirst && { marginTop: 4 }
              ]}
            />
          )}
        </View>

        <View style={styles.contentBody}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.placeTitle, { color: colors.TEXT }, isCompleted && styles.doneText]}>
                {item.placeName}
              </Text>
              {!isCompleted && (
                <View style={styles.metaRow}>
                  <Text style={[styles.distanceText, { color: colors.GREEN }, isFinished && { color: colors.GRAY }]}>
                    {item.distance?.toFixed(1) || "0.0"} km away from your location
                  </Text>
                  <View style={styles.timingContainer}>
                    <Text style={[styles.timingText, { color: colors.MUTED_TEXT }]}>
                      Best time to visit: {" "}
                      <Text style={[styles.timeText, { color: colors.GOLD }, isFinished && { color: colors.MUTED_TEXT }]}>
                        {item.timeSlot || "Anytime"}
                      </Text>
                    </Text>
                  </View>
                  {item.vibe && (
                    <View style={[styles.vibeBadge, { backgroundColor: isDark ? "rgba(212,175,55,0.1)" : "rgba(235, 186, 73, 0.1)" }, isFinished && { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9" }]}>
                      <Text style={[styles.vibeText, { color: colors.GOLD }, isFinished && { color: colors.MUTED_TEXT }]}>{item.vibe.toUpperCase()}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
            {isFirst && !isFinished && (
              <View style={[styles.nowBadge, { backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "#F1F5F9" }]}>
                <Text style={[styles.nowText, { color: isDark ? colors.TEXT : "#475569" }]}>NEXT UP</Text>
              </View>
            )}
          </View>

          {isCompleted && !isFinished && (
            <View style={[styles.actionContainer, { marginTop: 5 }]}>
              <Button
                title="Undo Visit"
                onPress={async () => {
                  if (user && activeTrip) {
                    setProcessingIndex(item.originalIndex);
                    await markAsDone(item.placeName, user.uid, activeTrip.id, item.originalIndex);
                    setProcessingIndex(null);
                  }
                }}
                loading={processingIndex === item.originalIndex}
                icon="refresh-outline"
                size="small"
                type="secondary"
                style={{ alignSelf: "flex-start" }}
              />
            </View>
          )}

          {(item.placeDetails || (item as any).description || (item as any).details) && (
            <Text style={[styles.descriptionText, { color: colors.TEXT }, isCompleted && { opacity: 0.7 }]}>
              {item.placeDetails || (item as any).description || (item as any).details}
            </Text>
          )}

          {!isCompleted && !isFinished && (
            <View style={styles.actionContainer}>
              <Button
                title="Mark Visited"
                onPress={async () => {
                  if (user && activeTrip) {
                    setProcessingIndex(item.originalIndex);
                    await markAsDone(item.placeName, user.uid, activeTrip.id, item.originalIndex);
                    setProcessingIndex(null);
                  }
                }}
                loading={processingIndex === item.originalIndex}
                style={{ flex: 1, paddingVertical: 12 }}
              />

              <View style={styles.iconActionPair}>
                <View style={styles.iconActionItem}>
                  <Text style={[styles.iconLabel, { color: colors.GRAY }]}>MAP</Text>
                  <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}
                    onPress={() => openNavigation(item.placeName)}
                  >
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color={isFinished ? colors.GRAY : colors.PRIMARY}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.iconActionItem}>
                  <Text style={[styles.iconLabel, { color: colors.GRAY }]}>FOOD</Text>
                  <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}
                    onPress={() => findNearbyFood(item.placeName)}
                  >
                    <Ionicons
                      name="restaurant-outline"
                      size={20}
                      color={colors.MUTED_TEXT}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading && sections.active.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.BACKGROUND }]}>
        <ActivityIndicator size="small" color={colors.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.BACKGROUND }}
      >
        <Image
          source={displayImage}
          style={styles.headerImage}
          contentFit="cover"
          transition={500}
        />

        {isManualMode ? (
          <View style={[styles.pickerContainer, { backgroundColor: colors.SURFACE }]}>
            <LocationPicker
              placeholder="Current Location"
              onLocationChange={handleLocationChange}
            />
            <TouchableOpacity
              onPress={() => setIsManualMode(false)}
              style={styles.cancelLink}
            >
              <Text style={[styles.cancelLinkText, { color: colors.RED }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.locationStatus, { backgroundColor: colors.SURFACE }, isFinished && styles.archivedLocationBar]}
            onPress={() => !isFinished && setIsManualMode(true)}
            disabled={isFinished}
          >
            <Ionicons name="navigate" size={16} color={isFinished ? colors.GRAY : colors.PRIMARY} />
            <Text style={[styles.locationStatusText, { color: colors.MUTED_TEXT }]}>
              {isFinished ? "Journey History: Offline Mode" : (manualLocation ? "Manual Location Active" : "Using Live GPS")} •{" "}
              {isFinished ? "Coordinates Finalized" : (effectiveLocation ? "Distances Updated" : "Searching...")}
            </Text>
            {!isFinished && <Text style={[styles.editText, { color: colors.PRIMARY }]}>Change</Text>}
          </TouchableOpacity>
        )}

        <View style={[styles.scrollContentContainer, { backgroundColor: colors.BACKGROUND }]}>
          <View style={styles.mainHeader}>
            <View style={styles.headerTitleRow}>
              <View>
                <Text style={[styles.welcomeText, { color: colors.MUTED_TEXT }]}>Daily Itinerary</Text>
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
            sections.active.map((item, index) => renderItem(item, index))
          ) : (
            <View style={styles.emptyView}>
              <Ionicons
                name="checkmark-done-circle"
                size={40}
                color="#10B981"
              />
              <Text style={styles.emptyText}>All tasks completed for now!</Text>
            </View>
          )}

          {sections.completed.length > 0 && (
            <>
              <View style={[styles.pathLabelRow, { marginTop: 40 }]}>
                <Text style={[styles.sectionLabel, { color: colors.MUTED_TEXT }]}>COMPLETED SIGHTS</Text>
                <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />
              </View>
              {sections.completed.map((item, index) =>
                renderItem(item, index, true),
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerImage: { width: "100%", height: height * 0.4 },
  scrollContentContainer: {
    paddingHorizontal: 0,
    backgroundColor: "transparent", // Will be overridden
    minHeight: height,
    marginTop: -5,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 100,
  },
  locationStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 10,
    gap: 8,
    zIndex: 5,
  },
  locationStatusText: {
    flex: 1,
    fontFamily: "outfit",
    fontSize: 12,
  },
  editText: { fontFamily: "outfitBold", fontSize: 12 },
  pickerContainer: {
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 20,
    marginTop: -25,
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    zIndex: 100,
  },
  cancelLink: { marginTop: 10, alignSelf: "center" },
  cancelLinkText: { fontFamily: "outfit", color: "#EF4444", fontSize: 12 },
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
    color: Colors.PRIMARY,
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
  itemWrapper: { flexDirection: "row" },
  completedWrapper: { opacity: 0.5 },
  timelineContainer: { width: 32, alignItems: "center" },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#CBD5E1",
    zIndex: 2,
    marginTop: 8,
  },
  activeDot: {
    backgroundColor: Colors.PRIMARY,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: "white",
    marginTop: 5,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  doneDot: {
    backgroundColor: Colors.GREEN,
    borderColor: Colors.GREEN,
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 7,
  },
  archivedDot: {
    backgroundColor: "#CBD5E1",
    borderColor: "#CBD5E1",
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 7,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    position: "absolute",
    top: 24,
    bottom: -6,
    left: "50%",
    marginLeft: -1,
  },
  plannedLine: {
    backgroundColor: "transparent",
    borderStyle: "dashed",
    borderWidth: 1,
    borderRadius: 1,
  },
  doneLine: { width: 2 },
  archivedLine: { width: 2 },
  contentBody: { flex: 1, paddingBottom: 40, marginLeft: 10, paddingRight: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  placeTitle: { fontFamily: "playfairBold", fontSize: 20 },
  doneText: { textDecorationLine: "line-through" },
  distanceText: {
    fontFamily: "outfitMedium",
    fontSize: 12,
    color: Colors.GREEN,
  },
  timingContainer: { marginTop: 4 },
  timingText: {
    fontFamily: "outfitMedium",
    fontSize: 12,
  },
  timeText: {
    fontFamily: "outfitBold",
    fontSize: 12,
    color: Colors.PRIMARY,
  },
  metaRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 8,
    gap: 8,
  },
  vibeBadge: {
    backgroundColor: "rgba(235, 186, 73, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  vibeText: {
    fontFamily: "outfitBold",
    fontSize: 9,
    color: Colors.SECONDARY,
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontFamily: "outfit",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  actionContainer: {
    flexDirection: "row",
    marginTop: 15,
    gap: 12,
    alignItems: "flex-end",
  },
  iconActionPair: {
    flexDirection: "row",
    gap: 12,
  },
  iconActionItem: {
    alignItems: "center",
    gap: 6,
  },
  iconLabel: {
    fontFamily: "outfitBold",
    fontSize: 8,
    letterSpacing: 0.5,
  },
  mainActionBtn: {
    flex: 1,
    height: 48,
    backgroundColor: "#000000", // Will be overridden
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  mainActionText: { color: "#ffffff", fontFamily: "outfitBold", fontSize: 13 },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  nowBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  nowText: { fontFamily: "outfitBold", fontSize: 9 },
  emptyView: { alignItems: "center", padding: 40 },
  emptyText: { fontFamily: "outfitMedium", color: "#94A3B8", marginTop: 10 },
  undoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.BORDER,
    alignSelf: "flex-start",
  },
  undoBtnText: {
    fontFamily: "outfitBold",
    fontSize: 12,
    color: Colors.PRIMARY,
  },
  archivedLocationBar: {
    backgroundColor: "#F8FAFC",
    borderColor: "#F1F5F9",
    borderWidth: 1,
  },
  headerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  archivedBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  archivedBadgeText: {
    fontFamily: "outfitBold",
    fontSize: 10,
    color: "#94A3B8",
    letterSpacing: 1,
  },
});
