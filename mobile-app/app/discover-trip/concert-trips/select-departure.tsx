import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "@/src/constants/colors";
import LocationPicker from "@/src/components/trip/LocationPicker";
import TripTypeToggle from "@/src/components/trip/TripTypeToggle";
import { ConcertTripContext } from "@/src/context/ConcertTripContext";
import { LocationData, TripType } from "@/src/types/interfaces";

const { width, height } = Dimensions.get("window");

export default function SearchDeparture() {
  const navigation = useNavigation();
  const router = useRouter();
  const context = useContext(ConcertTripContext);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [tripType, setTripType] = useState<TripType>(TripType.Oneway);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "Departure",
    });
  }, []);

  const handleContinue = () => {
    if (!selectedLocation || !context) return;

    const { name, label, country, countryCode } = selectedLocation;
    const cleanedLocation = {
      name, label, country, countryCode,
      coordinates: selectedLocation.coordinates
    };

    const destinationCode = context.concertData?.locationInfo?.countryCode?.toLowerCase();
    const departureCode = selectedLocation?.countryCode?.toLowerCase();

    const isIntl =
      departureCode && destinationCode
        ? departureCode !== destinationCode
        : false;

    context.setConcertData({
      ...context.concertData,
      departureInfo: cleanedLocation as any,
      tripType: tripType,
      isInternational: isIntl,
    });

    router.push("/discover-trip/concert-trips/select-traveler" as any);
  };

  if (!context) return null;

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
