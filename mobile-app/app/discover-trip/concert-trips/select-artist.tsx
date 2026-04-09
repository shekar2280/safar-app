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
  Platform,
  Alert,
  StatusBar,
} from "react-native";
import React, { useState, useContext } from "react";
import { useRouter } from "expo-router";
import { Colors } from "@/src/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConcertTripContext } from "@/src/context/ConcertTripContext";
import { singerOptions } from "@/src/constants/travel-data";
import { ConcertEvent } from "@/src/types/interfaces";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

function showToast(message: string) {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert("", message);
  }
}

export default function ConcertTrip() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [artist, setArtist] = useState("");
  const [loading, setLoading] = useState(false);
  const context = useContext(ConcertTripContext);

  const fetchConcerts = async (artistName: string): Promise<ConcertEvent[]> => {
    try {
      const CONCERT_FINDER_URL = process.env.EXPO_PUBLIC_CONCERT_FINDER_URL;
      if (!CONCERT_FINDER_URL) return [];

      const response = await fetch(
        `${CONCERT_FINDER_URL}?artistName=${encodeURIComponent(artistName)}`,
      );
      const eventsRaw = await response.json();

      if (!eventsRaw || eventsRaw.length === 0) return [];

      const events: ConcertEvent[] = eventsRaw.map((event: any) => {
        const highResImage =
          event.images.find(
            (img: any) => img.ratio === "16_9" && img.width > 1000,
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
            latitude: parseFloat(venue?.location?.latitude || "0"),
            longitude: parseFloat(venue?.location?.longitude || "0"),
          },
          bookingUrl: event.url,
          priceRange: event.priceRanges?.[0] || null,
          status: event.dates?.status?.code,
        };
      });

      if (context) {
        context.setConcertData({
          ...context.concertData,
          artist: artistName,
          locationOptions: events,
        });
      }

      return events;
    } catch (err) {
      console.error("Concert fetch error:", err);
      return [];
    }
  };

  const onSelectArtist = async (name: string) => {
    if (loading) return;
    setArtist(name);
    setLoading(true);

    const options = await fetchConcerts(name);

    setLoading(false);

    if (options.length > 0) {
      router.push("/discover-trip/concert-trips/select-destination" as any);
    } else {
      showToast("No concerts found. Try another artist.");
    }
  };

  if (!context) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={Colors.PRIMARY} />
        </TouchableOpacity>
        <View>
          <Text style={styles.subtitle}>CHOOSE YOUR VIBE</Text>
          <Text style={styles.title}>Select Artist</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search-outline" size={20} color={Colors.GRAY} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchBar}
            value={artist}
            onChangeText={setArtist}
            placeholder="Type artist name here"
            placeholderTextColor={Colors.GRAY}
          />
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.subHeader}>Popular Artists</Text>
        <FlatList
          data={singerOptions}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cardContainer}
              onPress={() => onSelectArtist(item.title)}
            >
              <View style={styles.card}>
                <Image 
                  source={typeof item.image === "string" ? { uri: item.image } : item.image} 
                  style={styles.cardImage} 
                />
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
        
        <View style={styles.cautionContainer}>
           <View style={styles.cautionBox}>
             <Ionicons name="information-circle-outline" size={16} color={Colors.SECONDARY} />
             <Text style={styles.cautionText}>
                Always cross-verify artist schedules and official tour dates.
             </Text>
           </View>
        </View>
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
                { fontSize: artist.trim().length > 12 ? 14 : 16 },
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
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
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
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 5,
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 55,
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    fontFamily: "outfit",
    color: Colors.TEXT,
  },
  subHeader: {
    fontFamily: "outfitMedium",
    fontSize: 18,
    color: Colors.GRAY,
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  cardContainer: { 
    flex: 1, 
    margin: 8, 
    height: height * 0.2 
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
    resizeMode: "cover" 
  },
  imageOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: "rgba(0,0,0,0.3)" 
  },
  cardText: {
    position: "absolute",
    bottom: 15,
    left: 20,
    color: "white",
    fontFamily: "outfitBold",
  },
  continueButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    height: 60,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  continueText: { color: Colors.WHITE, fontFamily: "outfitMedium", letterSpacing: 1 },
  cautionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: Colors.WHITE,
  },
  cautionBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(234, 179, 8, 0.05)",
    padding: 12,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.1)",
  },
  cautionText: {
    flex: 1,
    fontFamily: "outfit",
    fontSize: 11,
    color: "#854d0e",
    lineHeight: 16,
  },
});
