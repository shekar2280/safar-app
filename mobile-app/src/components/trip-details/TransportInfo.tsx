import React, { memo, useRef, useState } from "react";
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
import { Colors } from "@/src/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

interface TransportData {
  tripType?: string;
  departureIata?: string;
  destinationIata?: string;
}

const TransportInfo = ({ transportData }: { transportData?: TransportData }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  if (!transportData?.departureIata) return null;

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

  const openAgency = (url: string) => {
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open the website. Please check your internet.")
    );
  };

  const BookingCard = ({
    name,
    url,
    image,
    color,
  }: {
    name: string;
    url: string;
    image: any;
    color: string;
  }) => (
    <TouchableOpacity style={styles.card} onPress={() => openAgency(url)} activeOpacity={0.8}>
      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Image source={image} style={styles.logoImage} contentFit="contain" />
        </View>
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={styles.agencyName}>{name}</Text>
          <Text style={styles.subText}>Find best {tripType} rates</Text>
        </View>
        <View style={[styles.viewBtn, { backgroundColor: color }]}>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.overline}>TRANSPORT LOGISTICS</Text>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Travel Route</Text>
          <View style={styles.goldDot} />
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeHeader}>
          <View style={styles.iataBox}>
            <Text style={styles.iataCode}>{activeOrigin}</Text>
            <Text style={styles.cityLabel}>DEPARTURE</Text>
          </View>

          <View style={styles.planeLine}>
            <View style={styles.dashLine} />
            <TouchableOpacity style={styles.planeCircle} onPress={handleFlip} activeOpacity={0.9}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Ionicons name="airplane" size={24} color={Colors.SECONDARY} />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <View style={[styles.iataBox, { alignItems: "flex-end" }]}>
            <Text style={styles.iataCode}>{activeDest}</Text>
            <Text style={styles.cityLabel}>ARRIVAL</Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 25 }}>
        <Text style={styles.smallTitle}>BOOKING OPTIONS</Text>
        <BookingCard
          name="MakeMyTrip"
          url="https://www.makemytrip.com/"
          color="#E11C23"
          image={require("../../../assets/images/makemytrip.png")}
        />
        <BookingCard
          name="Cleartrip"
          url="https://www.cleartrip.com/"
          color="#1A1A1A"
          image={require("../../../assets/images/clear-trip.png")}
        />
        <BookingCard
          name="Ixigo"
          url="https://www.ixigo.com/"
          color="#FC8019"
          image={require("../../../assets/images/ixigo.png")}
        />
      </View>
    </View>
  );
};

export default memo(TransportInfo);

const styles = StyleSheet.create({
  wrapper: { marginTop: 0 },
  header: { paddingHorizontal: 4, marginBottom: 20 },
  overline: { fontFamily: "outfitMedium", fontSize: 10, color: Colors.MUTED_TEXT, letterSpacing: 3, textTransform: "uppercase", marginBottom: 2 },
  titleRow: { flexDirection: "row", alignItems: "baseline", marginTop: -4 },
  sectionTitle: { fontSize: 28, fontFamily: "playfairBold", color: Colors.TEXT },
  goldDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.SECONDARY, marginLeft: 4, marginBottom: 6 },
  routeContainer: { backgroundColor: Colors.PRIMARY, borderRadius: 32, padding: 24, shadowColor: Colors.BLACK, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 },
  routeHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iataBox: { flex: 1 },
  iataCode: { fontSize: 32, fontFamily: "playfairBold", color: Colors.WHITE, letterSpacing: 1 },
  cityLabel: { fontSize: 10, fontFamily: "outfitMedium", color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, marginTop: 4 },
  planeLine: { flex: 1.5, alignItems: "center", justifyContent: "center" },
  dashLine: { position: "absolute", width: "100%", height: 1, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderStyle: "dashed", borderRadius: 1 },
  planeCircle: { backgroundColor: "rgba(255,255,255,0.1)", width: 52, height: 52, borderRadius: 26, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  smallTitle: { fontFamily: "outfitMedium", fontSize: 10, color: Colors.MUTED_TEXT, letterSpacing: 2, marginBottom: 12, marginLeft: 4 },
  card: { backgroundColor: Colors.SURFACE, borderRadius: 24, marginBottom: 12, padding: 14, borderWidth: 1, borderColor: "rgba(0,0,0,0.03)", shadowColor: Colors.BLACK, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  content: { flexDirection: "row", alignItems: "center" },
  logoCircle: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#F8F8F8", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#EEE" },
  logoImage: { width: "70%", height: "70%" },
  agencyName: { fontFamily: "outfitBold", fontSize: 16, color: Colors.TEXT },
  subText: { color: Colors.MUTED_TEXT, fontFamily: "outfit", fontSize: 12, marginTop: 1 },
  viewBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: "center", alignItems: "center" },
});
