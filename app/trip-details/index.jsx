import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Alert,
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
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { fallbackImages } from "../../constants/Options";
import { Image } from "expo-image";

const { width, height } = Dimensions.get("window");

export default function TripDetails() {
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
  }, []);

  const imageSource = useMemo(() => {
    const randomUrl =
      fallbackImages[
        Math.floor(Math.random() * fallbackImages.length)
      ];
    return randomUrl;
  }, [tripDetails?.id]);

  const handleActivateTrip = async () => {
    if (!tripDetails.id) return;

    try {
      const tripRef = doc(db, "UserTrips", tripDetails.id);

      await updateDoc(tripRef, {
        isActive: true,
        activatedAt: new Date(),
      });

      setTripDetails((prev) => ({ ...prev, isActive: true }));

      router.push({
        pathname: "/wallet",
        params: { tripId: tripDetails.id },
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to activate trip.");
    }
  };

  const isTripActive = tripDetails.isActive;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Image
        source={
          tripDetails?.concertData
            ? require("../../assets/images/concert.jpg")
            : typeof imageUrl === "string" && imageUrl.length > 0
            ? { uri: imageUrl }
            : imageSource
        }
        style={styles.headerImage}
      />
      <View style={styles.container}>
        <Text style={styles.title}>
          {tripData?.locationInfo?.name || tripData?.locationInfo?.title || "Trip Details"}
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.dateText}>
            {moment(tripDetails?.startDate).format("DD MMM YYYY")}
            {" - "}
            {moment(tripDetails?.endDate).format("DD MMM YYYY")}
          </Text>
        </View>

        {!isTripActive ? (
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

        {tripDetails?.tripPlan?.concertDetails && (
          <ConcertInfo concertData={tripDetails.tripPlan.concertDetails} />
        )}

        <TransportInfo
          transportData={tripDetails?.tripPlan?.transportDetails}
        />

        <HotelInfo hotelData={tripDetails?.tripPlan?.hotelOptions} />

        <View style={{ paddingTop: height * 0.02 }}>
          <PlannedTrip
            itineraryDetails={tripDetails?.tripPlan?.dailyItinerary}
          />

          <RestaurantsInfo
            restaurantsInfo={{
              ...tripDetails?.tripPlan?.recommendations,
              cityName: tripData?.locationInfo?.name,
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    width: "100%",
    height: height * 0.4,
    resizeMode: "cover",
  },
  container: {
    padding: width * 0.05,
    backgroundColor: Colors.WHITE,
    minHeight: height,
    marginTop: -30,
    borderTopLeftRadius: width * 0.07,
    borderTopRightRadius: width * 0.07,
    paddingBottom: height * 0.1,
  },
  title: {
    fontSize: width * 0.065,
    fontFamily: "outfitBold",
  },
  infoRow: {
    flexDirection: "row",
    gap: width * 0.015,
    marginTop: height * 0.005,
    marginVertical: height * 0.02,
  },
  dateText: {
    fontFamily: "outfit",
    fontSize: width * 0.045,
    color: Colors.GRAY,
  },
  activateButton: {
    backgroundColor: Colors.PRIMARY,
    padding: height * 0.018,
    borderRadius: width * 0.025,
    marginBottom: height * 0.03,
  },
  activateButtonText: {
    color: Colors.WHITE,
    textAlign: "center",
    fontFamily: "outfitBold",
    fontSize: width * 0.045,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F4EA",
    padding: height * 0.015,
    borderRadius: width * 0.025,
    marginBottom: height * 0.03,
  },
  activeText: {
    color: "#00A86B",
    fontFamily: "outfitMedium",
    fontSize: width * 0.045,
    marginLeft: width * 0.02,
  },
  linkText: {
    color: Colors.PRIMARY,
    fontFamily: "outfitMedium",
    textDecorationLine: "underline",
  },
});