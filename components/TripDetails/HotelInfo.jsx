import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { LOCAL_HOTEL_IMAGES } from "../../constants/Options";

const { width } = Dimensions.get("window");

const getOptimizedCloudinaryUrl = (url) => {
  if (!url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_500,h_300,c_fill/");
};

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
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontFamily: "outfitBold" }}>🏨 Hotels</Text>
        <Text style={{ fontFamily: "outfit", color: Colors.GRAY }}>No hotels found.</Text>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 25 }}>
      <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
        <Text style={{ fontSize: 22, fontFamily: "outfitBold", color: "#1A1A1A" }}>
          Nearby Stays
        </Text>
        <Text style={{ fontSize: 13, fontFamily: "outfit", color: Colors.GRAY }}>
          Curated hotels based on your preferences
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 20, paddingRight: 5 }}
      >
        {hotelData.map((hotel, index) => (
          <HotelCard 
            key={index} 
            hotel={hotel} 
            index={index} 
            onBook={handleBooking} 
          />
        ))}
      </ScrollView>
    </View>
  );
}

const HotelCard = ({ hotel, index, onBook }) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const imageUri = LOCAL_HOTEL_IMAGES[index % (LOCAL_HOTEL_IMAGES.length - 1)];

  return (
    <View style={{
      width: width * 0.75,
      marginRight: 15,
      borderRadius: 20,
      backgroundColor: "#fff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      marginBottom: 20,
      overflow: 'hidden'
    }}>
      <View style={{ width: "100%", height: 160, backgroundColor: "#F0F0F0" }}>
        <Image
          source={{ uri: getOptimizedCloudinaryUrl(imageUri) }}
          style={{ width: "100%", height: "100%" }}
          onLoadEnd={() => setIsImageLoading(false)}
        />
        
        {isImageLoading && (
          <ActivityIndicator 
            style={{ position: "absolute", alignSelf: 'center', top: '40%' }} 
            color={Colors.PRIMARY} 
          />
        )}
        <View style={{
          position: 'absolute',
          top: 12,
          right: 12,
          backgroundColor: 'rgba(255,255,255,0.9)',
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 10
        }}>
          <Text style={{ fontFamily: 'outfitBold', fontSize: 14 }}>
            ₹{hotel.pricePerNight}
          </Text>
        </View>
      </View>

      <View style={{ padding: 15 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text numberOfLines={1} style={{ fontSize: 17, fontFamily: "outfitBold", flex: 1 }}>
            {hotel.hotelName}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'outfitMedium', color: '#FFB300' }}>★</Text>
            <Text style={{ fontFamily: 'outfit', fontSize: 13, marginLeft: 3 }}>{hotel.rating}</Text>
          </View>
        </View>

        <Text numberOfLines={1} style={{ fontSize: 13, fontFamily: "outfit", color: Colors.GRAY, marginTop: 2 }}>
          📍 {hotel.hotelAddress}
        </Text>

        <Text numberOfLines={2} style={{ 
          fontSize: 13, 
          fontFamily: "outfit", 
          color: "#666", 
          marginTop: 8,
          lineHeight: 18,
          height: 36
        }}>
          {hotel.description}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            backgroundColor: Colors.PRIMARY,
            paddingVertical: 12,
            borderRadius: 12,
            marginTop: 15,
          }}
          onPress={() => onBook(hotel.bookingURL)}
        >
          <Text style={{
            color: Colors.WHITE,
            textAlign: "center",
            fontFamily: "outfitBold",
            fontSize: 14
          }}>
            View Availability
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};