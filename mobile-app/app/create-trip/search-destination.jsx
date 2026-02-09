import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { CreateTripContext } from "../../context/CreateTripContext";
import TripTypeToggle from "../../components/CreateTrip/TripTypeToggle";
import DestinationPicker from "../../components/CreateTrip/DestinationPicker";

const { width, height } = Dimensions.get("window");

export default function SearchDestination() {
  const navigation = useNavigation();
  const router = useRouter();
  const { tripData, setTripData } = useContext(CreateTripContext);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [tripType, setTripType] = useState("Oneway");

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "Destination",
    });
  }, []);

  const handleContinue = () => {
    if (!selectedLocation) return;

    const departureCode = tripData?.departureInfo?.countryCode?.toLowerCase();
    const destinationCode = selectedLocation?.countryCode?.toLowerCase();

    const isIntl =
      departureCode && destinationCode
        ? departureCode !== destinationCode
        : false;

    setTripData((prev) => ({
      ...prev,
      destinationInfo: selectedLocation,
      tripType: tripType,
      isInternational: isIntl,
    }));

    router.push("/create-trip/select-traveler");
  };

  return (
    <View style={styles.container}>
      <TripTypeToggle
        selectedType={tripType}
        onSelectType={(type) => setTripType(type)}
      />

      <View style={{ zIndex: 1000, elevation: 1000, height: 70 }}>
        <DestinationPicker
          onLocationSelect={(loc) => setSelectedLocation(loc)}
        />
      </View>

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
  title: {
    fontSize: 28,
    fontFamily: "outfitBold",
    marginBottom: 20,
  },
  continueBtn: {
    position: "absolute",
    bottom: 40,
    left: width * 0.06,
    right: width * 0.06,
    backgroundColor: "black",
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 35,
  },
  disabledBtn: { opacity: 0.5 },
  continueText: { fontSize: 18, fontFamily: "outfitBold", color: "white" },
});
