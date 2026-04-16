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
import { Colors } from "@/src/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConcertTripContext } from "@/src/context/ConcertTripContext";
import { ConcertEvent } from "@/src/types";
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
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={Colors.PRIMARY} />
        </TouchableOpacity>
        <View>
          <Text style={styles.subtitle}>CHOOSE YOUR EXPERIENCE</Text>
          <Text style={styles.title}>Select Event</Text>
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
                selectedOption?.id === item.id && styles.selectedCard
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
                   <Ionicons name="checkmark" size={18} color={Colors.WHITE} />
                </View>
              )}
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />

        <View style={styles.cautionContainer}>
           <View style={styles.cautionBox}>
             <Ionicons name="information-circle-outline" size={16} color={Colors.SECONDARY} />
             <Text style={styles.cautionText}>
                Double-check the concert date and venue with official sources before finalizing your trip details.
             </Text>
           </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={onClickContinue}
            disabled={!selectedOption}
            style={[
              styles.continueButton,
              !selectedOption && { backgroundColor: "#F1F5F9", shadowOpacity: 0 }
            ]}
          >
            <Text style={[styles.continueText, !selectedOption && { color: "#94A3B8" }]}>
              CONFIRM SELECTION
            </Text>
            {selectedOption && <Ionicons name="arrow-forward" size={18} color={Colors.WHITE} style={{ marginLeft: 8 }} />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    marginTop: 10,
  },
  card: { 
    height: 180, 
    marginVertical: 10, 
    borderRadius: 20, 
    backgroundColor: "#F8FAFC", 
    overflow: "hidden",
    elevation: 4,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  selectedCard: { 
    borderWidth: 3, 
    borderColor: Colors.SECONDARY, 
  },
  cardImage: { flex: 1 },
  gradient: { flex: 1, justifyContent: "flex-end", padding: 20 },
  cardInfo: { flex: 0 },
  eventTitle: { color: Colors.WHITE, fontFamily: "playfairBold", fontSize: 20, marginBottom: 8 },
  eventDetails: { flexDirection: "row", gap: 15 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailText: { color: "#CBD5E1", fontFamily: "interMedium", fontSize: 12 },
  
  checkBadge: { 
    position: "absolute", 
    top: 10, 
    right: 10, 
    width: 34, 
    height: 34, 
    borderRadius: 17, 
    backgroundColor: Colors.SECONDARY, 
    justifyContent: "center", 
    alignItems: "center", 
    borderWidth: 3, 
    borderColor: Colors.WHITE, 
    elevation: 4,
    zIndex: 10,
  },
  
  footer: { 
    padding: 20, 
    paddingBottom: 35, 
    backgroundColor: Colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  cautionContainer: {
    paddingHorizontal: 25,
    paddingVertical: 10,
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
  continueButton: { 
    height: 65, 
    backgroundColor: Colors.PRIMARY, 
    borderRadius: 18, 
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center", 
    shadowColor: Colors.PRIMARY, 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 15, 
    elevation: 6 
  },
  continueText: { color: Colors.WHITE, fontFamily: "outfitBold", fontSize: 14, letterSpacing: 2 }
});
