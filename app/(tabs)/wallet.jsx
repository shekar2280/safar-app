import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useUser } from "../../context/UserContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ActiveTripCard from "../../components/WalletDetails/ActiveTripCard";

const { width, height } = Dimensions.get("window");

export default function Wallet() {
  const { userTrips, loading } = useUser();

  const boldFont = "outfitBold";
  const regularFont = "outfit";
  const mediumFont = "outfitMedium";

  const activeTrips = (userTrips || [])
    .filter((trip) => trip.isActive === true)
    .sort((a, b) => {
      const dateA = new Date(a.activatedAt || 0);
      const dateB = new Date(b.activatedAt || 0);
      return dateB - dateA; 
    });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: width * 0.04,
          paddingTop: height * 0.056,
          flexGrow: 1,
          backgroundColor: Colors.WHITE,
        }}
      >
        <Text
          style={{
            fontSize: width * 0.08,
            fontFamily: boldFont,
            color: Colors.BLACK,
            marginBottom: height * 0.01,
          }}
        >
          Active Trips
        </Text>

        {loading && (
          <ActivityIndicator
            size="large"
            color={Colors.PRIMARY}
            style={{ marginTop: height * 0.04 }}
          />
        )}

        {!loading && activeTrips.length === 0 && (
          <View style={{ marginTop: height * 0.1, alignItems: "center" }}>
            <MaterialCommunityIcons
              name="bag-checked"
              size={width * 0.2}
              color={Colors.GRAY}
            />
            <Text
              style={{
                fontFamily: mediumFont,
                fontSize: width * 0.05,
                color: Colors.GRAY,
                marginTop: height * 0.02,
              }}
            >
              You have no active trips.
            </Text>
            <Text
              style={{
                fontFamily: regularFont,
                fontSize: width * 0.04,
                color: Colors.GRAY,
                marginTop: height * 0.01,
                textAlign: "center",
              }}
            >
              Activate a trip from the "My Trips" details page to manage its
              expenses here.
            </Text>
          </View>
        )}

        <View style={{ marginTop: height * 0.01 }}>
          {activeTrips.map((trip) => (
            <ActiveTripCard key={trip.id} trip={trip} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
