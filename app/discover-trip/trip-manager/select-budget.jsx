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
import { SelectBudgetOptions } from "../../../constants/Options";
import OptionCard from "../../../components/CreateTrip/OptionCard";
import { CommonTripContext } from "../../../context/CommonTripContext";

const { width, height } = Dimensions.get("window");

export default function SelectBudget() {
  const navigation = useNavigation();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState();
  const { setTripDetails } = useContext(CommonTripContext);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "",
    });
  }, []);

  useEffect(() => {
    if (selectedOption) {
      setTripDetails((prev) => ({
        ...prev,
        budget: selectedOption.title,
      }));
    }
  }, [selectedOption]);

  const onClickContinue = () => {
    if (!selectedOption) {
      ToastAndroid.show("Select Your Budget", ToastAndroid.LONG);
      return;
    }
    router.push("/discover-trip/trip-manager/review-trip");
  };

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
          marginTop: height * 0.02,
        }}
      >
        Select Budget
      </Text>

      <View style={{ marginTop: height * 0.025, flex: 1 }}>
        <Text
          style={{
            fontFamily: "outfitBold",
            fontSize: width * 0.05,
            marginBottom: height * 0.015,
          }}
        >
          Choose your Budget Range
        </Text>

        <FlatList
          data={SelectBudgetOptions}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedOption(item)}
              style={{ marginVertical: height * 0.012 }}
            >
              <OptionCard option={item} selectedOption={selectedOption} />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.title}
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
            marginBottom: height * 0.045,
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
