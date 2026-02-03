import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { getDistance } from "../../utils/geoUtlis";
import { useActiveTrip } from "../../context/ActiveTripContext";
import { auth } from "../../config/FirebaseConfig";

export default function DailyPlanner() {
  const router = useRouter();
  const user = auth.currentUser;
  const { activeTrip, markAsDone } = useActiveTrip();

  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

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
      distance: userLocation
        ? getDistance(
            userLocation.latitude,
            userLocation.longitude,
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
  }, [userLocation, activeTrip?.completedPlaceIds, activeTrip?.tripPlan]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const refresh = async () => {
        try {
          if (sections.active.length > 0 || sections.completed.length > 0)
            setLoading(false);

          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") return;

          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          if (isActive) {
            setUserLocation(loc.coords);
            setLoading(false);
          }
        } catch (e) {
          console.error("Location Error:", e);
          setLoading(false);
        }
      };
      refresh();
      return () => {
        isActive = false;
      };
    }, [sections]),
  );

  const openNavigation = (placeName, coords) => {
    const query = encodeURIComponent(
      `${placeName} ${activeTrip?.tripPlan?.tripName}`,
    );
    const lat = coords?.latitude;
    const lng = coords?.longitude;

    const url = `https://www.google.com/maps/search/?api=1&query=${query}${
      lat ? `&center=${lat},${lng}` : ""
    }`;

    Linking.openURL(url);
  };

  const findNearbyFood = (placeName) => {
    const query = encodeURIComponent(`best restaurants near ${placeName}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
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

              {item.activity && (
                <TouchableOpacity
                  style={styles.experiencePill}
                  onPress={() =>
                    markAsDone(
                      item.activity.experienceName,
                      user.uid,
                      activeTrip.id,
                    )
                  }
                >
                  <Ionicons name="sparkles-sharp" size={14} color="#B45309" />
                  <Text style={styles.expPillText} numberOfLines={1}>
                    Try: {item.activity.experienceName}
                  </Text>
                  <Feather name="arrow-right" size={12} color="#B45309" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  if (loading && sections.active.length === 0)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
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
            <Ionicons name="checkmark-done-circle" size={40} color="#10B981" />
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { flex: 1, paddingHorizontal: 24, paddingBottom: 60 },
  mainHeader: { marginTop: 50, marginBottom: 20 },
  welcomeText: {
    fontFamily: "outfit",
    fontSize: 16,
    color: "#94A3B8",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  tripNameText: {
    fontFamily: "outfitBold",
    fontSize: 32,
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
    marginBottom: 30,
  },
  divider: { flex: 1, height: 1, backgroundColor: "#F1F5F9" },
  itemWrapper: { flexDirection: "row" },
  completedWrapper: { opacity: 0.6 },
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
  contentBody: { flex: 1, paddingBottom: 45, marginLeft: 8 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  placeTitle: { fontFamily: "outfitBold", fontSize: 20, color: "#1E293B" },
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
    marginTop: 12,
  },
  actionContainer: { flexDirection: "row", marginTop: 20, gap: 12 },
  mainActionBtn: {
    flex: 1,
    height: 48,
    backgroundColor: "#0F172A",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  mainActionText: { color: "#FFF", fontFamily: "outfitBold", fontSize: 14 },
  iconBtn: {
    width: 48,
    height: 48,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  nowBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  nowText: { fontFamily: "outfitBold", fontSize: 9, color: "#475569" },
  experiencePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    padding: 14,
    borderRadius: 18,
    marginTop: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  expPillText: {
    flex: 1,
    fontFamily: "outfitMedium",
    fontSize: 13,
    color: "#92400E",
  },
  emptyView: { alignItems: "center", padding: 40 },
  emptyText: { fontFamily: "outfitMedium", color: "#94A3B8", marginTop: 10 },
});
