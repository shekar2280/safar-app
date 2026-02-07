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
} from "react-native";
import { useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { getDistance } from "../../utils/geoUtlis";
import { useActiveTrip } from "../../context/ActiveTripContext";
import { auth } from "../../config/FirebaseConfig";
import { Image } from "expo-image";
import { fallbackImages } from "../../constants/Options";
import LocationPicker from "../../components/CreateTrip/LocationPicker";

const { width, height } = Dimensions.get("window");

export default function DailyPlanner() {
  const user = auth.currentUser;
  const { activeTrip, markAsDone } = useActiveTrip();

  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const [manualLocation, setManualLocation] = useState(null);
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
    if (!activeTrip?.tripPlan) return { active: [], completed: [] };

    const { dailyItinerary, recommendations = {} } = activeTrip.tripPlan;
    const completedIds = activeTrip.completedPlaceIds || [];

    const itineraryArray = Array.isArray(dailyItinerary)
      ? dailyItinerary
      : dailyItinerary?.places || [];

    const allSights = itineraryArray.map((p) => ({
      ...p,
      isLocation: true,
      isDone: completedIds.includes(p.placeName),
      distance: effectiveLocation
        ? getDistance(
            effectiveLocation.latitude,
            effectiveLocation.longitude,
            p.geoCoordinates.latitude,
            p.geoCoordinates.longitude,
          )
        : null,
    }));

    const allExps = (recommendations?.localExperiences || []).map((e) => ({
      ...e,
      placeName: e.experienceName,
      isDone: completedIds.includes(e.experienceName),
      isLocation: false,
    }));

    const sortedSights = allSights.sort(
      (a, b) => (a.distance ?? 999) - (b.distance ?? 999),
    );

    const mappedJourney = sortedSights.map((sight, index) => ({
      ...sight,
      activity: allExps[index] || null,
    }));

    return {
      active: mappedJourney.filter((item) => !item.isDone),
      completed: mappedJourney.filter((item) => item.isDone),
    };
  }, [effectiveLocation, activeTrip?.completedPlaceIds, activeTrip?.tripPlan]);

  const handleLocationChange = (loc) => {
    if (loc?.coordinates) {
      setManualLocation({
        latitude: loc.coordinates.lat,
        longitude: loc.coordinates.lon,
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

  const openNavigation = (placeName, coords) => {
    const query = encodeURIComponent(
      `${placeName} ${activeTrip?.tripPlan?.tripName}`,
    );
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url);
  };

  const findNearbyFood = (placeName) => {
    const searchQuery = encodeURIComponent(
      `Best Restaurants near ${placeName} ${activeTrip?.tripPlan?.tripName || ""}`,
    );
    const url = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
    Linking.openURL(url);
  };

  const renderItem = (item, index, isCompleted = false) => {
    const isFirst = index === 0 && !isCompleted;

    return (
      <View
        key={item.placeName}
        style={[styles.itemWrapper, isCompleted && styles.completedWrapper]}
      >
        <View style={styles.timelineContainer}>
          <View
            style={[
              styles.timelineDot,
              isFirst && styles.activeDot,
              isCompleted && styles.doneDot,
            ]}
          >
            {isCompleted && <Feather name="check" size={10} color="white" />}
          </View>
          <View style={[styles.timelineLine, isCompleted && styles.doneLine]} />
        </View>

        <View style={styles.contentBody}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.placeTitle, isCompleted && styles.doneText]}>
                {item.placeName}
              </Text>
              {!isCompleted && (
                <Text style={styles.distanceText}>
                  {item.distance?.toFixed(1) || "0.0"} km •{" "}
                  {item.timeSlot || "Anytime"}
                </Text>
              )}
            </View>
            {isFirst && (
              <View style={styles.nowBadge}>
                <Text style={styles.nowText}>NEXT UP</Text>
              </View>
            )}
          </View>

          {!isCompleted && (
            <>
              <Text style={styles.descriptionText} numberOfLines={3}>
                {item.placeDetails}
              </Text>
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={styles.mainActionBtn}
                  onPress={() =>
                    markAsDone(item.placeName, user.uid, activeTrip.id)
                  }
                >
                  <Text style={styles.mainActionText}>Mark Visited</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() =>
                    openNavigation(item.placeName, item.geoCoordinates)
                  }
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={Colors.PRIMARY}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => findNearbyFood(item.placeName)}
                >
                  <Ionicons
                    name="restaurant-outline"
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  if (loading && sections.active.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: "#FFF" }}
      >
        <Image
          source={displayImage}
          style={styles.headerImage}
          contentFit="cover"
          transition={500}
        />

        {isManualMode ? (
          <View style={styles.pickerContainer}>
            <LocationPicker
              title="Current Location"
              onLocationChange={handleLocationChange}
            />
            <TouchableOpacity
              onPress={() => setIsManualMode(false)}
              style={styles.cancelLink}
            >
              <Text style={styles.cancelLinkText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.locationStatus}
            onPress={() => setIsManualMode(true)}
          >
            <Ionicons name="navigate" size={16} color={Colors.PRIMARY} />
            <Text style={styles.locationStatusText} numberOfLines={1}>
              {manualLocation ? "Manual Location Active" : "Using Live GPS"} •{" "}
              {effectiveLocation ? "Distances Updated" : "Searching..."}
            </Text>
            <Text style={styles.editText}>Change</Text>
          </TouchableOpacity>
        )}

        <View style={styles.scrollContentContainer}>
          <View style={styles.mainHeader}>
            <Text style={styles.welcomeText}>Daily Itinerary</Text>
            <Text style={styles.tripNameText}>
              {activeTrip?.tripPlan?.tripName}
            </Text>
          </View>

          <View style={styles.pathLabelRow}>
            <Text style={styles.sectionLabel}>PLANNED ROUTE</Text>
            <View style={styles.divider} />
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
                <Text style={styles.sectionLabel}>ARCHIVED</Text>
                <View style={styles.divider} />
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
    padding: width * 0.05,
    backgroundColor: "#FFF",
    minHeight: height,
    marginTop: -15,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 100,
  },
  locationStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
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
    color: "#475569",
  },
  editText: { fontFamily: "outfitBold", fontSize: 12, color: Colors.PRIMARY },
  pickerContainer: {
    padding: 15,
    backgroundColor: "#FFFFFF",
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
  mainHeader: { marginBottom: 20 },
  welcomeText: {
    fontFamily: "outfit",
    fontSize: 12,
    color: "#94A3B8",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  tripNameText: {
    fontFamily: "outfitBold",
    fontSize: 26,
    color: "#0F172A",
    marginTop: 4,
  },
  sectionLabel: {
    fontFamily: "outfitBold",
    fontSize: 11,
    color: "#94A3B8",
    letterSpacing: 2,
    marginRight: 12,
  },
  pathLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  divider: { flex: 1, height: 1, backgroundColor: "#F1F5F9" },
  itemWrapper: { flexDirection: "row" },
  completedWrapper: { opacity: 0.5 },
  timelineContainer: { width: 35, alignItems: "center" },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E2E8F0",
    zIndex: 2,
    marginTop: 6,
  },
  activeDot: {
    backgroundColor: "#0F172A",
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: "#F1F5F9",
  },
  doneDot: {
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  timelineLine: {
    width: 1,
    flex: 1,
    backgroundColor: "#F1F5F9",
    position: "absolute",
    top: 20,
    bottom: 0,
  },
  doneLine: { backgroundColor: "#D1FAE5" },
  contentBody: { flex: 1, paddingBottom: 40, marginLeft: 10 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  placeTitle: { fontFamily: "outfitBold", fontSize: 18, color: "#1E293B" },
  doneText: { textDecorationLine: "line-through", color: "#94A3B8" },
  distanceText: {
    fontFamily: "outfitMedium",
    fontSize: 13,
    color: Colors.PRIMARY,
    marginTop: 4,
  },
  descriptionText: {
    fontFamily: "outfit",
    fontSize: 14,
    color: "#64748B",
    lineHeight: 22,
    marginTop: 10,
  },
  actionContainer: { flexDirection: "row", marginTop: 15, gap: 10 },
  mainActionBtn: {
    flex: 1,
    height: 45,
    backgroundColor: "#0F172A",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  mainActionText: { color: "#ffffff", fontFamily: "outfitBold", fontSize: 13 },
  iconBtn: {
    width: 45,
    height: 45,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  nowBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  nowText: { fontFamily: "outfitBold", fontSize: 9, color: "#475569" },
  emptyView: { alignItems: "center", padding: 40 },
  emptyText: { fontFamily: "outfitMedium", color: "#94A3B8", marginTop: 10 },
});
