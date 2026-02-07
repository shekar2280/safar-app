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
import { Colors } from "../../constants/Colors";
import moment from "moment";
import HotelInfo from "../../components/TripDetails/HotelInfo";
import PlannedTrip from "../../components/TripDetails/PlannedTrip";
import RestaurantsInfo from "../../components/TripDetails/RestaurantsInfo";
import TransportInfo from "../../components/TripDetails/TransportInfo";
import ConcertInfo from "../../components/TripDetails/ConcertInfo";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../config/FirebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { fallbackImages } from "../../constants/Options";
import { Image } from "expo-image";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

export default function TripDetails() {
  const user = auth.currentUser;
  const router = useRouter();
  const navigation = useNavigation();
  const { trip, imageUrl } = useLocalSearchParams();

  const [tripDetails, setTripDetails] = useState({});
  const [loadingStaticData, setLoadingStaticData] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef(null);

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

  const fetchStaticItinerary = async (savedTripId) => {
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

  const triggerHighlight = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.08,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
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
    try {
      setIsAnimating(true);
      const tripRef = doc(db, "UserTrips", user.uid, "trips", tripDetails.id);
      await updateDoc(tripRef, { isActive: true, activatedAt: new Date() });
      setTripDetails((prev) => ({ ...prev, isActive: true }));
      setTimeout(() => {
        setIsAnimating(false);
        router.push({
          pathname: "/activeTrips",
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
    [tripDetails?.id],
  );

  const images = useMemo(() => {
    const aiImages = tripDetails?.tripPlan?.imageUrl || tripDetails?.imageUrl;
    if (Array.isArray(aiImages)) return aiImages.map((img) => ({ uri: img }));
    if (imageUrl) return [{ uri: imageUrl }];
    return [randomFallback];
  }, [tripDetails, imageUrl, randomFallback]);

  if (loadingStaticData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

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
        </View>

        <View style={styles.container}>
          <Text style={styles.title}>
            {tripDetails?.tripPlan?.tripName || "Trip Details"}
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.dateText}>
              {moment(tripDetails.startDate).format("DD MMM YYYY")} -{" "}
              {moment(tripDetails.endDate).format("DD MMM YYYY")}
            </Text>
          </View>
          {!tripDetails.isActive ? (
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
          ) : (
            <View style={styles.activeBadge}>
              <Ionicons
                name="checkmark-done-circle"
                size={24}
                color="#00A86B"
              />
              <Text style={styles.activeText}>Trip is Active.</Text>
            </View>
          )}

          <TransportInfo transportData={tripDetails} />
          <HotelInfo
            hotelData={tripDetails?.tripPlan?.hotelOptions}
            cityName={tripDetails?.tripPlan?.tripName}
          />

          <View style={{ paddingTop: 20 }}>
            <PlannedTrip
              itineraryDetails={tripDetails?.tripPlan?.dailyItinerary}
              cityName={tripDetails?.tripPlan?.tripName}
              onActivatePress={scrollToTop}
            />
            <RestaurantsInfo
              restaurantsInfo={{ ...tripDetails?.tripPlan?.recommendations }}
              cityName={tripDetails?.tripPlan?.tripName}
            />
          </View>
        </View>
      </ScrollView>

      {isAnimating && (
        <View style={styles.animationOverlay}>
          <LottieView
            source={require("../../assets/animations/active.json")}
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
  slideshowContainer: { height: height * 0.42, backgroundColor: "#000" },
  headerImage: { width: width, height: height * 0.42 },
  container: {
    padding: width * 0.05,
    backgroundColor: Colors.WHITE,
    minHeight: height,
    marginTop: -35,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingBottom: 100,
  },
  title: { fontSize: 26, fontFamily: "outfitBold" },
  infoRow: { flexDirection: "row", marginVertical: 10 },
  dateText: { fontFamily: "outfit", fontSize: 16, color: Colors.GRAY },
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
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F4EA",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  activeText: {
    color: "#00A86B",
    fontFamily: "outfitMedium",
    fontSize: 16,
    marginLeft: 8,
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
});
