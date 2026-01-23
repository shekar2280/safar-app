import { View, Text, Dimensions, FlatList, TouchableOpacity } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { router, useNavigation } from "expo-router";
import { Colors } from "../../../constants/Colors";
import TrendingTripCard from "../../../components/CreateTrip/TrendingTripsCard";
import { CommonTripContext } from "../../../context/CommonTripContext";

const { width, height } = Dimensions.get("window");

export default function SelectTrendingPlace() {
  const navigation = useNavigation();
  const { tripDetails, setTripDetails } = useContext(CommonTripContext);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [trendingPlaces, setTrendingPlaces] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "Select Trending Place",
    });

    if (tripDetails?.trendingPlaces) {
      try {
        let parsedPlaces = tripDetails.trendingPlaces;
        if (typeof parsedPlaces === "string") {
          parsedPlaces = parsedPlaces.replace(/```json/g, "").replace(/```/g, "").trim();
          parsedPlaces = JSON.parse(parsedPlaces);
        }
        setTrendingPlaces(parsedPlaces);
      } catch (err) {
        console.error("Failed to parse trending places JSON:", err);
      }
    }
  }, [tripDetails]);

  const handleSelect = (place) => {
    setSelectedPlace(place);

    setTripDetails((prev) => ({
      ...prev,
      destinationInfo: place,
    }));

    router.push("/discover-trip/trip-manager/select-traveler"); 
  };
  
  return (
    <View
      style={{
        padding: width * 0.06,
        paddingTop: height * 0.10,
        backgroundColor: Colors.WHITE,
        flex: 1,
        paddingBottom: height * 0.08,
      }}
    >
      <Text
        style={{
          fontSize: width * 0.07,
          fontFamily: "outfitBold",
          marginBottom: height * 0.015,
        }}
      >
        Places Buzzing Near You
      </Text>

      <FlatList
        data={trendingPlaces}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ marginVertical: height * 0.012 }}
            onPress={() => handleSelect(item)}
          >
            <TrendingTripCard
              option={item}
              cardHeight={height * 0.22}
              selectedOption={selectedPlace}
            />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
