import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { BlurView } from "expo-blur";
import { MotiView, AnimatePresence } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRouter } from "expo-router";
import { Colors, useThemeColors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import HotelInfo from "@/src/components/trip-details/HotelInfo";
import PlannedTrip from "@/src/components/trip-details/PlannedTrip";
import RestaurantsInfo from "@/src/components/trip-details/RestaurantsInfo";
import SafarInsights from "@/src/components/trip-details/SafarInsights";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import ConcertInfo from "@/src/components/trip-details/ConcertInfo";
import AIDisclaimer from "@/src/components/common/AIDisclaimer";
import Button from "@/src/components/common/Button";
import WeatherWidget from "@/src/components/trip-details/WeatherWidget";
import DetailsSkeleton from "@/src/components/skeleton/DetailsSkeleton";
import SafarAlert from "@/src/components/ui/SafarAlert";
import { useTripDetails } from "@/src/hooks/useTripDetails";

const { width, height } = Dimensions.get("window");
const SLIDESHOW_HEIGHT = height * 0.52;

export default function TripDetails() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const colors = useThemeColors();
  const { isDark } = useTheme();
  const pageBg = isDark ? "#0D0D10" : colors.BACKGROUND;

  const [showContent, setShowContent] = useState(false);
  const minDelayFired = useRef(false);

  const {
    tripDetails,
    isAnimating,
    activeIndex,
    confirmActivateVisible,
    setConfirmActivateVisible,
    activeTripInContext,
    alertConfig,
    setAlertConfig,
    isInitializing,
    isPlanMissing,
    images,
    handleScroll,
    handleActivateTrip,
    executeActivation,
    deactivateTrip,
    toggleVisited,
  } = useTripDetails();

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      minDelayFired.current = true;
      if (!isInitializing) {
        setShowContent(true);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isInitializing && minDelayFired.current && !showContent) {
      setShowContent(true);
    }
  }, [isInitializing]);

  if (!showContent) {
    return <DetailsSkeleton />;
  }

  return (
    <>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: pageBg }}
      >
        <View style={styles.slideshowContainer}>
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
            style={[
              styles.customBackBtn,
              {
                top: insets.top + 16,
                backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(255, 255, 255, 0.8)",
              },
            ]}
          >
            <Ionicons name="chevron-back" size={24} color={colors.TEXT} />
          </TouchableOpacity>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {images.map((img, index) => (
              <Image
                key={index}
                source={img}
                style={styles.headerImage}
                contentFit="cover"
                transition={500}
              />
            ))}
          </ScrollView>

          {images.length > 1 && (
            <View style={styles.paginationDots}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    activeIndex === index ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={[styles.container, { backgroundColor: pageBg }]}>
          <View style={styles.headerBlock}>
            <View style={styles.titleRow}>
              <Text
                style={[styles.title, { color: colors.TEXT, flexShrink: 1 }]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {tripDetails?.concertData?.artist
                  ? `${tripDetails?.concertData?.artist} Concert`
                  : tripDetails?.tripPlan?.tripName || "Trip Details"}
              </Text>
              <View style={[styles.goldDot, { backgroundColor: colors.GOLD, marginBottom: 8 }]} />
            </View>

            <View style={styles.badgesRow}>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isDark
                      ? "rgba(212, 175, 55, 0.15)"
                      : "rgba(212, 175, 55, 0.08)",
                  },
                ]}
              >
                <Ionicons name="calendar-outline" size={14} color={colors.GOLD} />
                <Text style={[styles.badgeText, { color: colors.GOLD, fontFamily: "outfitBold" }]}>
                  {tripDetails.totalDays} {tripDetails.totalDays === 1 ? "Day" : "Days"}
                </Text>
              </View>

              {tripDetails?.traveler?.title && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.04)",
                    },
                  ]}
                >
                  <Ionicons name="people-outline" size={14} color={colors.MUTED_TEXT} />
                  <Text style={[styles.badgeText, { color: colors.TEXT }]}>
                    {tripDetails.traveler.title}
                  </Text>
                </View>
              )}

              {tripDetails?.isInternational !== undefined && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.04)",
                    },
                  ]}
                >
                  <Ionicons name="globe-outline" size={14} color={colors.MUTED_TEXT} />
                  <Text style={[styles.badgeText, { color: colors.TEXT }]}>
                    {tripDetails.isInternational ? "International" : "Domestic"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {tripDetails.isFinished ? (
            <View
              style={[
                styles.finishedBadge,
                {
                  backgroundColor: isDark ? "rgba(212,175,55,0.05)" : "rgba(235, 186, 73, 0.05)",
                  borderColor: isDark ? "rgba(212,175,55,0.2)" : "rgba(235, 186, 73, 0.2)",
                  borderWidth: 1,
                },
              ]}
            >
              <MaterialCommunityIcons name="trophy-outline" size={20} color={colors.GOLD} />
              <Text style={[styles.finishedText, { color: colors.GOLD }]}>JOURNEY COMPLETED</Text>
            </View>
          ) : tripDetails.isActive ? (
            <Button
              title="CONCLUDE JOURNEY"
              onPress={() => deactivateTrip(tripDetails.id)}
              style={[
                styles.activateButton,
                {
                  backgroundColor: isDark ? "rgba(248, 113, 113, 0.1)" : "rgba(239, 68, 68, 0.05)",
                  borderColor: colors.RED,
                  borderWidth: 1.5,
                  elevation: 0,
                  shadowOpacity: 0,
                },
              ]}
              textStyle={{ color: colors.RED, letterSpacing: 1.5 }}
              type="secondary"
            />
          ) : null}

          {tripDetails?.concertData && (
            <ConcertInfo concertDetails={tripDetails as any} />
          )}


          {isPlanMissing ? (
            <View style={styles.offlineCard}>
              <Ionicons name="cloud-offline-outline" size={44} color={colors.MUTED_TEXT} />
              <Text style={[styles.offlineTitle, { color: colors.TEXT }]}>
                Itinerary Offline
              </Text>
              <Text style={[styles.offlineText, { color: colors.MUTED_TEXT }]}>
                Detailed itineraries for completed or draft journeys are stored online to optimize device storage.
              </Text>
              <Text style={[styles.offlineSubtext, { color: colors.GOLD }]}>
                Please connect to the internet to load this trip.
              </Text>
            </View>
          ) : (
            <>
              <SafarInsights
                bestTransport={tripDetails?.tripPlan?.bestTransport}
                weatherInsight={(tripDetails?.concertData || tripDetails?.isFinished) ? undefined : tripDetails?.tripPlan?.weatherInsight}
              />

              {(!tripDetails?.concertData && !tripDetails?.isFinished) && (
                <WeatherWidget cityName={tripDetails?.tripPlan?.tripName || ""} />
              )}

              <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />

              <HotelInfo
                cityName={tripDetails?.tripPlan?.tripName || ""}
                hotelData={tripDetails?.tripPlan?.hotelOptions}
                isLoading={isInitializing}
              />

              <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />

              <PlannedTrip
                itineraryDetails={tripDetails?.tripPlan?.dailyItinerary}
                cityName={tripDetails?.tripPlan?.tripName || ""}
                isActive={!!tripDetails?.isActive}
                isFinished={!!tripDetails?.isFinished}
                visitedIndices={tripDetails.visitedIndices}
                skippedIndices={tripDetails.skipped_indices}
                onToggleVisited={(idx) => toggleVisited(tripDetails.id, idx)}
                onActivate={handleActivateTrip}
                onNavigateToActive={() =>
                  router.push({
                    pathname: "/activeTrips" as any,
                    params: { tripId: tripDetails.id },
                  })
                }
              />

              <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />

              <RestaurantsInfo
                restaurantsInfo={{ ...tripDetails?.tripPlan?.recommendations } as any}
                cityName={tripDetails?.tripPlan?.tripName || ""}
              />

              <AIDisclaimer />
            </>
          )}
        </View>
      </ScrollView>

      <AnimatePresence>
        {isAnimating && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={StyleSheet.absoluteFill}
          >
            <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={styles.animationOverlay}>
              <View style={styles.animCenterContent}>
                <View style={styles.compassContainer}>

                  <MotiView
                    from={{ scale: 0.7, opacity: 0.8 }}
                    animate={{ scale: 1.4, opacity: 0 }}
                    transition={{
                      type: "timing",
                      duration: 2000,
                      loop: true,
                      repeatReverse: false,
                    }}
                    style={[StyleSheet.absoluteFillObject, styles.pulseRing, { borderColor: colors.GOLD }]}
                  />
                  <MotiView
                    from={{ scale: 0.7, opacity: 0.8 }}
                    animate={{ scale: 1.4, opacity: 0 }}
                    transition={{
                      type: "timing",
                      duration: 2000,
                      delay: 1000,
                      loop: true,
                      repeatReverse: false,
                    }}
                    style={[StyleSheet.absoluteFillObject, styles.pulseRing, { borderColor: colors.GOLD }]}
                  />

                  <MotiView
                    from={{ rotate: "0deg" }}
                    animate={{ rotate: "360deg" }}
                    transition={{
                      type: "timing",
                      duration: 4000,
                      loop: true,
                      repeatReverse: false,
                    }}
                  >
                    <Ionicons name="compass-outline" size={72} color={colors.GOLD} />
                  </MotiView>
                </View>

                <View style={styles.statusContainer}>
                  <MotiView
                    key="animating-text"
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 500 }}
                  >
                    <Text style={[styles.activatingText, { color: colors.TEXT }]}>
                      Configuring Safar Intel...
                    </Text>
                  </MotiView>
                </View>
              </View>
            </BlurView>
          </MotiView>
        )}
      </AnimatePresence>

      <SafarAlert
        visible={confirmActivateVisible}
        title="Activate New Journey?"
        message={`Activating this itinerary will conclude your current session in ${activeTripInContext?.tripPlan?.tripName || "another location"
          }. Do you wish to proceed?`}
        type="confirm"
        confirmText="CONTINUE"
        cancelText="KEEP CURRENT"
        onConfirm={executeActivation}
        onCancel={() => setConfirmActivateVisible(false)}
      />

      <SafarAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })}
        onCancel={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </>
  );
}

const styles = StyleSheet.create({
  slideshowContainer: {
    height: SLIDESHOW_HEIGHT,
    backgroundColor: "#000",
    position: "relative",
  },
  customBackBtn: {
    position: "absolute",
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  headerImage: { width: width, height: SLIDESHOW_HEIGHT },
  paginationDots: {
    position: "absolute",
    bottom: 45,
    flexDirection: "row",
    alignSelf: "center",
    zIndex: 10,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  activeDot: { width: 8, backgroundColor: "#FFF" },
  inactiveDot: { width: 8, backgroundColor: "rgba(255, 255, 255, 0.5)" },
  container: {
    paddingHorizontal: 12,
    paddingVertical: width * 0.05,
    minHeight: height,
    marginTop: -35,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingBottom: 100,
  },
  headerBlock: { marginBottom: 24 },
  premiumTagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  premiumTagText: {
    fontFamily: "outfitBold",
    fontSize: 11,
    letterSpacing: 1.5,
  },
  tagLine: {
    height: 1,
    flex: 1,
    opacity: 0.3,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  title: { fontSize: 26, fontFamily: "playfairBold", lineHeight: 32 },
  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 2,
    marginBottom: 6,
  },
  dateText: { fontFamily: "outfitMedium", fontSize: 14, marginTop: 6 },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  badgeText: {
    fontFamily: "outfitMedium",
    fontSize: 12,
  },
  activateButton: {
    padding: 15,
    borderRadius: 15,
    marginVertical: 10,
  },
  animationOverlay: {
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  activatingText: {
    fontFamily: "interBold",
    fontSize: 18,
    textAlign: "center",
  },
  animCenterContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  compassContainer: {
    width: 130,
    height: 130,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  pulseRing: {
    position: "absolute",
    borderWidth: 1.5,
    borderRadius: 90,
  },
  statusContainer: {
    marginTop: 40,
    justifyContent: "center",
  },
  divider: {
    height: 1,
    width: "95%",
    alignSelf: "center",
    marginVertical: 10,
  },
  finishedBadge: {
    paddingVertical: 15,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginVertical: 10,
  },
  finishedText: {
    fontFamily: "outfitBold",
    fontSize: 14,
    letterSpacing: 1,
  },
  offlineCard: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: "rgba(100, 116, 139, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(100, 116, 139, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  offlineTitle: {
    fontFamily: "outfitBold",
    fontSize: 18,
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  offlineText: {
    fontFamily: "inter",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 12,
  },
  offlineSubtext: {
    fontFamily: "outfitMedium",
    fontSize: 13,
    textAlign: "center",
  },
});
