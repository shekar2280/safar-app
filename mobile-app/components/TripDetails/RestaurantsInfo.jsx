import { View, Text, ScrollView, Image, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { Colors } from "../../constants/Colors";
import Constants from "expo-constants";

export default function RestaurantsInfo({ restaurantsInfo }) {
  const [experienceImage, setExperienceImage] = useState(null);
  const [restaurantImage, setRestaurantImage] = useState(null);
  const UNSPLASH_API_KEY = Constants.expoConfig?.extra?.UNSPLASH_API_KEY;

  const getCityFoodKeyword = (cityName) => {
    const map = {
      delhi: "chole bhature professionally plated",
      mumbai: "vada pav aesthetic food photography",
      hyderabad: "biryani food styling",
      kolkata: "puchka street food colorful",
      chennai: "idli sambar food flatlay",
      jaipur: "rajasthani food presentation",
      bangalore: "masala dosa vibrant food photo",
      goa: "goan seafood beach food aesthetic",
      varanasi: "kachaudi sabzi spiritual food photography",
      amritsar: "amritsari kulcha punjabi food styling",
      default: "food PHOTOGRAPHY",
    };

    if (!cityName) return "indian street food";

    let cleanCity = cityName.split(",")[0].trim().toLowerCase();

    if (cleanCity === "new delhi") cleanCity = "delhi";

    return map[cleanCity] || cleanCity + " food";
  };

  const fetchUnsplashImage = async (query) => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          query
        )}&per_page=2&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_API_KEY}`,
          },
        }
      );
      const data = await response.json();
      return data?.results?.[0]?.urls?.small || null;
    } catch (error) {
      console.error("Unsplash fetch error:", query, error);
      return null;
    }
  };

  useEffect(() => {
    const loadImages = async () => {
      if (restaurantsInfo?.localExperiences?.length > 0 && !experienceImage) {
        const keyword =
          restaurantsInfo.localExperiences[0]?.experienceName ||
          restaurantsInfo.localExperiences[0]?.name;
        const img = await fetchUnsplashImage(keyword);
        setExperienceImage(img);
      }

      if (restaurantsInfo?.restaurants?.length > 0 && !restaurantImage) {
        if (restaurantsInfo.cityName) {
          const keyword = getCityFoodKeyword(restaurantsInfo.cityName);
          const img = await fetchUnsplashImage(keyword);
          setRestaurantImage(img);
        } else {
          setRestaurantImage(null);
        }
      }
    };

    loadImages();
  }, [restaurantsInfo]);

  const renderItems = (items) =>
    items.map((item, idx) => (
      <View key={idx} style={styles.itemContainer}>
        <Text style={styles.itemTitle}>
          {item.name || item.restaurantName || item.experienceName || "Unknown"}
        </Text>
        {item.description && (
          <Text style={styles.itemDesc}>{item.description}</Text>
        )}
        {item.priceRange && (
          <Text style={styles.itemPrice}>
            Price Range:
            <Text
              style={[
                item.priceRange === "Budget"
                  ? { color: "green" }
                  : item.priceRange === "Moderate"
                  ? { color: "orange" }
                  : { color: "red" },
              ]}
            >
              {item.priceRange}
            </Text>
          </Text>
        )}
      </View>
    ));

  if (!restaurantsInfo) {
    return (
      <View style={{ padding: 15 }}>
        <Text style={{ fontSize: 18, fontFamily: "outfit" }}>
          ❗ No restaurant information available.
        </Text>
      </View>
    );
  }

  const { localExperiences = [], restaurants = [] } = restaurantsInfo;

  return (
    <View style={{ marginBottom: 10 }}>
      {/* 🌟 Local Experiences */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>🌟 Local Experiences</Text>
        <Image
          source={
            experienceImage
              ? { uri: experienceImage }
              : require("../../assets/images/default-experience.jpg")
          }
          style={styles.sectionImage}
          resizeMode="cover"
        />

        {localExperiences.length ? (
          renderItems(localExperiences)
        ) : (
          <Text style={styles.emptyText}>No local experiences available.</Text>
        )}
      </View>

      {/* 🍴 Restaurants */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>🍴 Restaurants</Text>
        <Image
          source={
            restaurantImage
              ? { uri: restaurantImage }
              : require("../../assets/images/default-food.jpg")
          }
          style={styles.sectionImage}
          resizeMode="cover"
        />

        {restaurants.length ? (
          renderItems(restaurants)
        ) : (
          <Text style={styles.emptyText}>No restaurant data available.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 12,
    padding: 12,
    backgroundColor: Colors.WHITE,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: "outfitBold",
    marginBottom: 10,
    color: Colors.PRIMARY,
  },
  sectionImage: {
    width: "100%",
    height: 200,
    marginBottom: 10,
    borderRadius: 20,
  },
  itemContainer: {
    marginBottom: 15,
    backgroundColor: Colors.LIGHT_GRAY,
    borderRadius: 10,
    padding: 10,
  },
  itemTitle: {
    fontSize: 18,
    fontFamily: "outfitBold",
    color: Colors.PRIMARY,
    marginBottom: 4,
  },
  itemDesc: {
    fontFamily: "outfit",
    marginBottom: 4,
    color: Colors.GRAY,
  },
  itemPrice: {
    fontFamily: "outfit",
    fontStyle: "italic",
    color: Colors.PRIMARY,
  },
  emptyText: {
    fontFamily: "outfit",
    color: Colors.GRAY,
  },
});
