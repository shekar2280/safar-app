import { View, Text, Image, ScrollView, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Colors } from "../../constants/Colors";
import moment from "moment";
import FlightInfo from "../../components/TripDetails/TransportInfo";
import HotelInfo from "../../components/TripDetails/HotelInfo";
import PlannedTrip from "../../components/TripDetails/PlannedTrip";
import RestaurantsInfo from "../../components/TripDetails/RestaurantsInfo";
import TransportInfo from "../../components/TripDetails/TransportInfo";
import ConcertInfo from "../../components/TripDetails/ConcertInfo";

const { width, height } = Dimensions.get("window");

export default function TripDetails() {
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
          </Text>
          <Text
            style={{
              fontFamily: "outfit",
              fontSize: width * 0.045,
              color: Colors.GRAY,
            }}
          >
            {" - "}
            {moment(tripDetails?.endDate).format("DD MMM YYYY")}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: width * 0.025 }}>
          <Text
            style={{
              fontFamily: "outfit",
              fontSize: width * 0.045,
              color: Colors.GRAY,
            }}
          >
            {tripDetails?.traveler?.title}
          </Text>
          <Text
            style={{
              fontFamily: "outfit",
              fontSize: width * 0.045,
              color: Colors.GRAY,
            }}
          >
            ({tripDetails?.traveler?.people} Person)
          </Text>
        </View>

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
