import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "@/src/constants/colors";
import { SelectTravelerList } from "@/src/constants/travel-data";
import OptionCard from "@/src/components/trip/OptionCard";
import { ConcertTripContext } from "@/src/context/ConcertTripContext";
import { TravelerGroup } from "@/src/types/interfaces";

const { width, height } = Dimensions.get("window");

export default function SelectTraveler() {
  const navigation = useNavigation();
  const router = useRouter();
  const [selectedTraveler, setSelectedTraveler] = useState<TravelerGroup | null>(null);
  const context = useContext(ConcertTripContext);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "Travelers",
    });
  }, []);

  useEffect(() => {
    if (selectedTraveler && context) {
      const { icon, ...safeTraveler } = selectedTraveler as any;
      context.setConcertData({
        ...context.concertData,
        travelers: safeTraveler,
      });
    }
  }, [selectedTraveler]);

  if (!context) return null;

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
        Who's Traveling
      </Text>

      <View style={{ marginTop: height * 0.010, flex: 1 }}>
        <Text
          style={{
            fontFamily: "outfitBold",
            fontSize: width * 0.05,
            marginBottom: height * 0.01,
          }}
        >
          Choose your traveler's
        </Text>

        <FlatList
          data={SelectTravelerList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedTraveler(item as any)}
              style={{ marginVertical: height * 0.012 }}
            >
              <OptionCard option={item as any} selectedOption={selectedTraveler as any} />
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
          marginBottom: height * 0.025,
        }}
        disabled={!selectedTraveler}
        onPress={() => {
          if (selectedTraveler) {
            router.push("/discover-trip/concert-trips/select-budget" as any);
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
