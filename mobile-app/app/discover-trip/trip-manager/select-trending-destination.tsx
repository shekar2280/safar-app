import { View, Text, Dimensions, FlatList, TouchableOpacity } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { router, useNavigation } from "expo-router";
import { Colors } from "@/src/constants/colors";
import TrendingTripsCard from "@/src/components/trip/TrendingTripsCard";
import { CommonTripContext } from "@/src/context/CommonTripContext";

const { width, height } = Dimensions.get("window");

export default function SelectTrendingPlace() {
  const navigation = useNavigation();
  const context = useContext(CommonTripContext);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [trendingPlaces, setTrendingPlaces] = useState<any[]>([]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "Select Trending Place",
    });

    if (context?.tripDetails?.trendingPlaces) {
      try {
        let parsedPlaces = context.tripDetails.trendingPlaces;
        if (typeof parsedPlaces === "string") {
          const cleanJson = (parsedPlaces as string)
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
          parsedPlaces = JSON.parse(cleanJson);
        }
        setTrendingPlaces(Array.isArray(parsedPlaces) ? parsedPlaces : []);
      } catch (err) {
        console.error("Failed to parse trending places JSON:", err);
      }
    }
  }, [context?.tripDetails]);

  const handleSelect = (place: any) => {
    setSelectedPlace(place);

    if (context) {
      context.setTripDetails({
        ...context.tripDetails,
        destinationInfo: place,
      });
    }

    router.push("/discover-trip/trip-manager/select-traveler" as any); 
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
            <TrendingTripsCard
              option={item}
              cardHeight={height * 0.22}
              selectedOption={selectedPlace}
            />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
