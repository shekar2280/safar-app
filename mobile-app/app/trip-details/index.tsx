import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  StatusBar,
} from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BlurView } from "expo-blur";
import { MotiView, AnimatePresence } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Colors, useThemeColors } from "@/src/constants/colors";
import { useTheme } from "@/src/context/ThemeContext";
import dayjs from "dayjs";
import HotelInfo from "@/src/components/trip-details/HotelInfo";
import PlannedTrip from "@/src/components/trip-details/PlannedTrip";
import RestaurantsInfo from "@/src/components/trip-details/RestaurantsInfo";
import TransportInfo from "@/src/components/trip-details/TransportInfo";
import { auth } from "@/src/lib/firebase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { fallbackImages } from "@/src/constants";
import { Image } from "expo-image";
import ConcertInfo from "@/src/components/trip-details/ConcertInfo";
import AIDisclaimer from "@/src/components/common/AIDisclaimer";
import Button from "@/src/components/common/Button";
import WeatherWidget from "@/src/components/trip-details/WeatherWidget";
import { UserTrip } from "@/src/types";
import { apiGet, apiPatch } from "@/src/lib/api";
import { useUser } from "@/src/context/UserContext";
import { useTrips } from "@/src/hooks/queries/useTrips";
import { useStaticItinerary } from "@/src/hooks/queries/useStaticItinerary";
import { useQueryClient } from "@tanstack/react-query";
import { tripQueryKeys } from "@/src/hooks/queries/useTrips";
import SafarAlert from "@/src/components/ui/SafarAlert";
import DetailsSkeleton from "@/src/components/skeleton/DetailsSkeleton";

const { width, height } = Dimensions.get("window");
const SLIDESHOW_HEIGHT = height * 0.52;

export default function TripDetails() {
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;
  const router = useRouter();
  const navigation = useNavigation();
  const { userProfile } = useUser();
  const { data: userTrips = [] } = useTrips();
  const { trip, imageUrl } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const colors = useThemeColors();
  const { isDark } = useTheme();

  const parsedTrip = useMemo(() => {
    try {
      return typeof trip === "string" ? JSON.parse(trip) : trip;
    } catch (e) {
      return {};
    }
  }, [trip]);

  const { data: staticData, isLoading: loadingStaticData } = useStaticItinerary(parsedTrip?.savedTripId);

  const tripDetails = useMemo(() => {
    const latestFromCache = (userTrips || []).find(t => t.id === parsedTrip?.id);
    const base = latestFromCache || parsedTrip || {};

    if (!staticData) return base;
    return {
      ...base,
      tripPlan: staticData.trip_plan,
      image_urls: (staticData.image_urls?.length > 0) ? staticData.image_urls : base.image_urls,
    };
  }, [parsedTrip, staticData, userTrips]);

  const transportData = useMemo(
    () => ({
      tripType: tripDetails?.travelerMode || "travel",
      departureIata: tripDetails?.departureIata || (tripDetails?.tripPlan as any)?.departureIata,
      destinationIata: tripDetails?.tripPlan?.destinationIata,
      bestTransport: tripDetails?.tripPlan?.bestTransport,
      weatherInsight: tripDetails?.concertData ? undefined : tripDetails?.tripPlan?.weatherInsight,
    }),
    [tripDetails]
  );

  const [isAnimating, setIsAnimating] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView>(null);

  const [confirmActivateVisible, setConfirmActivateVisible] = useState(false);
  const [activeTripInContext, setActiveTripInContext] = useState<UserTrip | null>(null);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "info" | "error" | "confirm";
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    const current = (userTrips || []).find(t => t.isActive);
    setActiveTripInContext(current || null);
  }, [userTrips]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);


  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  const triggerHighlight = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.08, duration: 400, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1.04, duration: 400, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    setTimeout(() => {
      triggerHighlight();
    }, 800);
  };

  const handleActivateTrip = async () => {
    if (!tripDetails.id) return;

    if (activeTripInContext && activeTripInContext.id !== tripDetails.id) {
      setConfirmActivateVisible(true);
      return;
    }

    executeActivation();
  };

  const executeActivation = async () => {
    if (!tripDetails.id) return;
    setConfirmActivateVisible(false);
    try {
      setIsAnimating(true);
      await apiPatch(`/api/v1/trips/${tripDetails.id}/activate`, {});
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
      setTimeout(() => {
        setIsAnimating(false);
        router.push({
          pathname: "/activeTrips" as any,
          params: {
            tripId: tripDetails.id,
            totalDays: tripDetails.totalDays ?? 1
          },
        });
      }, 3000);
    } catch {
      setIsAnimating(false);
      setAlertConfig({
        visible: true,
        title: "Activation Failed",
        message: "We encountered an error while initializing your journey. Please ensure you have a stable connection and try once more.",
        type: "error",
      });
    }
  };

  const handleEndJourney = async () => {
    if (!tripDetails.id) return;
    try {
      await apiPatch(`/api/v1/trips/${tripDetails.id}/deactivate`, {});
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
    } catch {
      setAlertConfig({
        visible: true,
        title: "Update Failed",
        message: "We couldn't finalize your session changes. Please check your connection and retry.",
        type: "error",
      });
    }
  };

  const handleToggleVisited = async (index: number) => {
    if (!tripDetails.id) return;

    const currentVisited = tripDetails.visitedIndices || [];
    const newVisited = currentVisited.includes(index)
      ? currentVisited.filter((i: number) => i !== index)
      : [...currentVisited, index];

    try {
      await apiPatch(`/api/v1/trips/${tripDetails.id}/visited-indices`, {
        visited_indices: newVisited,
      });

      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
    } catch {
      setAlertConfig({
        visible: true,
        title: "Sync Failed",
        message: "We were unable to secure your progress. Please check your connection to ensure your itinerary is up to date.",
        type: "error",
      });
    }
  };

  const randomFallback = useMemo(
    () => fallbackImages[Math.floor(Math.random() * fallbackImages.length)],
    [tripDetails?.id]
  );

  const images = useMemo(() => {
    const personalImages = tripDetails?.concertData?.image_urls;
    if (personalImages && Array.isArray(personalImages) && personalImages.length > 0) {
      return personalImages.map((img: string) => ({ uri: img }));
    }

    const legacyImg = (tripDetails as any)?.imageUrl;
    if (Array.isArray(legacyImg) && legacyImg.length > 0) return legacyImg.map((img: string) => ({ uri: img }));
    if (typeof legacyImg === "string" && legacyImg.trim().length > 0) return [{ uri: legacyImg }];

    const aiImages = tripDetails?.tripPlan?.imageUrl || (tripDetails as any)?.savedTrip?.image_urls;
    if (Array.isArray(aiImages) && aiImages.length > 0) {
      return aiImages.map((img: string) => ({ uri: img }));
    }

    if (imageUrl) return [{ uri: imageUrl as string }];

    return [{ uri: randomFallback }];
  }, [tripDetails, imageUrl, randomFallback]);

  if (loadingStaticData) {
    return <DetailsSkeleton />;
  }

  return (
    <>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.BACKGROUND }}
      >
        <View style={styles.slideshowContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.customBackBtn, { top: insets.top + 16, backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(255, 255, 255, 0.8)" }]}
          >
            <Ionicons name="chevron-back" size={24} color={colors.TEXT} />
          </TouchableOpacity>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={32}
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

        <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
          <View style={styles.headerBlock}>
            <View style={styles.titleRow}>
              <Text
                style={[styles.title, { color: colors.TEXT, flexShrink: 1 }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {tripDetails?.concertData?.artist
                  ? `${tripDetails?.concertData?.artist} Concert`
                  : tripDetails?.tripPlan?.tripName || "Trip Details"}
              </Text>
              <View style={[styles.goldDot, { backgroundColor: colors.GOLD }]} />
            </View>
            <Text style={[styles.dateText, { color: colors.MUTED_TEXT }]}>
              {tripDetails.totalDays} {tripDetails.totalDays === 1 ? "DAY" : "DAYS"} CURATED JOURNEY
            </Text>
          </View>

          {tripDetails.isFinished ? (
            <View style={[styles.finishedBadge, { backgroundColor: isDark ? "rgba(212,175,55,0.05)" : "rgba(235, 186, 73, 0.05)", borderColor: isDark ? "rgba(212,175,55,0.2)" : "rgba(235, 186, 73, 0.2)", borderWidth: 1 }]}>
              <MaterialCommunityIcons name="trophy-outline" size={20} color={colors.GOLD} />
              <Text style={[styles.finishedText, { color: colors.GOLD }]}>JOURNEY COMPLETED</Text>
            </View>
          ) : tripDetails.isActive ? (
            <Button
              title="CONCLUDE JOURNEY"
              onPress={handleEndJourney}
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

          {!tripDetails?.concertData && (
            <WeatherWidget cityName={tripDetails?.tripPlan?.tripName || ""} />
          )}

          <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />

          <TransportInfo transportData={transportData as any} />

          <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />

          <HotelInfo
            cityName={tripDetails?.tripPlan?.tripName || ""}
            hotelData={tripDetails?.tripPlan?.hotelOptions}
          />

          <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />

          <PlannedTrip
            itineraryDetails={tripDetails?.tripPlan?.dailyItinerary}
            cityName={tripDetails?.tripPlan?.tripName || ""}
            isActive={!!tripDetails?.isActive}
            isFinished={!!tripDetails?.isFinished}
            visitedIndices={tripDetails.visitedIndices}
            skippedIndices={tripDetails.skipped_indices}
            onToggleVisited={handleToggleVisited}
            onActivate={handleActivateTrip}
            onNavigateToActive={() => router.push({
              pathname: "/activeTrips" as any,
              params: { tripId: tripDetails.id },
            })}
          />

          <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />

          <RestaurantsInfo
            restaurantsInfo={{ ...tripDetails?.tripPlan?.recommendations } as any}
            cityName={tripDetails?.tripPlan?.tripName || ""}
          />

          <AIDisclaimer />
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
                <MotiView
                  from={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  style={[styles.pulsingHex, { borderColor: colors.GOLD }]}
                >
                  <MotiView
                    from={{ scale: 1 }}
                    animate={{ scale: 1.2 }}
                    transition={{
                      type: "timing",
                      duration: 1000,
                      loop: true,
                      repeatReverse: true,
                    }}
                  >
                    <Ionicons name="sparkles" size={60} color={colors.GOLD} />
                  </MotiView>
                </MotiView>

                <MotiView
                  from={{ translateX: -width }}
                  animate={{ translateX: width }}
                  transition={{
                    type: "timing",
                    duration: 1500,
                    loop: true,
                  }}
                  style={[styles.scannerLine, { backgroundColor: colors.GOLD }]}
                />

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
        message={`Activating this itinerary will conclude your current session in ${activeTripInContext?.tripPlan?.tripName || "another location"}. Do you wish to proceed?`}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
  headerBlock: { marginBottom: 20, paddingHorizontal: 0 },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  title: { fontSize: 32, fontFamily: "playfairBold", lineHeight: 40 },
  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 2,
    marginBottom: 6,
  },
  dateText: { fontFamily: "outfitMedium", fontSize: 14, marginTop: 6 },
  activateButton: {
    padding: 15,
    borderRadius: 15,
    marginVertical: 10,
    elevation: 5,
  },
  activateButtonText: {
    textAlign: "center",
    fontFamily: "interBold",
    fontSize: 16,
  },
  animationOverlay: {
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  activatingText: {
    marginTop: 20,
    fontFamily: "interBold",
    fontSize: 18,
    textAlign: "center",
  },
  animCenterContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  pulsingHex: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  scannerLine: {
    height: 2,
    width: width * 0.8,
    marginTop: 40,
    opacity: 0.5,
    borderRadius: 1,
  },
  statusContainer: {
    marginTop: 40,
    height: 30,
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
});
