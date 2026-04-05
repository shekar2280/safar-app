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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Colors } from "@/src/constants/colors";
import dayjs from "dayjs";
import HotelInfo from "@/src/components/trip-details/HotelInfo";
import PlannedTrip from "@/src/components/trip-details/PlannedTrip";
import RestaurantsInfo from "@/src/components/trip-details/RestaurantsInfo";
import TransportInfo from "@/src/components/trip-details/TransportInfo";
import { auth } from "@/src/lib/firebase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { fallbackImages } from "@/src/constants/travel-data";
import { Image } from "expo-image";
import LottieView from "lottie-react-native";
import ConcertInfo from "@/src/components/trip-details/ConcertInfo";
import AIDisclaimer from "@/src/components/common/AIDisclaimer";
import WeatherWidget from "@/src/components/trip-details/WeatherWidget";
import { UserTrip } from "@/src/types/interfaces";
import { apiGet, apiPatch } from "@/src/lib/api";
import { useUser } from "@/src/context/UserContext";
import SafarAlert from "@/src/components/ui/SafarAlert";

const { width, height } = Dimensions.get("window");
const SLIDESHOW_HEIGHT = height * 0.52;

export default function TripDetails() {
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;
  const router = useRouter();
  const navigation = useNavigation();
  const { userTrips, refreshTrips } = useUser();
  const { trip, imageUrl } = useLocalSearchParams();

  const [tripDetails, setTripDetails] = useState<Partial<UserTrip>>({});
  const [loadingStaticData, setLoadingStaticData] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);
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

  const parsedTrip = useMemo(() => {
    try {
      return typeof trip === "string" ? JSON.parse(trip) : trip;
    } catch (e) {
      return {};
    }
  }, [trip]);

  useEffect(() => {
    setTripDetails(parsedTrip);
    navigation.setOptions({
      headerShown: false,
    });

    if (parsedTrip?.savedTripId && !parsedTrip?.tripPlan) {
      fetchStaticItinerary(parsedTrip.savedTripId);
    }
    fetchFlightDeals();
  }, [parsedTrip]);

  const fetchStaticItinerary = async (savedTripKey: string) => {
    setLoadingStaticData(true);
    try {
      const data = await apiGet<any>(`/api/trips/saved/${encodeURIComponent(savedTripKey)}`);
      if (data) {
        const imageUrls: string[] = data.image_urls ?? [];
        setTripDetails((prev: any) => ({
          ...prev,
          tripPlan: data.trip_plan,
          image_urls: imageUrls.length > 0 ? imageUrls : prev.image_urls,
        }));
      }
    } catch {
    } finally {
      setLoadingStaticData(false);
    }
  };

  const fetchFlightDeals = async () => {
    try {
      const res = await apiGet<any>("/api/discovery/inspiration");
      if (res && res.destinations) {
        setFlights(res.destinations);
      }
    } catch (error) {
      console.warn("Could not fetch flight inspiration:", error);
    }
  };

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
      await apiPatch(`/api/trips/${tripDetails.id}/activate`, {});
      await refreshTrips();
      setTripDetails((prev) => ({ ...prev, isActive: true }));
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
      await apiPatch(`/api/trips/${tripDetails.id}/deactivate`, {});
      await refreshTrips();
      setTripDetails((prev) => ({ ...prev, isActive: false, isFinished: true }));
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
      setTripDetails((prev) => ({ ...prev, visitedIndices: newVisited }));

      await apiPatch(`/api/trips/${tripDetails.id}/visited-indices`, {
        visited_indices: newVisited,
      });

      await refreshTrips();
    } catch {
      setTripDetails((prev) => ({ ...prev, visitedIndices: currentVisited }));
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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  const transportData = useMemo(
    () => ({
      travelerMode: tripDetails?.travelerMode,
      departureIata: tripDetails?.departureIata || (tripDetails?.tripPlan as any)?.departureIata,
      destinationIata: tripDetails?.tripPlan?.destinationIata,
      bestTransport: tripDetails?.tripPlan?.bestTransport,
      weatherInsight: tripDetails?.tripPlan?.weatherInsight,
      flights: flights,
    }),
    [tripDetails?.id, (tripDetails?.tripPlan as any)?.departureIata, flights]
  );

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: Colors.WHITE }}
      >
        <View style={styles.slideshowContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.customBackBtn, { top: insets.top + 16 }]}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.PRIMARY} />
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

        <View style={styles.container}>
          <View style={styles.headerBlock}>
            <View style={styles.titleRow}>
              <Text 
                style={[styles.title, { flexShrink: 1 }]} 
                numberOfLines={1} 
                adjustsFontSizeToFit 
                minimumFontScale={0.7}
              >
                {tripDetails?.concertData?.artist
                  ? `${tripDetails?.concertData?.artist} Concert`
                  : tripDetails?.tripPlan?.tripName || "Trip Details"}
              </Text>
              <View style={styles.goldDot} />
            </View>
            <Text style={styles.dateText}>
              {tripDetails.totalDays} {tripDetails.totalDays === 1 ? "DAY" : "DAYS"} CURATED JOURNEY
            </Text>
          </View>

          {tripDetails.isFinished ? (
            <View style={styles.finishedBadge}>
              <MaterialCommunityIcons name="flag-checkered" size={20} color="#64748B" />
              <Text style={styles.finishedText}>JOURNEY COMPLETED</Text>
            </View>
          ) : tripDetails.isActive ? (
            <TouchableOpacity
              onPress={handleEndJourney}
              style={[styles.activateButton, { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#EF4444" }]}
            >
              <Text style={[styles.activateButtonText, { color: "#EF4444" }]}>
                End Journey
              </Text>
            </TouchableOpacity>
          ) : (
            !tripDetails?.concertData && (
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  onPress={handleActivateTrip}
                  style={styles.activateButton}
                >
                  <Text style={styles.activateButtonText}>
                    🚀 Activate Trip & Open Wallet
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )
          )}

          {tripDetails?.concertData && (
            <ConcertInfo concertDetails={tripDetails as any} />
          )}

          <WeatherWidget cityName={tripDetails?.tripPlan?.tripName || (tripDetails?.concertData?.artist ? `${tripDetails.concertData.artist} Concert` : "")} />


          <TransportInfo transportData={transportData as any} />

          <View style={styles.divider} />

          <HotelInfo
            cityName={tripDetails?.tripPlan?.tripName || ""}
            hotelData={tripDetails?.tripPlan?.hotelOptions}
          />

          <View style={styles.divider} />

          <PlannedTrip
            itineraryDetails={tripDetails?.tripPlan?.dailyItinerary}
            cityName={tripDetails?.tripPlan?.tripName || ""}
            isActive={!!tripDetails?.isActive}
            visitedIndices={tripDetails.visitedIndices}
            onToggleVisited={handleToggleVisited}
            onActivate={handleActivateTrip}
            onNavigateToActive={() => router.push({
              pathname: "/activeTrips" as any,
              params: { tripId: tripDetails.id },
            })}
          />

          <View style={styles.divider} />

          <RestaurantsInfo
            restaurantsInfo={{ ...tripDetails?.tripPlan?.recommendations } as any}
            cityName={tripDetails?.tripPlan?.tripName || ""}
          />

          <AIDisclaimer />
        </View>
      </ScrollView>

      {isAnimating && (
        <View style={styles.animationOverlay}>
          <LottieView
            source={require("@/src/assets/animations/active.json")}
            autoPlay
            loop
            style={{ width: width * 0.8, height: width * 0.8 }}
          />
          <Text style={styles.activatingText}>Setting up your trip...</Text>
        </View>
      )}

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
    backgroundColor: Colors.WHITE,
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
    backgroundColor: "rgba(255, 255, 255, 0.8)",
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
  activeDot: { width: 8, backgroundColor: Colors.WHITE },
  inactiveDot: { width: 8, backgroundColor: "rgba(255, 255, 255, 0.5)" },
  container: {
    paddingHorizontal: 12,
    paddingVertical: width * 0.05,
    backgroundColor: Colors.WHITE,
    minHeight: height,
    marginTop: -35,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingBottom: 100,
  },
  headerBlock: { marginBottom: 10, paddingHorizontal: 0 },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  title: { fontSize: 32, fontFamily: "playfairBold", color: Colors.TEXT, lineHeight: 40 },
  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.SECONDARY,
    marginLeft: 2,
    marginBottom: 6,
  },
  dateText: { fontFamily: "outfitMedium", fontSize: 14, color: Colors.GRAY, marginTop: 6 },
  activateButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 18,
    borderRadius: 15,
    marginVertical: 10,
    elevation: 5,
  },
  activateButtonText: {
    color: Colors.WHITE,
    textAlign: "center",
    fontFamily: "interBold",
    fontSize: 16,
  },
  animationOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  activatingText: {
    marginTop: 20,
    fontFamily: "interBold",
    fontSize: 18,
    color: Colors.PRIMARY,
  },
  divider: {
    height: 1,
    width: width * 0.923,
    marginLeft: width * 0.025,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginVertical: 20,
  },
  finishedBadge: {
    backgroundColor: "#F1F5F9",
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
    color: "#64748B",
    letterSpacing: 1,
  },
});
