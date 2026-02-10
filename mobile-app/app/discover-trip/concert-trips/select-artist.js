import {
  View,
  Text,
  Dimensions,
  TextInput,
  Image,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "../../../constants/Colors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { ConcertTripContext } from "../../../context/ConcertTripContext";
import {
  singerOptions,
} from "../../../constants/Options";

const { width, height } = Dimensions.get("window");

export default function ConcertTrip() {
  const navigation = useNavigation();
  const router = useRouter();
  const [artist, setArtist] = useState("");
  const [loading, setLoading] = useState(false);
  const { concertData, setConcertData } = useContext(ConcertTripContext);

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(20);
  const searchBarOpacity = useSharedValue(0);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: " ",
    });

    headerOpacity.value = withTiming(1, { duration: 800 });
    headerTranslateY.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.exp),
    });

    searchBarOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
  }, []);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const animatedSearchStyle = useAnimatedStyle(() => ({
    opacity: searchBarOpacity.value,
    transform: [{ translateY: headerTranslateY.value * 0.5 }],
  }));

  const fetchConcerts = async (artistName) => {
    try {
      const CONCERT_FINDER_URL = process.env.EXPO_PUBLIC_CONCERT_FINDER_URL;
      const response = await fetch(
        `${CONCERT_FINDER_URL}?artistName=${encodeURIComponent(artistName)}`,
      );
      const eventsRaw = await response.json();

      if (!eventsRaw || eventsRaw.length === 0) return [];

      const events = eventsRaw.map((event) => {
        const highResImage =
          event.images.find(
            (img) => img.ratio === "16_9" && img.width > 1000,
          ) || event.images[0];
        const venue = event._embedded?.venues?.[0];

        return {
          id: event.id,
          artist: event.name,
          title: venue?.city?.name || "Unknown City",
          desc: `${venue?.name} on ${event.dates?.start?.localDate}`,
          image: highResImage?.url,
          venueName: venue?.name,
          venueAddress: venue?.address?.line1,
          country: venue?.country?.name,
          countryCode: venue?.country?.countryCode?.toLowerCase(),
          concertDate: event.dates?.start?.localDate,
          concertTime: event.dates?.start?.localTime,
          coordinates: {
            latitude: venue?.location?.latitude,
            longitude: venue?.location?.longitude,
          },
          bookingUrl: event.url,
          priceRange: event.priceRanges?.[0] || null,
          status: event.dates?.status?.code,
        };
      });

      setConcertData((prev) => ({
        ...prev,
        artist: artistName,
        locationOptions: events,
      }));

      return events;
    } catch (err) {
      console.error("Concert fetch error:", err);
      return [];
    }
  };

  const onSelectArtist = async (name) => {
    if (loading) return;
    setArtist(name);
    setLoading(true);

    let options = await fetchConcerts(name);

    setLoading(false);

    if (options.length > 0) {
      router.push("/discover-trip/concert-trips/select-destination");
    } else {
      ToastAndroid.show(
        "No concerts found. Try another artist.",
        ToastAndroid.LONG,
      );
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={animatedHeaderStyle}>
        <Text style={styles.headerTitle}>Concert Trip</Text>
        <View style={styles.headerAccent} />
      </Animated.View>

      <Animated.View style={animatedSearchStyle}>
        <TextInput
          style={styles.searchBar}
          value={artist}
          onChangeText={setArtist}
          placeholder="Type artist name here"
          placeholderTextColor={Colors.GRAY}
        />
      </Animated.View>

      <View style={{ flex: 1, marginTop: 20 }}>
        <Text style={styles.subHeader}>Popular Artists</Text>

        <FlatList
          data={singerOptions}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cardContainer}
              onPress={() => onSelectArtist(item.title)}
            >
              <View style={styles.card}>
                <Image source={item.image} style={styles.cardImage} />
                <View style={styles.imageOverlay} />
                <Text
                  style={[
                    styles.cardText,
                    { fontSize: item.title.length > 12 ? 13 : 16 },
                  ]}
                >
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {artist.trim().length > 2 && (
        <TouchableOpacity
          onPress={() => onSelectArtist(artist)}
          style={styles.continueButton}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.WHITE} />
          ) : (
            <Text
              style={[
                styles.continueText,
                { fontSize: artist.trim().length > 12 ? 13 : 16 },
              ]}
            >
              Search "{artist}"
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.12,
    backgroundColor: Colors.WHITE,
    flex: 1,
  },
  headerTitle: {
    fontSize: width * 0.085,
    fontFamily: "outfitBold",
  },
  subHeader: {
    fontFamily: "outfitMedium",
    fontSize: 18,
    marginBottom: 10,
    color: Colors.GRAY,
  },
  searchBar: {
    height: 55,
    borderColor: "#E5E5E5",
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    marginTop: 10,
    fontFamily: "outfit",
    backgroundColor: "#F9F9F9",
  },
  cardContainer: {
    flex: 1,
    margin: 8,
    height: height * 0.2,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  cardText: {
    position: "absolute",
    justifyContent: "center",
    alignContent: "center",
    bottom: 15,
    left: 30,
    color: "white",
    fontFamily: "outfitBold",
    fontSize: 16,
  },
  continueButton: {
    position: "absolute",
    bottom: 30,
    left: width * 0.06,
    right: width * 0.06,
    height: 60,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    marginBottom: 25,
  },
  continueText: {
    color: Colors.WHITE,
    fontFamily: "outfitMedium",
    fontSize: 18,
  },
});
