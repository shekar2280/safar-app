import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
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

  const parsedTrip = useMemo(() => {
    try {
      return typeof trip === "string" ? JSON.parse(trip) : trip;
    } catch (e) {
      return {};
    }
  }, [trip]);

  const [tripDetails, setTripDetails] = useState(parsedTrip);
  const [loadingStaticData, setLoadingStaticData] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const tripData =
    tripDetails?.tripData ||
    tripDetails?.discoverData ||
    tripDetails?.festiveData ||
    tripDetails?.concertData ||
    tripDetails?.sportsData ||
    {};

  useEffect(() => {
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
      console.error("Error fetching static itinerary:", error);
      Alert.alert("Error", "Could not load complete itinerary.");
    } finally {
      setLoadingStaticData(false);
    }
  };

  const handleActivateTrip = async () => {
    if (!tripDetails.id) return;
    try {
      setIsAnimating(true);
      const tripRef = doc(db, "UserTrips", user.uid, "trips", tripDetails.id);

      const updateData = {
        isActive: true,
        activatedAt: new Date(),
      };

      await updateDoc(tripRef, updateData);

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
      console.error(error);
      Alert.alert("Error", "Failed to activate trip.");
    }
  };

  const randomFallback = useMemo(() => {
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  }, [tripDetails?.id]);

  const images = useMemo(() => {
    const aiImages = tripDetails?.tripPlan?.imageUrl || tripDetails?.imageUrl;

    if (Array.isArray(aiImages)) {
      return aiImages.map((img) => ({ uri: img }));
    }

    if (tripDetails?.concertData) {
      const concertImg =
        tripDetails?.concertData?.artistImageUrl ||
        tripDetails?.concertData?.locationInfo?.imageUrl;
      if (concertImg) return [{ uri: concertImg }];
    }

    if (imageUrl) return [{ uri: imageUrl }];

    return [randomFallback];
  }, [tripDetails, imageUrl, randomFallback]);

  if (loadingStaticData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text style={styles.loadingText}>Loading Trip Details...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
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

          {images.length > 1 && (
            <View style={styles.indicatorContainer}>
              {images.map((_, i) => (
                <View key={i} style={styles.dot} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.container}>
          <Text style={styles.title}>
            {tripDetails?.tripPlan?.tripName ||
              `${tripDetails?.concertData?.artist} Concert` ||
              "Trip Details"}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.dateText}>
              {moment(tripDetails.startDate).format("DD MMM YYYY")}
              {" - "}
              {moment(tripDetails.endDate).format("DD MMM YYYY")}
            </Text>
          </View>

          {/* Wallet Activation Section */}
          {!tripDetails.isActive ? (
            <TouchableOpacity
              onPress={handleActivateTrip}
              style={styles.activateButton}
            >
              <Text style={styles.activateButtonText}>
                🚀 Activate Trip & Open Wallet
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.activeBadge}>
              <Ionicons
                name="checkmark-done-circle"
                size={width * 0.06}
                color="#00A86B"
              />
              <Text style={styles.activeText}>Trip is Active.</Text>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/activeTrips",
                    params: { tripId: tripDetails.id },
                  })
                }
                style={{ marginLeft: "auto" }}
              >
                <Ionicons
                  name="arrow-forward-outline"
                  size={24}
                  color="#00A86B"
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Concert Section */}
          {tripDetails?.tripPlan?.concertDetails && (
            <ConcertInfo concertData={tripDetails.tripPlan.concertDetails} />
          )}

          {/* Transport Section */}
          <TransportInfo transportData={tripDetails} />

          {/* Hotels Section */}
          <HotelInfo
            hotelData={tripDetails?.tripPlan?.hotelOptions}
            cityName={tripDetails?.tripPlan?.tripName}
          />

          {/* Itinerary & Food Section */}
          <View style={{ paddingTop: height * 0.02 }}>
            <PlannedTrip
              itineraryDetails={tripDetails?.tripPlan?.dailyItinerary}
              cityName={tripDetails?.tripPlan?.tripName}
            />
            <RestaurantsInfo
              restaurantsInfo={{
                ...tripDetails?.tripPlan?.recommendations,
                cityName: tripData?.locationInfo?.name,
              }}
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
  loadingText: { fontFamily: "outfit", marginTop: 10, color: Colors.GRAY },
  slideshowContainer: {
    height: height * 0.42,
    backgroundColor: "#000",
  },
  headerImage: {
    width: width,
    height: height * 0.42,
  },
  indicatorContainer: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    alignSelf: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.7)",
  },

  container: {
    padding: width * 0.05,
    backgroundColor: Colors.WHITE,
    minHeight: height,
    marginTop: -35,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingBottom: height * 0.1,
  },
  title: { fontSize: 26, fontFamily: "outfitBold" },
  infoRow: { flexDirection: "row", marginVertical: 10 },
  dateText: {
    fontFamily: "outfit",
    fontSize: 16,
    color: Colors.GRAY,
  },
  activateButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 18,
    borderRadius: 15,
    marginVertical: 10,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
