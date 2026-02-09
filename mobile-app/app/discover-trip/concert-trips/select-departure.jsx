import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { CommonTripContext } from "../../../context/CommonTripContext";
import { Colors } from "../../../constants/Colors";
import LocationPicker from "../../../components/CreateTrip/LocationPicker";
import TripTypeToggle from "../../../components/CreateTrip/TripTypeToggle";
import { ConcertTripContext } from "../../../context/ConcertTripContext";

const { width, height } = Dimensions.get("window");

export default function SearchDeparture() {
  const navigation = useNavigation();
  const router = useRouter();
  const { concertData, setConcertData } = useContext(ConcertTripContext);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [tripType, setTripType] = useState("Oneway");

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "Departure",
    });
  }, []);

  const handleContinue = () => {
    if (!selectedLocation) return;

    const {name, label, country, countryCode } = selectedLocation;

    const cleanedLocation = {
      name, label, country, countryCode,
    };

    const destinationCode = concertData?.destinationInfo?.countryCode?.toLowerCase();
    const departureCode = selectedLocation?.countryCode?.toLowerCase();

    const isIntl =
      departureCode && destinationCode
        ? departureCode !== destinationCode
        : false;

    setConcertData((prev) => ({
      ...prev,
      departureInfo: cleanedLocation,
      tripType: tripType,
      isInternational: isIntl,
    }));

    router.push("/discover-trip/concert-trips/select-traveler");
  };

  return (
    <View style={styles.container}>
      <TripTypeToggle
        selectedType={tripType}
        onSelectType={(type) => setTripType(type)}
      />

      <LocationPicker
        title="Where are you starting from?"
        placeholder="Type city or airport..."
        onLocationChange={(loc) => setSelectedLocation(loc)}
      />

      <TouchableOpacity
        onPress={handleContinue}
        disabled={!selectedLocation}
        style={[styles.continueBtn, !selectedLocation && styles.disabledBtn]}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: width * 0.06,
    paddingTop: height * 0.12,
    backgroundColor: Colors.WHITE,
    flex: 1,
  },
  continueBtn: {
    position: "absolute",
    bottom: 40,
    left: width * 0.06,
    right: width * 0.06,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 35,
  },
  disabledBtn: {
    opacity: 0.5,
    backgroundColor: "#CCC",
  },
  continueText: {
    fontSize: 18,
    fontFamily: "outfitBold",
    color: "white",
  },
});
