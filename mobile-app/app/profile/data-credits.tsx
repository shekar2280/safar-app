import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DataCredits() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerTransparent: true,
          headerTintColor: Colors.PRIMARY,
        }}
      />
      
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerInfo}>
          <Text style={styles.mainTitle}>DATA CREDITS</Text>
          <Text style={styles.description}>
            Safar relies on several world-class data providers to bring you the best travel experiences. In accordance with their licensing terms, we attribute the following:
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
                <Ionicons name="airplane-outline" size={20} color={Colors.PRIMARY} />
            </View>
            <Text style={styles.cardTitle}>Amadeus</Text>
          </View>
          <Text style={styles.cardText}>
            Flight inspiration and airport data are powered by Amadeus for Developers.
          </Text>
          <TouchableOpacity onPress={() => openLink("https://developers.amadeus.com/")}>
            <Text style={styles.linkText}>Learn more about Amadeus</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
                <Ionicons name="cloud-outline" size={20} color={Colors.PRIMARY} />
            </View>
            <Text style={styles.cardTitle}>WeatherAPI.com</Text>
          </View>
          <Text style={styles.cardText}>
            Weather data and forecasts are provided by WeatherAPI.com.
          </Text>
          <TouchableOpacity onPress={() => openLink("https://www.weatherapi.com/")}>
            <Text style={styles.linkText}>Powered by WeatherAPI.com</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
                <Ionicons name="map-outline" size={20} color={Colors.PRIMARY} />
            </View>
            <Text style={styles.cardTitle}>OpenTripMap</Text>
          </View>
          <Text style={styles.cardText}>
            Places of interest and local sights data are provided via OpenTripMap API under the ODbL license.
          </Text>
          <TouchableOpacity onPress={() => openLink("https://opentripmap.io/")}>
            <Text style={styles.linkText}>Explore OpenTripMap</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink("https://opendatacommons.org/licenses/odbl/")} style={{ marginTop: 10 }}>
            <Text style={styles.licenseText}>License: ODbL 1.0</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
                <Ionicons name="image-outline" size={20} color={Colors.PRIMARY} />
            </View>
            <Text style={styles.cardTitle}>Photography</Text>
          </View>
          <Text style={styles.cardText}>
            Beautiful imagery provided by talented photographers on Unsplash. Special thanks to:
          </Text>
          
          <View style={styles.photographerList}>
            <TouchableOpacity onPress={() => openLink("https://unsplash.com/@sam")}>
              <Text style={styles.creditItem}>• Sam Schooler (Cloudy Sky)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openLink("https://unsplash.com/@ashkya")}>
              <Text style={styles.creditItem}>• Robert Tudor (Train Station)</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => openLink("https://unsplash.com/")} style={{ marginTop: 10 }}>
            <Text style={styles.linkText}>Explore Unsplash License</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Safar is committed to open data and transparent sourcing.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.WHITE },
  scrollContent: { padding: 25, paddingBottom: 60 },
  headerInfo: { marginBottom: 30 },
  mainTitle: {
    fontFamily: "playfairBold",
    fontSize: 26,
    color: Colors.PRIMARY,
    letterSpacing: 2,
    marginBottom: 8,
  },
  description: {
    fontFamily: "outfit",
    fontSize: 15,
    color: Colors.MUTED_TEXT,
    lineHeight: 22,
  },
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 15,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontFamily: "playfairBold",
    fontSize: 20,
    color: Colors.PRIMARY,
  },
  cardText: {
    fontFamily: "outfit",
    fontSize: 14,
    color: Colors.MUTED_TEXT,
    lineHeight: 20,
    marginBottom: 15,
  },
  linkText: {
    fontFamily: "outfitBold",
    fontSize: 14,
    color: Colors.PRIMARY,
    textDecorationLine: "underline",
  },
  licenseText: {
    fontFamily: "outfit",
    fontSize: 12,
    color: Colors.SECONDARY,
    opacity: 0.7,
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    fontFamily: "outfit",
    fontSize: 12,
    color: Colors.MUTED_TEXT,
    opacity: 0.6,
  },
  photographerList: {
    marginBottom: 15,
    gap: 8,
  },
  creditItem: {
    fontFamily: "outfit",
    fontSize: 14,
    color: Colors.PRIMARY,
    textDecorationLine: "underline",
  },
});
