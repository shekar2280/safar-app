import { View, Text, Dimensions, FlatList, TouchableOpacity } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { router, useNavigation } from "expo-router";
import { Colors } from "../../../constants/Colors";
import { DiscoverTripIdeas } from "../../../constants/Options";
import DiscoverCard from "../../../components/CreateTrip/DiscoverCard";
import { DiscoverTripContext } from "../../../context/DiscoverTripContext";

const { width, height } = Dimensions.get("window");

export default function HiddenGems() {
  const navigation = useNavigation();
  const { discoverData, setDiscoverData } = useContext(DiscoverTripContext);

  const [selectedLocation, setSelectedLocation] = useState(); 

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: " ",
    });
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      setDiscoverData((prev) => ({
        ...prev,
        locationInfo: selectedLocation,
      }));
    }
  }, [selectedLocation]);

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
          fontSize: width * 0.080,
          fontFamily: "outfitBold",
          marginTop: height * 0.01,
          marginBottom: height * 0.015,
        }}
      >
        Hidden Gems In India
      </Text>

      <FlatList
        data={DiscoverTripIdeas}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ marginVertical: height * 0.012 }}
            onPress={() => {
              setSelectedLocation(item); 
              router.push("/discover-trip/hidden-gems/select-place");
            }}
          >
            <DiscoverCard
              option={item}
              cardHeight={height * 0.20}
              selectedOption={selectedLocation}
            />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.title}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
