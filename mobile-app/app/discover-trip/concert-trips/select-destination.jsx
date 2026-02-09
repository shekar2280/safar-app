import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ToastAndroid,
  Dimensions,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "../../../constants/Colors";
import { ConcertTripContext } from "../../../context/ConcertTripContext";
import OptionCard from "../../../components/CreateTrip/OptionCard";

const { width, height } = Dimensions.get("window");

const getDayBefore = (dateStr) => {
  if (!dateStr) return null;

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    return null;
  }

  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
};

export default function SelectDestination() {
  const navigation = useNavigation();
  const router = useRouter();
  const { concertData, setConcertData } = useContext(ConcertTripContext);

  const [selectedOption, setSelectedOption] = useState(null);
  const [concertDates, setConcertDates] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "",
    });
  }, []);

  useEffect(() => {
    if (concertData?.locationOptions?.length > 0) {
      const sortedOptions = [...concertData.locationOptions].sort((a, b) => {
        const dateA = new Date(a.concertDate);
        const dateB = new Date(b.concertDate);
        return dateA - dateB; // ascending
      });
      setConcertDates(sortedOptions);
    }
  }, [concertData.locationOptions]);

  const onClickContinue = () => {
  if (!selectedOption) {
    ToastAndroid.show("Select a concert date", ToastAndroid.LONG);
    return;
  }

  const selected = selectedOption;

  const updatedData = {
    ...concertData,
    destinationInfo: {
      title: selected.title,             
      venueName: selected.venueName,     
      venueAddress: selected.venueAddress,
      venueZip: selected.venueZip, 
      country : selected.country,
      countryCode: selected.countryCode,       
      concertDate: selected.concertDate,  
      concertTime: selected.concertTime, 
      imageUrl: selected.image,          
      bookingUrl: selected.bookingUrl,  
      coordinates: selected.coordinates, 
      priceRange: selected.priceRange,  
    },
    startDate: selected.concertDate !== "TBA" ? getDayBefore(selected.concertDate) : null,
    endDate: selected.concertDate !== "TBA" ? selected.concertDate : null,
  };

  setConcertData(updatedData);
  router.push("/discover-trip/concert-trips/select-departure"); 
};

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
              <OptionCard option={item} selectedOption={selectedOption} />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
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
