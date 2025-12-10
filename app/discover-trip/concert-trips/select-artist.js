import {
  View,
  Text,
  Dimensions,
  TextInput,
  Image,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "../../../constants/Colors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { ConcertTripContext } from "../../../context/ConcertTripContext";
import { CONCERT_LOCATION_DATE_PROMPT } from "../../../constants/Options";
import { generateTripPlan } from "../../../config/AiModel";

const { width, height } = Dimensions.get("window");

const singerImages = [
  require("../../../assets/images/concert-trips/anirudh.webp"),
  require("../../../assets/images/concert-trips/dua.jpg"),
  require("../../../assets/images/concert-trips/rahman.webp"),
  require("../../../assets/images/concert-trips/jonita.jpg"),
  require("../../../assets/images/concert-trips/weeknd.jpg"),
  require("../../../assets/images/concert-trips/shreya.webp"),
  require("../../../assets/images/concert-trips/arjit.webp"),
  require("../../../assets/images/concert-trips/sabrina.jpg"),
  require("../../../assets/images/concert-trips/miley.jpg"),
];

const chunkIntoRows = (array, numRows) => {
  const rows = Array.from({ length: numRows }, () => []);
  array.forEach((item, index) => {
    rows[index % numRows].push(item);
  });
  return rows;
};

export default function ConcertTrip() {
  const navigation = useNavigation();
  const router = useRouter();
  const [artist, setArtist] = useState("");
  const [loading, setLoading] = useState(false);
  const { concertData, setConcertData } = useContext(ConcertTripContext);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: " ",
    });
  }, []);

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

  const TICKETMASTER_API_KEY = "7v3hGscLvwP79lI2D0vuvIYW4mhngrRG";
  const fetchConcertsFromTicketmaster = async (artistName) => {
    try {
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_API_KEY}&keyword=${encodeURIComponent(
        artistName
      )}&classificationName=music`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data._embedded?.events) {
        return [];
      }

      const events = data._embedded.events.map((event, index) => ({
        id: event.id || index + 1,
        concertCity: event._embedded?.venues?.[0]?.city?.name || "Unknown City",
        venueName: event._embedded?.venues?.[0]?.name || "Unknown Venue",
        venueAddress:
          event._embedded?.venues?.[0]?.address?.line1 || "Unknown Address",
        concertDate: event.dates?.start?.localDate || "TBA",
        concertImageURL:
          event.images?.[0]?.url ||
          "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg",
        ticketPrice: event.priceRanges?.[0]
          ? `$${event.priceRanges[0].min} - $${event.priceRanges[0].max}`
          : "Not available",
        geoCoordinates: event._embedded?.venues?.[0]?.location || null,

        title: event._embedded?.venues?.[0]?.city?.name || "Unknown City",
        desc: `${event._embedded?.venues?.[0]?.name || "Unknown Venue"} on ${
          event.dates?.start?.localDate || "TBA"
        }`,

        fullData: event,
      }));

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



  const imageRows = chunkIntoRows(singerImages, 3);
  const imageWidth = width * 0.35;
  const imageGap = 10;

  return (
    <View
      style={{
        padding: width * 0.06,
        paddingTop: height * 0.12,
        backgroundColor: Colors.WHITE,
        flex: 1,
      }}
    >
      <Text
        style={{
          fontSize: width * 0.085,
          fontFamily: "outfitBold",
          marginTop: height * 0.01,
        }}
      >
        Concert Trip
      </Text>

      <TextInput
        style={{
          height: height * 0.06,
          borderColor: Colors.GRAY,
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: width * 0.04,
          fontSize: width * 0.04,
          marginTop: height * 0.01,
        }}
        value={artist}
        onChangeText={setArtist}
        placeholder="Type artist name here"
        placeholderTextColor={Colors.PRIMARY}
      />

      <View
        style={{
          marginTop: height * 0.03,
          height: height * 0.6,
          justifyContent: "space-between",
        }}
      >
        {imageRows.map((rowImages, rowIndex) => {
          const loopImages = [...rowImages, ...rowImages];
          const totalWidth = loopImages.length * (imageWidth + imageGap);
          const translateX = useSharedValue(0);

          useEffect(() => {
            translateX.value = withRepeat(
              withTiming(-totalWidth / 2, {
                duration: 18000 + rowIndex * 3000,
                easing: Easing.linear,
              }),
              -1,
              false
            );
          }, []);

          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ translateX: translateX.value }],
          }));

          return (
            <View
              key={rowIndex}
              style={{
                overflow: "hidden",
                height: height * 0.18,
                marginBottom: 12,
              }}
            >
              <Animated.View style={[{ flexDirection: "row" }, animatedStyle]}>
                {loopImages.map((imgSrc, imgIndex) => (
                  <Image
                    key={`${rowIndex}-${imgIndex}`}
                    source={imgSrc}
                    style={{
                      width: imageWidth,
                      height: height * 0.18,
                      borderRadius: 12,
                      resizeMode: "cover",
                      marginRight: imageGap,
                    }}
                  />
                ))}
              </Animated.View>
            </View>
          );
        })}

        {artist.trim().length > 2 && (
          <TouchableOpacity
            onPress={async () => {
              if (loading) return;

              setLoading(true);
              let options = await fetchConcertsFromTicketmaster(artist);
              if (options.length === 0) {
                options = await fetchConcertLocations(artist); 
              }

              setLoading(false);

              if (options.length > 0) {
                router.push("/discover-trip/concert-trips/select-place");
              } else {
                ToastAndroid.show(
                  "No concerts found. Try another artist.",
                  ToastAndroid.SHORT
                );
              }
            }}
            style={{
              paddingVertical: height * 0.02,
              backgroundColor: Colors.PRIMARY,
              borderRadius: width * 0.04,
              marginTop: height * 0.01,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.WHITE} />
            ) : (
              <Text
                style={{
                  textAlign: "center",
                  color: Colors.WHITE,
                  fontFamily: "outfitMedium",
                  fontSize: width * 0.05,
                  marginTop: 8,
                }}
              >
                Continue
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
