import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
  Dimensions,
} from "react-native";
import { Colors } from "../../constants/Colors";

const { width } = Dimensions.get("window");

const LOCAL_HOTEL_IMAGES = [
  require("../../assets/images/hotel-images/hotel_image_1.jpg"),
  require("../../assets/images/hotel-images/hotel_image_2.jpg"),
  require("../../assets/images/hotel-images/hotel_image_3.jpg"),
  require("../../assets/images/hotel-images/hotel_image_4.jpg"),
  require("../../assets/images/hotel-images/hotel_image_5.jpg"),
  require("../../assets/images/hotel-images/hotel_image_6.jpg"),
  require("../../assets/images/hotel-images/hotel_fallback.jpg"),
];

const IMAGE_COUNT = LOCAL_HOTEL_IMAGES.length - 1;

export default function HotelInfo({ hotelData }) {
  const handleBooking = (url) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open URL:", err)
      );
    }
  };

  if (!Array.isArray(hotelData) || hotelData.length === 0) {
    return (
      <View style={{ marginTop: 20, padding: 10 }}>
        <Text style={{ fontSize: 18, fontFamily: "outfitBold" }}>
          🏨 Hotels
        </Text>
        <Text style={{ fontFamily: "outfit", color: Colors.GRAY }}>
          No hotel data available.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 20 }}>
      <Text
        style={{
          fontSize: 20,
          fontFamily: "outfitBold",
          marginLeft: 10,
        }}
      >
        🏨 Hotels
      </Text>
      <Text
        style={{
          fontSize: 12,
          fontFamily: "outfit",
          marginBottom: 10,
          marginLeft: 10,
        }}
      >
        {" "}
        (Note: Images shown dont represent the actual hotel images)
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {hotelData.map((hotel, index) => (
          <View
            key={index}
            style={{
              width: width * 0.6,
              marginRight: 15,
              borderWidth: 2,
              borderColor: Colors.LIGHT_GRAY,
              borderRadius: 15,
              padding: 10,
              backgroundColor: "#fff",
              marginLeft: index === 0 ? 10 : 0,
            }}
          >
            <Image
              source={
                LOCAL_HOTEL_IMAGES[index % IMAGE_COUNT]
              }
              style={{
                width: "100%",
                height: 120,
                borderRadius: 10,
                marginBottom: 10,
              }}
              resizeMode="cover"
            />

            <Text
              style={{
                fontSize: 16,
                fontFamily: "outfitBold",
                marginBottom: 2,
              }}
            >
              {hotel.hotelName}
            </Text>

            <Text
              style={{
                fontSize: 14,
                fontFamily: "outfit",
                color: Colors.GRAY,
              }}
            >
              {hotel.hotelAddress}
            </Text>

            <Text
              style={{
                fontSize: 14,
                fontFamily: "outfit",
                marginTop: 5,
              }}
            >
              ⭐ Rating: {hotel.rating}
            </Text>

            <Text
              style={{
                fontSize: 14,
                fontFamily: "outfit",
              }}
            >
              💵 ₹{hotel.pricePerNight}/night
            </Text>

            <Text
              style={{
                fontSize: 14,
                fontFamily: "outfit",
                marginVertical: 5,
                color: Colors.GRAY,
              }}
            >
              {hotel.description}
            </Text>

            {hotel.bookingURL && (
              <TouchableOpacity
                style={{
                  backgroundColor: Colors.PRIMARY,
                  paddingVertical: 6,
                  borderRadius: 7,
                  marginTop: 5,
                }}
                onPress={() => handleBooking(hotel.bookingURL)}
              >
                <Text
                  style={{
                    color: Colors.WHITE,
                    textAlign: "center",
                    fontFamily: "outfitMedium",
                  }}
                >
                  Book Hotel
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
