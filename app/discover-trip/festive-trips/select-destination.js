import { View, Text, Dimensions, FlatList, TouchableOpacity } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "../../../constants/Colors";
import { FestiveTripIdeas } from "../../../constants/Options";
import DiscoverCard from "../../../components/CreateTrip/DiscoverCard";
const { width, height } = Dimensions.get("window");
import { FestiveTripContext } from "../../../context/FestiveTripContext";

export default function FestiveTrip() {
  const navigation = useNavigation();
  const router = useRouter();
   const { festiveData, setFestiveData } = useContext(FestiveTripContext);

  const [selectedLocation, setSelectedLocation] = useState();

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: " ",
    });
  }, []);

  useEffect(() => {
    if(selectedLocation) {
      setFestiveData((prev) => ({
        ...prev,  
        locationInfo: selectedLocation,
      }));
    }
  },[selectedLocation]);

  return (
    <View
      style={{
        padding: width * 0.06,
        paddingTop: height * 0.12,
        backgroundColor: Colors.WHITE,
        flex: 1,
      }}
    >
      <Text
        style={{
          fontSize: width * 0.085,
          fontFamily: "outfitBold",
          marginTop: height * 0.01,
        }}
      >
        Festive Trip
      </Text>

      <FlatList
      data={FestiveTripIdeas}
      renderItem={({ item }) => (
        <TouchableOpacity
        style={{ marginVertical: height * 0.012 }}
        onPress={() => {
          setSelectedLocation(item);
          router.push("/discover-trip/festive-trips/select-place");
        }}
        >
        <DiscoverCard 
          option={item}
          cardHeight={height * 0.22}
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
