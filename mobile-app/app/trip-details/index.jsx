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
import { doc, updateDoc, getDoc, collection } from "firebase/firestore";
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

      await updateDoc(tripRef, {
        isActive: true,
        activatedAt: new Date(),
      });

      setTripDetails((prev) => ({ ...prev, isActive: true }));
      setTimeout(() => {
        setIsAnimating(false);
        router.push({
          pathname: "/wallet",
          params: { tripId: tripDetails.id },
        });
      }, 3000);
    } catch (error) {
      setIsAnimating(false);
      console.error(error);
      Alert.alert("Error", "Failed to activate trip.");
    }
  };

  const imageSource = useMemo(() => {
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  }, [tripDetails?.id]);

  if (loadingStaticData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="50" color={Colors.PRIMARY} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const getHeaderImage = () => {
    if (tripDetails?.concertData) {
      const concertImg =
        tripDetails?.concertData?.artistImageUrl ||
        tripDetails?.concertData?.locationInfo?.imageUrl ||
        imageUrl;

      if (concertImg && typeof concertImg === "string") {
        return { uri: concertImg };
      }
      return require("../../assets/images/concert.jpg");
    }
    if (imageUrl) {
      return { uri: imageUrl };
    }
    return imageSource;
  };
  
  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: Colors.WHITE }}
      >
        <Image source={getHeaderImage()} style={styles.headerImage} />

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
                name="wallet-outline"
                size={width * 0.06}
                color="#00A86B"
              />
              <Text style={styles.activeText}>Trip is Active.</Text>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/wallet",
                    params: { tripId: tripDetails.id },
                  })
                }
                style={{ marginLeft: "auto" }}
              >
                <Text style={styles.linkText}>Go to Wallet</Text>
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
          <HotelInfo hotelData={tripDetails?.tripPlan?.hotelOptions} cityName={tripDetails?.tripPlan?.tripName} />

          {/* Itinerary & Food Section */}
          <View style={{ paddingTop: height * 0.02 }}>
            <PlannedTrip
              itineraryDetails={tripDetails?.tripPlan?.dailyItinerary}
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
            source={require("../../assets/animations/wallet.json")}
            autoPlay
            loop
            style={{ width: width * 0.8, height: width * 0.8 }}
          />
          <Text style={styles.activatingText}>Preparing your wallet...</Text>
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
  headerImage: { width: "100%", height: height * 0.4 },
  container: {
    padding: width * 0.05,
    backgroundColor: Colors.WHITE,
    minHeight: height,
    marginTop: -30,
    borderTopLeftRadius: width * 0.07,
    borderTopRightRadius: width * 0.07,
    paddingBottom: height * 0.1,
  },
  title: { fontSize: width * 0.065, fontFamily: "outfitBold" },
  infoRow: { flexDirection: "row", marginVertical: height * 0.015 },
  dateText: {
    fontFamily: "outfit",
    fontSize: width * 0.045,
    color: Colors.GRAY,
  },
  activateButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
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
    borderRadius: 12,
    marginBottom: 25,
  },
  activeText: {
    color: "#00A86B",
    fontFamily: "outfitMedium",
    fontSize: 16,
    marginLeft: 8,
  },
  linkText: {
    color: Colors.PRIMARY,
    fontFamily: "outfitMedium",
    textDecorationLine: "underline",
  },
  animationOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
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
