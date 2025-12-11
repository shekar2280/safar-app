import { View, Text, Image, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
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

const { width, height } = Dimensions.get("window");

export default function TripDetails() {
  const router = useRouter();
  const navigation = useNavigation();
  const { trip, imageUrl } = useLocalSearchParams();

  const [tripDetails, setTripDetails] = useState({});
  const [tripData, setTripData] = useState({});

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: " ",
    });

    const parsedTrip = JSON.parse(trip);
    setTripDetails(parsedTrip);

    // Normalize to tripData (either tripData or discoverData)
    setTripData(
      parsedTrip?.tripData ||
        parsedTrip?.discoverData ||
        parsedTrip?.festiveData ||
        parsedTrip?.concertData ||
        parsedTrip?.sportsData ||
        {}
    );
  }, []);

  const handleActivateTrip = async () => {
    if (!tripDetails.id) {
      console.error("Trip ID is missing, cannot activate.");
      return;
    }

    try {
      const tripRef = doc(db, "UserTrips", tripDetails.id);

      await updateDoc(tripRef, {
        isActive: true,
        activatedAt: new Date(), 
      });

      router.push({
        pathname: "/wallet",
        params: { tripId: tripDetails.id }, 
      });

      setTripDetails((prev) => ({ ...prev, isActive: true }));
      
    } catch (error) {
      console.error("Error activating trip:", error);
      alert("Failed to activate trip. Please try again.");
    }
  };

  const isTripActive = tripDetails.isActive;

  return (
    <ScrollView>
      <Image
        source={
          tripDetails?.concertData
            ? require("../../assets/images/concert.jpg")
            : typeof imageUrl === "string"
            ? { uri: imageUrl }
            : require("../../assets/images/homepage.jpg")
        }
        style={{
          width: "100%",
          height: height * 0.4,
          resizeMode: "cover",
        }}
      />
      <View
        style={{
          padding: width * 0.05,
          backgroundColor: Colors.WHITE,
          minHeight: height,
          marginTop: -30,
          borderTopLeftRadius: width * 0.07,
          borderTopRightRadius: width * 0.07,
          marginBottom: height * 0.02,
        }}
      >
        <Text
          style={{
            fontSize: width * 0.065,
            fontFamily: "outfitBold",
          }}
        >
          {tripData?.locationInfo?.name || tripData?.locationInfo?.title}
        </Text>

        <View
          style={{
            flexDirection: "row",
            gap: width * 0.015,
            marginTop: height * 0.005,
            marginBlock: height * 0.02,
          }}
        >
          <Text
            style={{
              fontFamily: "outfit",
              fontSize: width * 0.045,
              color: Colors.GRAY,
            }}
          >
            {moment(tripDetails?.startDate).format("DD MMM YYYY")}
            {" - "}
            {moment(tripDetails?.endDate).format("DD MMM YYYY")}
          </Text>
        </View>

        {!isTripActive ? (
          <TouchableOpacity
            onPress={handleActivateTrip}
            style={{
              backgroundColor: Colors.PRIMARY, 
              padding: height * 0.018,
              borderRadius: width * 0.025,
              marginBottom: height * 0.03, 
            }}
          >
            <Text
              style={{
                color: Colors.WHITE,
                textAlign: "center",
                fontFamily: "outfitBold",
                fontSize: width * 0.045,
              }}
            >
              🚀 Activate Trip & Open Wallet
            </Text>
          </TouchableOpacity>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#E6F4EA', 
              padding: height * 0.015,
              borderRadius: width * 0.025,
              marginBottom: height * 0.03,
            }}
          >
            <Ionicons name="wallet-outline" size={width * 0.06} color="#00A86B" />
            <Text
              style={{
                color: '#00A86B', 
                fontFamily: "outfitMedium",
                fontSize: width * 0.045,
                marginLeft: width * 0.02,
              }}
            >
              Trip is Active.
            </Text>
             <TouchableOpacity
                onPress={() => router.push({ pathname: "/wallet", params: { tripId: tripDetails.id } })}
                style={{ marginLeft: 'auto' }}
              >
                <Text style={{ color: Colors.PRIMARY, fontFamily: 'outfitMedium', textDecorationLine: 'underline' }}>
                  Go to Wallet
                </Text>
            </TouchableOpacity>
          </View>
        )}

        {tripDetails?.tripPlan?.concertDetails && (
          <ConcertInfo concertData={tripDetails.tripPlan.concertDetails} />
        )}

        {/* Flight Info */}
        <TransportInfo
          transportData={tripDetails?.tripPlan?.transportDetails}
        />

        {/* Hotel Info */}
        <HotelInfo hotelData={tripDetails?.tripPlan?.hotelOptions} />

        {/* Itinerary + Restaurant Recommendations */}
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
