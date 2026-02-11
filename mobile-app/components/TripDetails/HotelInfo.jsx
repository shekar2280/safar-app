import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image"; 
import { Colors } from "../../constants/Colors";
import { LOCAL_HOTEL_IMAGES } from "../../constants/Options";

const { width } = Dimensions.get("window");

const getOptimizedCloudinaryUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_500,h_300,c_fill/");
};

export default function HotelInfo({ hotelData, cityName }) {
  const openHotelInMaps = (city) => {
    const query = encodeURIComponent(`Hotels in ${city}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;

    Linking.openURL(url).catch((err) => {
      console.error("Linking Error:", err);
      Alert.alert("Error", "Could not open maps.");
    });
  };

  if (!Array.isArray(hotelData) || hotelData.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.outlineContainer}>
        <View style={styles.labelWrapper}>
          <Text style={styles.outlineLabel}>HOTEL DETAILS</Text>
        </View>

        <View style={{ marginBottom: 15, paddingRight: 10 }}>
          <Text
            style={styles.sectionTitle}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            Nearby Stays in {cityName}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 5 }}
        >
          {hotelData.map((hotel, index) => (
            <HotelCard
              key={index}
              hotel={hotel}
              index={index}
              cityName={cityName}
              onOpenMaps={() => openHotelInMaps(cityName)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const HotelCard = ({ hotel, index, cityName, onOpenMaps }) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const imageUri = LOCAL_HOTEL_IMAGES[index % LOCAL_HOTEL_IMAGES.length];

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: getOptimizedCloudinaryUrl(imageUri) }}
          style={styles.cardImage}
          onLoadEnd={() => setIsImageLoading(false)}
        />
        {isImageLoading && (
          <ActivityIndicator style={styles.loader} color={Colors.PRIMARY} />
        )}
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>
            {hotel.price ? `₹${hotel.price}` : "Check Price"}
          </Text>
        </View>
      </View>

      <View style={{ padding: 15 }}>
        <View style={styles.cardHeader}>
          <Text numberOfLines={1} style={styles.hotelName}>
            {hotel.hotelName}
          </Text>
          <View style={styles.ratingBox}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.ratingText}>{hotel.rating}</Text>
          </View>
        </View>

        <Text numberOfLines={1} style={styles.address}>
          📍 {hotel.hotelAddress || cityName}
        </Text>

        <Text numberOfLines={2} style={styles.description}>
          {hotel.description || hotel.shortDescription}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.mapButton}
          onPress={onOpenMaps}
        >
          <Text style={styles.mapButtonText}>View on Maps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginTop: 25 },
  outlineContainer: {
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 22,
    padding: 15,
    paddingTop: 25,
  },
  labelWrapper: {
    position: "absolute",
    top: -12,
    left: 20,
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 10,
  },
  outlineLabel: {
    fontFamily: "outfitBold",
    fontSize: 12,
    color: Colors.PRIMARY,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "outfitBold",
    color: "#1A1A1A",
    lineHeight: 24,
    flexWrap: "wrap",
  },
  card: {
    width: width * 0.5,
    marginRight: 15,
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  imageContainer: { width: "100%", height: 140, backgroundColor: "#F0F0F0" },
  cardImage: { width: "100%", height: "100%" },
  loader: { position: "absolute", alignSelf: "center", top: "40%" },
  priceTag: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: { fontFamily: "outfitBold", fontSize: 13 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hotelName: { fontSize: 16, fontFamily: "outfitBold", flex: 1 },
  ratingBox: { flexDirection: "row", alignItems: "center" },
  star: { fontFamily: "outfitMedium", color: "#FFB300" },
  ratingText: { fontFamily: "outfit", fontSize: 12, marginLeft: 3 },
  address: {
    fontSize: 12,
    fontFamily: "outfit",
    color: Colors.GRAY,
    marginTop: 2,
  },
  description: {
    fontSize: 12,
    fontFamily: "outfit",
    color: "#666",
    marginTop: 8,
    lineHeight: 16,
    height: 32,
  },
  mapButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 15,
  },
  mapButtonText: {
    color: "white",
    textAlign: "center",
    fontFamily: "outfitBold",
    fontSize: 13,
  },
});
