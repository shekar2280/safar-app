import {
  View,
  Text,
  Dimensions,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Platform,
  Alert,
  StatusBar,
} from "react-native";
import { Image } from "expo-image";
import React, { useState, useContext } from "react";
import { useRouter } from "expo-router";
import { Colors, useThemeColors } from "@/src/constants/colors";
import { useTheme } from "@/src/context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConcertTripContext } from "@/src/context/ConcertTripContext";
import { singerOptions } from "@/src/constants";
import { ConcertEvent } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { apiGet } from "@/src/lib/api";

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
  const colors = useThemeColors();
  const { isDark } = useTheme();

  const fetchConcerts = async (artistName: string): Promise<ConcertEvent[]> => {
    try {
      const eventsRaw = await apiGet<any[]>("/api/v1/discovery/concert", {
        artistName
      });

      if (!Array.isArray(eventsRaw)) {
        return [];
      }

      if (eventsRaw.length === 0) return [];

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
      return [];
    }
  };

  const handleConfirm = async () => {
    if (loading || artist.trim().length < 3) return;
    setLoading(true);

    const options = await fetchConcerts(artist.trim());

    setLoading(false);

    if (options.length > 0) {
      router.push("/discover-trip/concert-trips/select-destination" as any);
    } else {
      showToast("No concerts found. Try another artist.");
    }
  };

  if (!context) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.BACKGROUND }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.SURFACE_LIGHT }]}>
          <Ionicons name="chevron-back" size={28} color={colors.TEXT} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.subtitle, { color: colors.SECONDARY }]}>CHOOSE YOUR VIBE</Text>
          <Text style={[styles.title, { color: colors.TEXT }]}>Select Artist</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBarWrapper, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
          <Ionicons name="search-outline" size={20} color={colors.MUTED_TEXT} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.searchBar, { color: colors.TEXT }]}
            value={artist}
            onChangeText={setArtist}
            placeholder="Type artist name here"
            placeholderTextColor={colors.MUTED_TEXT}
          />
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.subHeader, { color: colors.TEXT }]}>Popular Artists</Text>
        <FlatList
          data={singerOptions}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={true}
          extraData={artist}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cardContainer}
              onPress={() => setArtist(item.title)}
            >
              <View style={[
                styles.card,
                { borderWidth: 3, borderColor: artist === item.title ? colors.GOLD : 'transparent' }
              ]}>
                <Image
                  source={typeof item.image === "string" ? { uri: item.image } : item.image}
                  style={[styles.cardImage, { backgroundColor: colors.SURFACE_LIGHT }]}
                  contentFit="cover"
                  cachePolicy="memory-disk"
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
                {artist === item.title && (
                  <View style={[styles.checkBadge, { backgroundColor: colors.GOLD }]}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />

        <View style={[styles.cautionContainer, { backgroundColor: colors.BACKGROUND }]}>
          <View style={[styles.cautionBox, { backgroundColor: colors.GOLD_MUTED, borderColor: colors.BORDER }]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.GOLD} />
            <Text style={[styles.cautionText, { color: colors.GOLD }]}>
              Always cross-verify artist schedules and official tour dates.
            </Text>
          </View>
        </View>
      </View>

      {artist.trim().length > 2 && (
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={loading}
          style={[styles.continueButton, { backgroundColor: colors.GOLD, shadowColor: colors.GOLD }]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={isDark ? "#000" : "#fff"} />
          ) : (
            <Text
              style={[
                styles.continueText,
                { color: isDark ? "#000" : colors.WHITE, fontSize: artist.trim().length > 12 ? 14 : 16 },
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
    borderRadius: 18,
    paddingHorizontal: 15,
    borderWidth: 1,
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
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
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
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 4,
    zIndex: 10,
  },
});
