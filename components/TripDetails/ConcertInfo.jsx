import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Dimensions,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { Image } from "expo-image";

const { width, height } = Dimensions.get("window");

export default function ConcertInfo({ concertData }) {
  if (!concertData) return null;

  const InfoRow = ({ label, value }) => (
    <View style={{ flexDirection: "row", marginBottom: height * 0.012 }}>
      <Text
        style={{
          fontSize: width * 0.04,
          fontFamily: "outfitBold",
          color: Colors.PRIMARY,
          marginRight: 6,
        }}
      >
        {label}:
      </Text>
      <Text
        style={{
          fontSize: width * 0.04,
          fontFamily: "outfit",
          color: Colors.DARK,
          flexShrink: 1,
        }}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <View
      style={{
        marginTop: height * 0.025,
        borderWidth: 1.5,
        borderColor: Colors.LIGHT_GRAY,
        padding: width * 0.045,
        borderRadius: width * 0.04,
        backgroundColor: Colors.WHITE,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Text
        style={{
          fontSize: width * 0.055,
          fontFamily: "outfitBold",
          marginBottom: height * 0.02,
          color: Colors.DARK,
        }}
      >
        <Image
          source={require("../../assets/images/singer.png")}
          style={{ width: 30, height: 30 }}
          
        />{" "}
        Concert Details
      </Text>

      <InfoRow label="Date" value={concertData.concertDate} />
      <InfoRow label="Start Time" value={concertData.concertStartTime} />
      <InfoRow label="End Time" value={concertData.concertEndTime} />
      <InfoRow label="Ticket Price" value={concertData.ticketPrice} />
      <InfoRow label="Venue" value={concertData.venueName} />
      <InfoRow label="Address" value={concertData.venueAddress} />

      {concertData.bookingURL && (
        <TouchableOpacity
          onPress={() => Linking.openURL(concertData.bookingURL)}
          style={{
            marginTop: height * 0.02,
            backgroundColor: Colors.PRIMARY,
            paddingVertical: height * 0.012,
            borderRadius: width * 0.025,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: Colors.WHITE,
              fontFamily: "outfitBold",
              fontSize: width * 0.04,
            }}
          >
            Book Now
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
