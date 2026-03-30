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
} from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Colors } from "@/src/constants/colors";
import dayjs from "dayjs";
import HotelInfo from "@/src/components/trip-details/HotelInfo";
import PlannedTrip from "@/src/components/trip-details/PlannedTrip";
import RestaurantsInfo from "@/src/components/trip-details/RestaurantsInfo";
import TransportInfo from "@/src/components/trip-details/TransportInfo";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/src/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
import { fallbackImages } from "@/src/constants/travel-data";
import { Image } from "expo-image";
import LottieView from "lottie-react-native";
import ConcertInfo from "@/src/components/trip-details/ConcertInfo";
import AIDisclaimer from "@/src/components/common/AIDisclaimer";
import { UserTrip } from "@/src/types/interfaces";

const { width, height } = Dimensions.get("window");
const SLIDESHOW_HEIGHT = height * 0.52;

export default function TripDetails() {
  const user = auth.currentUser;
  const router = useRouter();
  const navigation = useNavigation();
  const { trip, imageUrl } = useLocalSearchParams();

  const [tripDetails, setTripDetails] = useState<Partial<UserTrip>>({});
  const [loadingStaticData, setLoadingStaticData] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView>(null);

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
      headerShown: true,
      headerTransparent: true,
      headerTitle: " ",
    });

    if (parsedTrip?.savedTripId && !parsedTrip?.tripPlan) {
      fetchStaticItinerary(parsedTrip.savedTripId);
    }
  }, [parsedTrip]);

  const fetchStaticItinerary = async (savedTripId: string) => {
    setLoadingStaticData(true);
    try {
      const docRef = doc(db, "SavedTripData", savedTripId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const staticData = docSnap.data();
        setTripDetails((prev) => ({
          ...prev,
          tripPlan: staticData.tripPlan,
          imageUrl: prev.imageUrl || staticData.imageUrl,
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStaticData(false);
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
    if (!tripDetails.id || !user) return;
    try {
      setIsAnimating(true);
      const tripRef = doc(db, "UserTrips", user.uid, "trips", tripDetails.id);
      await updateDoc(tripRef, { isActive: true, activatedAt: new Date() });
      setTripDetails((prev) => ({ ...prev, isActive: true }));
      setTimeout(() => {
        setIsAnimating(false);
        router.push({
          pathname: "/activeTrips" as any,
          params: { tripId: tripDetails.id },
        });
      }, 3000);
    } catch (error) {
      setIsAnimating(false);
      Alert.alert("Error", "Failed to activate trip.");
    }
  };

  const randomFallback = useMemo(
    () => fallbackImages[Math.floor(Math.random() * fallbackImages.length)],
    [tripDetails?.id]
  );

  const images = useMemo(() => {
    const aiImages = tripDetails?.tripPlan?.imageUrl || tripDetails?.imageUrl;
    if (Array.isArray(aiImages)) return aiImages.map((img) => ({ uri: img }));
    if (imageUrl) return [{ uri: imageUrl as string }];
    return [randomFallback];
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
      tripType: tripDetails?.tripType,
      departureIata: tripDetails?.departureIata || (tripDetails?.tripPlan as any)?.departureIata,
      destinationIata: tripDetails?.tripPlan?.destinationIata,
    }),
    [tripDetails?.id, (tripDetails?.tripPlan as any)?.departureIata]
  );

  return (
    <>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: Colors.WHITE }}
      >
        <View style={styles.slideshowContainer}>
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
            <Text style={styles.overline}>YOUR CURATED JOURNEY</Text>
            <View style={styles.titleRow}>
              <Text style={styles.title}>
                {tripDetails?.tripPlan?.tripName ||
                  `${tripDetails?.concertData?.artist} Concert` ||
                  "Trip Details"}
              </Text>
              <View style={styles.goldDot} />
            </View>
            <Text style={styles.dateText}>
               {dayjs(tripDetails.startDate).format("DD MMM YYYY")} -{" "}
               {dayjs(tripDetails.endDate).format("DD MMM YYYY")}
            </Text>
          </View>

          {(!tripDetails.isActive && !tripDetails?.concertData) && (
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
          )}

          {tripDetails?.concertData && (
            <ConcertInfo concertDetails={tripDetails as any} />
          )}

          <View style={styles.divider} />

          <TransportInfo transportData={transportData as any} />
          
          <View style={styles.divider} />

          <HotelInfo
            cityName={tripDetails?.tripPlan?.tripName || ""}
          />

          <View style={styles.divider} />

          <PlannedTrip
            itineraryDetails={tripDetails?.tripPlan?.dailyItinerary}
            cityName={tripDetails?.tripPlan?.tripName || ""}
            isActive={!!tripDetails?.isActive}
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
    padding: width * 0.05,
    backgroundColor: Colors.WHITE,
    minHeight: height,
    marginTop: -35,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingBottom: 100,
  },
  headerBlock: { marginBottom: 10, paddingHorizontal: 4 },
  overline: {
    fontFamily: "outfitMedium",
    fontSize: 10,
    color: Colors.MUTED_TEXT,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  titleRow: { flexDirection: "row", alignItems: "baseline", flexWrap: "wrap" },
  title: { fontSize: 32, fontFamily: "playfairBold", color: Colors.TEXT, lineHeight: 40 },
  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.SECONDARY,
    marginLeft: 6,
    marginBottom: 8,
  },
  dateText: { fontFamily: "outfit", fontSize: 14, color: Colors.GRAY, marginTop: 6 },
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
    fontFamily: "outfitBold",
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
    fontFamily: "outfitBold",
    fontSize: 18,
    color: Colors.PRIMARY,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: 25,
    marginHorizontal: width * 0.05,
  },
});
