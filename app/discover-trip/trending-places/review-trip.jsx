import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import React, { useContext, useEffect } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "../../../constants/Colors";
import moment from "moment";
import { useVideoPlayer, VideoView } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import { TrendingTripContext } from "../../../context/TrendingTripContext";

const { width, height } = Dimensions.get("window");

export default function ReviewTrip() {
  const navigation = useNavigation();
  const router = useRouter();
  const { trendingData, setTrendingData } = useContext(TrendingTripContext);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "",
    });
  }, []);

  const itemFontSize = width * 0.045;
  const valueFontSize = width * 0.05;
  const iconSize = width * 0.08;
  const headingFontSize = width * 0.07;


  const reviewItems = [
    {
      icon: "📍",
      label: "Destination",
      value: trendingData?.locationInfo?.title,
    },
    {
      icon: (
        <Ionicons
          name="repeat-outline"
          size={iconSize}
          color={Colors.PRIMARY}
        />
      ),
      label: "Trip Type",
      value: trendingData?.tripType,
    },
    {
      icon: <Ionicons name="person" size={iconSize} color={Colors.PRIMARY} />,
      label: "Traveler",
      value: trendingData?.traveler?.title,
    },
    {
      icon: "📅",
      label: "Travel Dates",
      value:
        `${moment(trendingData?.startDate).format("DD MMM")} To ` +
        `${moment(trendingData?.endDate).format("DD MMM")} ` +
        `(${trendingData?.totalDays} days)`,
    },
    {
      icon: "💰",
      label: "Budget",
      value: trendingData?.budget,
    },
  ];

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: Colors.WHITE,
        padding: width * 0.06,
        paddingTop: height * 0.12,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text
        style={{
          fontSize: headingFontSize,
          fontFamily: "outfitBold",
          marginBottom: height * 0.01,
        }}
      >
        Review Your Trip
      </Text>

      {reviewItems.map((item, idx) => (
        <View
          key={idx}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F9F9F9",
            padding: width * 0.04,
            borderRadius: width * 0.04,
            marginBottom: height * 0.015,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <View
            style={{
              width: width * 0.12,
              height: width * 0.12,
              borderRadius: (width * 0.12) / 2,
              backgroundColor: "#E8F0FE",
              justifyContent: "center",
              alignItems: "center",
              marginRight: width * 0.04,
            }}
          >
            <Text style={{ fontSize: iconSize * 0.8 }}>{item.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "outfitMedium",
                fontSize: itemFontSize,
                color: Colors.GRAY,
                marginBottom: 4,
              }}
            >
              {item.label}
            </Text>
            <Text
              style={{
                fontFamily: "outfitBold",
                fontSize: valueFontSize,
                color: Colors.BLACK,
              }}
            >
              {item.value}
            </Text>
          </View>
        </View>
      ))}

      <TouchableOpacity
        onPress={() => router.replace("discover-trip/trending-places/generate-trip")}
        style={{
          paddingVertical: height * 0.02,
          backgroundColor: Colors.PRIMARY,
          borderRadius: width * 0.04,
          marginTop: height * 0.025,
          marginBottom: height * 0.45,
          shadowColor: Colors.PRIMARY,
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 3,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            color: Colors.WHITE,
            fontFamily: "outfitMedium",
            fontSize: valueFontSize,
          }}
        >
          Build My Trip 💫
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
