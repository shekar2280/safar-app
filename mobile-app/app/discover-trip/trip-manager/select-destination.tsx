import {
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { router, useNavigation, useLocalSearchParams } from "expo-router";
import { Colors } from "@/src/constants/colors";
import DiscoverCard from "@/src/components/trip/DiscoverCard";
import { CommonTripContext } from "@/src/context/CommonTripContext";
import { HiddenGemIdeas, FestiveTripIdeas } from "@/src/constants/travel-data";
import { TripCategory } from "@/src/types";

const { width, height } = Dimensions.get("window");

const DATA_MAP: Record<string, any[]> = {
  [TripCategory.HIDDEN]: HiddenGemIdeas,
  [TripCategory.FESTIVE]: FestiveTripIdeas,
};

export default function SelectDestination() {
  const navigation = useNavigation();
  const { tripCategory } = useLocalSearchParams<{ tripCategory: string }>();
  const context = useContext(CommonTripContext);

  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const listData = tripCategory ? DATA_MAP[tripCategory] : [];

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: " ",
    });

    if (context && tripCategory) {
      context.setTripDetails({
        ...context.tripDetails,
        tripCategory: tripCategory as TripCategory,
      });
    }
  }, []);

  const onSelect = (item: any) => {
    const { name, title, country, countryCode } = item;
    const cleanedLocation = {
      name,
      title,
      country,
      countryCode,
    };

    setSelectedLocation(cleanedLocation);

    if (context) {
      context.setTripDetails({
        ...context.tripDetails,
        destinationInfo: {
          name: name,
          shortName: name,
          country: country,
          countryCode: countryCode,
          coordinates: item.coordinates || { lat: 0, lon: 0 }
        } as any,
      });
    }

    router.push("/discover-trip/trip-manager/select-departure" as any);
  };

  return (
    <View
      style={{
        padding: width * 0.06,
        paddingTop: height * 0.1,
        backgroundColor: Colors.WHITE,
        flex: 1,
        paddingBottom: height * 0.08,
      }}
    >
      <Text
        style={{
          fontSize: width * 0.065,
          fontFamily: "outfitBold",
          marginBottom: height * 0.02,
        }}
      >
        Select Destination
      </Text>

      <FlatList
        data={listData}
        keyExtractor={(item) => item.title}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ marginVertical: height * 0.012 }}
            onPress={() => onSelect(item)}
          >
            <DiscoverCard
              option={item}
              cardHeight={height * 0.2}
              selectedOption={selectedLocation}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
