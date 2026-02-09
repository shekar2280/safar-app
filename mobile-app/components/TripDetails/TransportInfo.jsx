import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

export default function TransportInfo({ transportData }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  if (!transportData?.departureIata && !departureIata) return null;

  const { tripType, departureIata, destinationIata } = transportData;

  const activeOrigin = isFlipped ? destinationIata : departureIata;
  const activeDest = isFlipped ? departureIata : destinationIata;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const openAgency = (url) => {
    Linking.openURL(url).catch(() =>
      Alert.alert(
        "Error",
        "Could not open the website. Please check your internet.",
      ),
    );
  };

  const BookingCard = ({ name, url, image, color }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openAgency(url)}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Image source={image} style={styles.logoImage} contentFit="contain" />
        </View>

        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={[styles.agencyName, { color }]}>{name}</Text>
          <Text style={styles.subText}>Find best {tripType} rates</Text>
        </View>

        <View style={[styles.viewBtn, { backgroundColor: color }]}>
          <Text style={styles.viewBtnText}>Open</Text>
          <Ionicons
            name="arrow-forward-outline"
            size={14}
            color="white"
            style={{ marginLeft: 5 }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.outlineContainer}>
        <View style={styles.labelWrapper}>
          <Text style={styles.outlineLabel}>TRANSPORT DETAILS</Text>
        </View>

        <View style={styles.routeHeader}>
          <View style={styles.iataBox}>
            <Text style={styles.iataCode}>{activeOrigin}</Text>
            <Text style={styles.cityLabel}>Origin</Text>
          </View>

          <View style={styles.planeLine}>
            <TouchableOpacity style={styles.planeCircle} onPress={handleFlip}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Ionicons name="airplane" size={20} color="white" />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <View style={[styles.iataBox, { alignItems: "flex-end" }]}>
            <Text style={styles.iataCode}>{activeDest}</Text>
            <Text style={styles.cityLabel}>Destination</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Book Your Journey</Text>

        <BookingCard
          name="MakeMyTrip"
          url="https://www.makemytrip.com/"
          color="#E11C23"
          image={require("../../assets/images/makemytrip.png")}
        />

        <BookingCard
          name="Cleartrip"
          url="https://www.cleartrip.com/"
          color="#3366CC"
          image={require("../../assets/images/clear-trip.png")}
        />

        <BookingCard
          name="Ixigo"
          url="https://www.ixigo.com/"
          color="#FC8019"
          image={require("../../assets/images/ixigo.png")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 25 },
  outlineContainer: {
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    padding: 20,
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
  routeHeader: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    padding: 22,
    borderRadius: 22,
    alignItems: "center",
    marginBottom: 20,
    elevation: 5,
  },
  iataBox: { flex: 1 },
  iataCode: { fontSize: 26, fontFamily: "outfitBold", color: "white" },
  cityLabel: { fontSize: 12, fontFamily: "outfit", color: "#AAA" },
  planeLine: { flex: 1.5, alignItems: "center", justifyContent: "center" },
  planeCircle: {
    backgroundColor: Colors.PRIMARY,
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#1A1A1A",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "outfitBold",
    marginBottom: 15,
    color: "#333",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  content: { flexDirection: "row", alignItems: "center" },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  logoImage: { width: "80%", height: "80%" },
  agencyName: { fontFamily: "outfitBold", fontSize: 16 },
  subText: { color: Colors.GRAY, fontFamily: "outfit", fontSize: 11 },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  viewBtnText: { color: "white", fontFamily: "outfitBold", fontSize: 12 },
});
