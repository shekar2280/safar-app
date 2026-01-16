import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import moment from "moment";
import { Colors } from "../../constants/Colors";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function ActiveTripCard({ trip }) {

  const router = useRouter();

  const tripImageSource = trip?.imageUrl
    ? { uri: trip.imageUrl }
    : require("../../assets/images/homepage.jpg");

  const tripName = trip?.concertData?.artist 
    ? `${trip.concertData.artist} Concert` 
    : (
      trip?.tripPlan?.tripName || 
      trip?.tripPlan?.tripMetadata?.location || 
      (trip?.savedTripId 
        ? trip.savedTripId.split('-')[0].charAt(0).toUpperCase() + trip.savedTripId.split('-')[0].slice(1) 
        : "Active Trip")
    );
  const tripStartDate = trip?.startDate || trip?.concertData?.startDate;

  const navigateToWalletDetails = () => {
    router.push({
      pathname: "/wallet-details",
      params: {
        trip: JSON.stringify(trip),
        tripId: trip.id,
      },
    });
  };

  return (
    <View
      style={{
        marginTop: height * 0.025,
        flexDirection: "row",
        gap: width * 0.025,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
          gap: width * 0.025,
        }}
        onPress={navigateToWalletDetails}
      >
        <Image
          source={tripImageSource}
          style={{
            width: width * 0.25,
            height: width * 0.25,
            borderRadius: width * 0.025,
          }}
        />

        <View style={{ flexShrink: 1 }}>
          <Text
            style={{
              fontFamily: "outfitBold",
              fontSize: width * 0.045,
              color: Colors.PRIMARY,
            }}
            numberOfLines={1}
          >
            {tripName || "No Trip Name"}
          </Text>
          <Text
            style={{
              fontFamily: "outfitMedium",
              fontSize: width * 0.035,
              color: Colors.GRAY,
            }}
          >
            {tripStartDate
              ? moment(tripStartDate).format("DD MMM YYYY")
              : "No Date"}
          </Text>
          <Text
            style={{
              fontFamily: "outfitMedium",
              fontSize: width * 0.035,
              color: Colors.GRAY,
            }}
          >
            Travelers: {trip?.traveler?.title || "1"}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={navigateToWalletDetails}
        style={{
          alignItems: "center",
          padding: 5,
          backgroundColor: Colors.PRIMARY_LIGHT,
          borderRadius: 8,
        }}
      >
        <Ionicons
          name="wallet"
          size={width * 0.06}
          color={Colors.PRIMARY}
        />
        <Text
          style={{
            fontFamily: "outfitMedium",
            fontSize: width * 0.035,
            color: Colors.PRIMARY,
            marginTop: 2,
          }}
        >
          Expenses
        </Text>
      </TouchableOpacity>
    </View>
  );
}
