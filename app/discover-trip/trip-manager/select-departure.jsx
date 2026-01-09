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

const { width, height } = Dimensions.get("window");

export default function SearchDeparture() {
  const navigation = useNavigation();
  const router = useRouter();
  const { setTripDetails } = useContext(CommonTripContext);
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

    setTripDetails((prev) => ({
      ...prev,
      departureInfo: selectedLocation,
      tripType: tripType,
    }));

    router.push("/discover-trip/trip-manager/select-traveler");
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
