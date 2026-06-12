import React from "react";
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
import { useThemeColors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { Image } from "expo-image";
import SafarAlert from "@/src/components/ui/SafarAlert";
import { LocationStatus } from "@/src/components/planner/LocationStatus";
import { PlannerItem } from "@/src/components/planner/PlannerItem";
import { LockedSight } from "@/src/components/planner/LockedSight";
import { useDayPlanner } from "@/src/hooks/useDayPlanner";

const { height } = Dimensions.get("window");

export default function DailyPlanner() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { isDark } = useTheme();

  const {
    activeTrip,
    isFinished,
    loading,
    effectiveLocation,
    displayImage,
    sections,
    visibilityMap,
    lockedCount,
    processingIndex,
    concluding,
    showConcludeAlert,
    setShowConcludeAlert,
    showLocationAlert,
    setShowLocationAlert,
    isLocationBlocked,
    refreshLocation,
    openNavigation,
    findNearbyFood,
    handleMarkAsDone,
    handleSkipPlace,
    handleConfirmConclude,
  } = useDayPlanner();

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          { backgroundColor: colors.BACKGROUND, paddingTop: insets.top },
        ]}
      >
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
                <View
                  style={[styles.skeletonLine, { width: "70%", backgroundColor: colors.BORDER }]}
                />
                <View
                  style={[
                    styles.skeletonLine,
                    { width: "45%", backgroundColor: colors.BORDER, marginTop: 8 },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.BACKGROUND, paddingTop: insets.top }]}
    >
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
                <Text
                  style={[
                    styles.tripNameText,
                    { color: colors.PRIMARY },
                    isFinished && { color: colors.MUTED_TEXT },
                  ]}
                >
                  {activeTrip?.tripPlan?.tripName}
                </Text>
              </View>

              {isFinished ? (
                <View
                  style={[
                    styles.archivedBadge,
                    { backgroundColor: isDark ? "#1A1A1A" : "#F1F5F9", borderColor: colors.BORDER },
                  ]}
                >
                  <Text style={[styles.archivedBadgeText, { color: colors.MUTED_TEXT }]}>
                    ARCHIVED
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.concludeBtn,
                    {
                      backgroundColor: isDark
                        ? "rgba(212,175,55,0.12)"
                        : "rgba(212,175,55,0.10)",
                      borderColor: isDark ? "rgba(212,175,55,0.35)" : "rgba(212,175,55,0.4)",
                    },
                  ]}
                  onPress={() => setShowConcludeAlert(true)}
                  disabled={concluding}
                  accessibilityLabel="Conclude Journey"
                >
                  <Ionicons
                    name={concluding ? "hourglass-outline" : "flag-outline"}
                    size={13}
                    color="#D4AF37"
                  />
                  <Text style={styles.concludeBtnText}>{concluding ? "Saving…" : "Conclude"}</Text>
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
                if (vs === "locked") return null;
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
                <LockedSight count={lockedCount} isDark={isDark} colors={colors} />
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
                <Text style={[styles.sectionLabel, { color: colors.MUTED_TEXT }]}>
                  COMPLETED SIGHTS
                </Text>
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
  container: { flex: 1 },
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
