import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ToastAndroid,
  Dimensions,
  Platform,
  Alert,
  ImageBackground,
  StyleSheet,
  StatusBar,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/src/constants/colors";
import { useTheme } from "@/src/context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConcertTripContext } from "@/src/context/ConcertTripContext";
import { ConcertEvent } from "@/src/constants";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

function showToast(message: string) {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert("", message);
  }
}

export default function SelectDestination() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const context = useContext(ConcertTripContext);
  const colors = useThemeColors();
  const { isDark } = useTheme();

  const [selectedOption, setSelectedOption] = useState<ConcertEvent | null>(null);
  const [concertDates, setConcertDates] = useState<ConcertEvent[]>([]);

  useEffect(() => {
    if (context?.concertData?.locationOptions && context.concertData.locationOptions.length > 0) {
      const sortedOptions = [...context.concertData.locationOptions].sort((a, b) => {
        const dateA = new Date(a.concertDate || "").getTime();
        const dateB = new Date(b.concertDate || "").getTime();
        return dateA - dateB;
      });
      setConcertDates(sortedOptions);
    }
  }, [context?.concertData?.locationOptions]);

  const onClickContinue = () => {
    if (!selectedOption || !context) {
      showToast("Select a concert date");
      return;
    }

    const selected = selectedOption;
    router.push({
      pathname: "/create-trip",
      params: {
        destName: selected.venueName || selected.title,
        destLat: selected.coordinates.latitude.toString(),
        destLon: selected.coordinates.longitude.toString(),
        destCountry: selected.country,
        destCountryCode: selected.countryCode,
        destPhoto: selected.image,
        festival: `${context.concertData.artist} Concert`,
        venueAddress: selected.venueAddress,
        concertDate: selected.concertDate,
        concertTime: selected.concertTime,
        bookingUrl: selected.bookingUrl,
        priceRange: JSON.stringify(selected.priceRange),
        tripCategory: "CONCERT",
      },
    });
  };

  if (!context) return null;

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top, backgroundColor: colors.BACKGROUND }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={[styles.header, { borderBottomColor: colors.BORDER }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.SURFACE_LIGHT }]}
        >
          <Ionicons name="chevron-back" size={28} color={colors.TEXT} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.subtitle, { color: colors.GOLD }]}>CHOOSE YOUR EXPERIENCE</Text>
          <Text style={[styles.title, { color: colors.TEXT }]}>Select Event</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={concertDates}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedOption(item)}
              activeOpacity={0.93}
              style={[
                styles.card,
                { backgroundColor: colors.SURFACE },
                selectedOption?.id === item.id && { borderWidth: 3, borderColor: colors.GOLD }
              ]}
            >
              <ImageBackground
                source={{ uri: item.image }}
                style={styles.cardImage}
                imageStyle={{ borderRadius: 20 }}
              >
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.85)"]}
                  style={styles.gradient}
                >
                  <View style={styles.cardInfo}>
                    <Text style={styles.eventTitle}>{item.title}</Text>
                    <View style={styles.eventDetails}>
                      <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={14} color="#CBD5E1" />
                        <Text style={styles.detailText}>{item.concertDate}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={14} color="#CBD5E1" />
                        <Text style={styles.detailText} numberOfLines={1}>{item.venueName}</Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>
              {selectedOption?.id === item.id && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />

        <View style={[styles.cautionContainer, { backgroundColor: colors.BACKGROUND }]}>
          <View style={[styles.cautionBox, { backgroundColor: colors.GOLD_MUTED, borderColor: colors.BORDER }]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.GOLD} />
            <Text style={[styles.cautionText, { color: colors.GOLD }]}>
              Double-check the concert date and venue with official sources before finalizing your trip details.
            </Text>
          </View>
        </View>

        <View style={[styles.footer, { backgroundColor: colors.BACKGROUND, borderTopColor: colors.BORDER }]}>
          <TouchableOpacity
            onPress={onClickContinue}
            disabled={!selectedOption}
            style={[
              styles.continueButton,
              { backgroundColor: colors.GOLD, shadowColor: colors.GOLD },
              !selectedOption && { backgroundColor: colors.SURFACE_LIGHT, shadowOpacity: 0 }
            ]}
          >
            <Text style={[
              styles.continueText,
              { color: isDark ? "#000" : "#fff" },
              !selectedOption && { color: colors.MUTED_TEXT }
            ]}>
              CONFIRM SELECTION
            </Text>
            {selectedOption && (
              <Ionicons
                name="arrow-forward"
                size={18}
                color={isDark ? "#000" : "#fff"}
                style={{ marginLeft: 8 }}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
    borderBottomWidth: 1,
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
    letterSpacing: 2.5,
  },
  title: {
    fontFamily: "playfairBold",
    fontSize: 28,
    marginTop: -2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 10,
  },
  card: {
    height: 180,
    marginVertical: 10,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardImage: { flex: 1 },
  gradient: { flex: 1, justifyContent: "flex-end", padding: 20 },
  cardInfo: { flex: 0 },
  eventTitle: { color: "#fff", fontFamily: "playfairBold", fontSize: 20, marginBottom: 8 },
  eventDetails: { flexDirection: "row", gap: 15 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailText: { color: "#CBD5E1", fontFamily: "outfitMedium", fontSize: 12 },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 4,
    zIndex: 10,
  },
  footer: {
    padding: 20,
    paddingBottom: 35,
    borderTopWidth: 1,
  },
  cautionContainer: {
    paddingHorizontal: 25,
    paddingVertical: 10,
  },
  cautionBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
  },
  cautionText: {
    flex: 1,
    fontFamily: "outfit",
    fontSize: 11,
    lineHeight: 16,
  },
  continueButton: {
    height: 65,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 6,
  },
  continueText: { fontFamily: "outfitBold", fontSize: 14, letterSpacing: 2 },
});
