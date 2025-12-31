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
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { ConcertTripContext } from "../../../context/ConcertTripContext";
import {
  CONCERT_LOCATION_DATE_PROMPT, singerOptions} from "../../../constants/Options";
import { generateTripPlan } from "../../../config/AiModel";
import Constants from "expo-constants";

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

  const cleanAiResponse = (rawText) => {
    return rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
  };

  const fetchConcertLocations = async (artistName) => {
    const today = new Date().toISOString().split("T")[0];
    const prompt = CONCERT_LOCATION_DATE_PROMPT.replace(
      /{artist}/g,
      artistName
    ).replace(/{date}/g, today);

    try {
      const response = await generateTripPlan(prompt);
      const clean = cleanAiResponse(response);
      const concerts = JSON.parse(clean);

      const concertOptions = concerts.map((concert, index) => ({
        id: index + 1,
        title: concert.concertCity,
        desc: `${concert.venueName} on ${concert.concertDate}`,
        date: concert.concertDate,
        venue: concert.venueName,
        image: concert.concertImageURL,
        fullData: concert,
      }));

      setConcertData((prev) => ({
        ...prev,
        artist: artistName,
        locationOptions: concertOptions,
      }));

      return concertOptions;
    } catch (error) {
      console.error("Concert fetch error:", error);
      ToastAndroid.show("Could not fetch concert info", ToastAndroid.LONG);
      return [];
    }
  };

  const TICKETMASTER_API_KEY = Constants.expoConfig.extra.TICKETMASTER_API_KEY;
  const fetchConcertsFromTicketmaster = async (artistName) => {
    try {
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_API_KEY}&keyword=${encodeURIComponent(
        artistName
      )}&classificationName=music`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data._embedded?.events) return [];

      const events = data._embedded.events.map((event) => {
        const highResImage =
          event.images.find(
            (img) => img.ratio === "16_9" && img.width > 1000
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
      console.error("Ticketmaster fetch error:", err);
      return [];
    }
  };

  const onSelectArtist = async (name) => {
    if (loading) return;
    setArtist(name);
    setLoading(true);

    let options = await fetchConcertsFromTicketmaster(name);

    if (options.length === 0) {
      options = await fetchConcertLocations(name);
    }
    setLoading(false);

    if (options.length > 0) {
      router.push("/discover-trip/concert-trips/select-place");
    } else {
      ToastAndroid.show(
        "No concerts found. Try another artist.",
        ToastAndroid.LONG
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
                  { fontSize: item.title.length > 12 ? 13 : 16 }
                  ]}>{item.title}</Text>
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
            <Text style={[ 
              styles.continueText,
              { fontSize: artist.trim().length > 12 ? 13 : 16 }
              ]}>Search "{artist}"</Text>
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
