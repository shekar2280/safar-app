import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { SelectTravelerList } from "../../constants/Options";
import OptionCard from "../../components/CreateTrip/OptionCard";
import { CreateTripContext } from "../../context/CreateTripContext";

const { width, height } = Dimensions.get("window");

export default function SelectTraveler() {
  const navigation = useNavigation();
  const router = useRouter();
  const [selectedTraveler, setSelectedTraveler] = useState();
  const { tripData, setTripData } = useContext(CreateTripContext);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "Travelers",
    });
  }, []);

  useEffect(() => {
    if (selectedTraveler) {
      setTripData((prev) => ({
        ...prev,
        traveler: selectedTraveler,
      }));
    }
  }, [selectedTraveler]);

  return (
    <View
      style={{
        padding: width * 0.06,
        paddingTop: height * 0.10,
        backgroundColor: Colors.WHITE,
        flex: 1,
      }}
    >
      <Text
        style={{
          fontSize: width * 0.075,
          fontFamily: "outfitBold",
          marginTop: height * 0.01,
        }}
      >
         Choose your traveler's
      </Text>

      <View style={{ marginTop: height * 0.015, flex: 1 }}>

        <FlatList
          data={SelectTravelerList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedTraveler(item)}
              style={{ marginVertical: height * 0.012 }}
            >
              <OptionCard option={item} selectedOption={selectedTraveler} />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.title}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <TouchableOpacity
        style={{
          paddingVertical: height * 0.02,
          backgroundColor: selectedTraveler ? Colors.PRIMARY : "#ccc",
          borderRadius: width * 0.04,
          marginTop: height * 0.020,
          marginBottom: height * 0.050,
        }}
        disabled={!selectedTraveler}
        onPress={() => {
          if (selectedTraveler) {
            router.push("/create-trip/select-dates");
          }
        }}
      >
        <Text
          style={{
            textAlign: "center",
            color: Colors.WHITE,
            fontFamily: "outfitMedium",
            fontSize: width * 0.05,
          }}
        >
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}
