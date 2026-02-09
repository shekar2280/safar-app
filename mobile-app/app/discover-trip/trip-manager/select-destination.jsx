import {
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { router, useNavigation, useLocalSearchParams } from "expo-router";
import { Colors } from "../../../constants/Colors";
import DiscoverCard from "../../../components/CreateTrip/DiscoverCard";
import { CommonTripContext } from "../../../context/CommonTripContext";

import { HiddenGemIdeas, FestiveTripIdeas } from "../../../constants/Options";

const { width, height } = Dimensions.get("window");

const DATA_MAP = {
  HIDDEN: HiddenGemIdeas,
  FESTIVE: FestiveTripIdeas,
};

export default function SelectDestination() {
  const navigation = useNavigation();
  const { tripCategory } = useLocalSearchParams();
  const { setTripDetails } = useContext(CommonTripContext);

  const [selectedLocation, setSelectedLocation] = useState(null);

  const listData = DATA_MAP[tripCategory];

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: " ",
    });

    setTripDetails((prev) => ({
      ...prev,
      tripCategory,
    }));
  }, []);

  const onSelect = (item) => {
    const { name, title, country, countryCode } = item;

    const cleanedLocation = {
      name,
      title,
      country,
      countryCode,
    };

    setSelectedLocation(cleanedLocation);

    setTripDetails((prev) => ({
      ...prev,
      destinationInfo: cleanedLocation,
    }));

    router.push("/discover-trip/trip-manager/select-departure");

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
