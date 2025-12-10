import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import Constants from "expo-constants";
import { Colors } from "../../constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function HotelInfo({ hotelData }) {
  const UNSPLASH_API_KEY = Constants.expoConfig?.extra?.UNSPLASH_API_KEY;
  const [hotelImages, setHotelImages] = useState([]);

  const fetchHotelImages = async (count) => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=hotelRoom&per_page=${count}&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_API_KEY}`,
          },
        }
      );
      const data = await response.json();
      return data?.results?.map((result) => result?.urls?.small) || [];
    } catch (error) {
      console.error("Error fetching hotel images:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadImages = async () => {
      if (Array.isArray(hotelData) && hotelData.length > 0) {
        try {
          const cachedImages = await AsyncStorage.getItem("hotelImages");
          if (cachedImages) {
            setHotelImages(JSON.parse(cachedImages));
          } else {
            const images = await fetchHotelImages(hotelData.length);
            setHotelImages(images);
            await AsyncStorage.setItem("hotelImages", JSON.stringify(images));
          }
        } catch (err) {
          console.error("Error loading/saving images", err);
        }
      }
    };
    loadImages();
  }, [hotelData]);
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
              source={{
                uri:
                  hotelImages[index] ||
                  "https://via.placeholder.com/250x120?text=Hotel+Image",
              }}
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
