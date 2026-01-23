import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "../../../constants/Colors";
import { SelectTravelerList } from "../../../constants/Options";
import OptionCard from "../../../components/CreateTrip/OptionCard";
import { CommonTripContext } from "../../../context/CommonTripContext";

const { width, height } = Dimensions.get("window");

export default function SelectTraveler() {
  const navigation = useNavigation();
  const router = useRouter();
  const [selectedTraveler, setSelectedTraveler] = useState(null);
  const { setTripDetails } = useContext(CommonTripContext);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "Travelers",
    });
  }, []);

  const handleContinue = () => {
    if (selectedTraveler) {
      const { icon, ...safeTraveler } = selectedTraveler;

      setTripDetails((prev) => ({
        ...prev,
        traveler: safeTraveler,
      }));

      router.push("/discover-trip/trip-manager/select-dates");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Who's Traveling</Text>

      <View style={{ marginTop: height * 0.01, flex: 1 }}>
        <Text style={styles.subHeading}>Choose your traveler's</Text>

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
        style={[
          styles.continueButton,
          { backgroundColor: selectedTraveler ? Colors.PRIMARY : "#ccc" }
        ]}
        disabled={!selectedTraveler}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: width * 0.06,
    paddingTop: height * 0.1,
    backgroundColor: Colors.WHITE,
    flex: 1,
  },
  heading: {
    fontSize: width * 0.075,
    fontFamily: "outfitBold",
    marginTop: height * 0.01,
  },
  subHeading: {
    fontFamily: "outfitBold",
    fontSize: width * 0.05,
    marginBottom: height * 0.01,
  },
  continueButton: {
    paddingVertical: height * 0.02,
    borderRadius: width * 0.04,
    marginTop: height * 0.02,
    marginBottom: height * 0.025,
  },
  buttonText: {
    textAlign: "center",
    color: Colors.WHITE,
    fontFamily: "outfitMedium",
    fontSize: width * 0.05,
  },
});