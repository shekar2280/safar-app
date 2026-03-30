import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ToastAndroid,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "@/src/constants/colors";
import { ConcertTripContext } from "@/src/context/ConcertTripContext";
import OptionCard from "@/src/components/trip/OptionCard";
import { ConcertEvent } from "@/src/types/interfaces";

const { width, height } = Dimensions.get("window");

function showToast(message: string) {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert("", message);
  }
}

const getDayBefore = (dateStr: string | undefined) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
};

export default function SelectDestination() {
  const navigation = useNavigation();
  const router = useRouter();
  const context = useContext(ConcertTripContext);

  const [selectedOption, setSelectedOption] = useState<ConcertEvent | null>(null);
  const [concertDates, setConcertDates] = useState<ConcertEvent[]>([]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "",
    });
  }, []);

  useEffect(() => {
    if (context?.concertData?.locationOptions && context.concertData.locationOptions.length > 0) {
      const sortedOptions = [...context.concertData.locationOptions].sort((a, b) => {
        const dateA = new Date(a.concertDate || "").getTime();
        const dateB = new Date(b.concertDate || "").getTime();
        return dateA - dateB;
      });
      setConcertDates(sortedOptions);
    }
  }, [context?.concertData?.locationOptions]);

  const onClickContinue = () => {
    if (!selectedOption || !context) {
      showToast("Select a concert date");
      return;
    }

    const selected = selectedOption;
    const updatedData = {
      ...context.concertData,
      locationInfo: {
        name: selected.title,
        shortName: selected.title,
        country: selected.country || "",
        countryCode: selected.countryCode || "",
        coordinates: { lat: selected.coordinates.latitude, lon: selected.coordinates.longitude },
        venueName: selected.venueName,
        venueAddress: selected.venueAddress,
        concertDate: selected.concertDate,
        concertTime: selected.concertTime,
        imageUrl: selected.image,
        bookingUrl: selected.bookingUrl,
        priceRange: selected.priceRange,
      } as any,
      startDate: selected.concertDate !== "TBA" ? getDayBefore(selected.concertDate) || undefined : undefined,
      endDate: selected.concertDate !== "TBA" ? selected.concertDate || undefined : undefined,
    };

    context.setConcertData(updatedData);
    router.push("/discover-trip/concert-trips/select-departure" as any); 
  };

  if (!context) return null;

  return (
    <View
      style={{
        padding: width * 0.06,
        paddingTop: height * 0.08,
        backgroundColor: Colors.WHITE,
        flex: 1,
      }}
    >
      <Text
        style={{
          fontSize: width * 0.085,
          fontFamily: "outfitBold",
          marginTop: height * 0.02,
        }}
      >
        Select Concert Date
      </Text>

      <View style={{ marginTop: height * 0.025, flex: 1 }}>
        <FlatList
          data={concertDates}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedOption(item)}
              style={{ marginVertical: height * 0.012 }}
            >
              <OptionCard option={item as any} selectedOption={selectedOption as any} />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity
          onPress={onClickContinue}
          disabled={!selectedOption}
          style={{
            paddingVertical: height * 0.02,
            backgroundColor: selectedOption ? Colors.PRIMARY : "#ccc",
            borderRadius: width * 0.04,
            marginTop: height * 0.035,
            marginBottom: height * 0.035,
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
    </View>
  );
}
