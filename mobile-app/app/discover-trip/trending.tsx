import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { Colors } from "@/src/constants/colors";
import DiscoverCard from "@/src/components/trip/DiscoverCard";
import { Ionicons } from "@expo/vector-icons";
import { apiPost } from "@/src/lib/api";
import { useUser } from "@/src/context/UserContext";

const { width, height } = Dimensions.get("window");

export default function TrendingTrips() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState<any[]>([]);
  const [currentCity, setCurrentCity] = useState("Your Location");
  
  const { userProfile } = useUser();

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      setLoading(true);
      
      let city = "Mumbai";
      let country = "India";
      
      if (userProfile?.homeLocation) {
        city = userProfile.homeLocation.name || "Mumbai";
        country = userProfile.homeLocation.country || "India";
      } else {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === "granted") {
            const location = await Location.getCurrentPositionAsync({});
            const reverse = await Location.reverseGeocodeAsync({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });

            if (reverse?.[0]) {
              city = reverse[0].city || reverse[0].region || "Mumbai";
              country = reverse[0].country || "India";
            }
          }
        } catch (locationError) {
          console.warn("Location fetch failed, using default:", locationError);
        }
      }

      setCurrentCity(city);

      const prompt = `Suggest a mix of 12 trending travel destinations (6 domestic within ${country} and 6 popular international spots) for someone currently in ${country}. 
      Return the result as a raw JSON array of objects with these keys: "name", "title", "country", "desc", "image_search_query". No markdown, no extra text.`;

      const res = (await apiPost("/api/trendingPlaces", { 
        trendingPlacesPrompt: prompt,
        country: country
      })) as any;
      
      const placesData = res.trendingPlaces;
      
      setPlaces(placesData.map((p: any, idx: number) => ({
        ...p,
        id: idx + 1,
      })));

    } catch (error) {
      console.error("Trending Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: any) => {
    router.push({
      pathname: "/create-trip",
      params: {
        destName: item.name,
        destCountry: item.country,
        destPhoto: item.image,
        insight: item.insight,
        recommendedMonth: item.recommended_month || item.recommendedMonth,
        tripCategory: "TRENDING",
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={Colors.PRIMARY} />
        </TouchableOpacity>
        <View>
          <Text style={styles.subtitle}>POPULAR NEAR {currentCity?.toUpperCase()}</Text>
          <Text style={styles.title}>Trending Trips</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.SECONDARY} />
          <Text style={styles.loaderText}>Mapping the world's pulse...</Text>
        </View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleSelect(item)}
              style={styles.cardContainer}
            >
              <DiscoverCard
                option={item}
                cardHeight={height * 0.20}
                hideTag={true}
              />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 15,
  },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontFamily: "outfitMedium",
    fontSize: 10,
    color: Colors.SECONDARY,
    letterSpacing: 2.5,
  },
  title: {
    fontFamily: "playfairBold",
    fontSize: 28,
    color: Colors.PRIMARY,
    marginTop: -2,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loaderText: {
    fontFamily: "outfit",
    fontSize: 14,
    color: Colors.MUTED_TEXT,
    marginTop: 15,
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 40,
  },
  cardContainer: {
    marginVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
});
