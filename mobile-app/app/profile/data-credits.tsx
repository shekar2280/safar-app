import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, useThemeColors } from "@/src/constants/colors";
import { useTheme } from "@/src/context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DataCredits() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { isDark } = useTheme();

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerTransparent: true,
          headerTintColor: colors.TEXT,
        }}
      />
      
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerInfo}>
          <Text style={[styles.mainTitle, { color: colors.TEXT }]}>DATA CREDITS</Text>
          <Text style={[styles.description, { color: colors.MUTED_TEXT }]}>
            Safar relies on several world-class data providers to bring you the best travel experiences. In accordance with their licensing terms, we attribute the following:
          </Text>
        </View>


        <View style={[styles.card, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9" }]}>
                <Ionicons name="cloud-outline" size={20} color={colors.TEXT} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.TEXT }]}>WeatherAPI.com</Text>
          </View>
          <Text style={[styles.cardText, { color: colors.MUTED_TEXT }]}>
            Weather data and forecasts are provided by WeatherAPI.com.
          </Text>
          <TouchableOpacity onPress={() => openLink("https://www.weatherapi.com/")}>
            <Text style={[styles.linkText, { color: colors.PRIMARY }]}>Powered by WeatherAPI.com</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9" }]}>
                <Ionicons name="map-outline" size={20} color={colors.TEXT} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.TEXT }]}>OpenTripMap</Text>
          </View>
          <Text style={[styles.cardText, { color: colors.MUTED_TEXT }]}>
            Places of interest and local sights data are provided via OpenTripMap API under the ODbL license.
          </Text>
          <TouchableOpacity onPress={() => openLink("https://opentripmap.io/")}>
            <Text style={[styles.linkText, { color: colors.PRIMARY }]}>Explore OpenTripMap</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink("https://opendatacommons.org/licenses/odbl/")} style={{ marginTop: 10 }}>
            <Text style={[styles.licenseText, { color: colors.GOLD }]}>License: ODbL 1.0</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9" }]}>
                <Ionicons name="image-outline" size={20} color={colors.TEXT} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.TEXT }]}>Photography</Text>
          </View>
          <Text style={[styles.cardText, { color: colors.MUTED_TEXT }]}>
            Beautiful imagery provided by talented photographers on Unsplash. Special thanks to:
          </Text>
          
          <View style={styles.photographerList}>
            <TouchableOpacity onPress={() => openLink("https://unsplash.com/@sam")}>
              <Text style={[styles.creditItem, { color: colors.PRIMARY }]}>• Sam Schooler (Cloudy Sky)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openLink("https://unsplash.com/@ashkya")}>
              <Text style={[styles.creditItem, { color: colors.PRIMARY }]}>• Robert Tudor (Train Station)</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => openLink("https://unsplash.com/")} style={{ marginTop: 10 }}>
            <Text style={[styles.linkText, { color: colors.PRIMARY }]}>Explore Unsplash License</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.MUTED_TEXT }]}>
            Safar is committed to open data and transparent sourcing.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingVertical: 25, paddingHorizontal: 10, paddingBottom: 60 },
  headerInfo: { marginBottom: 30 },
  mainTitle: {
    fontFamily: "playfairBold",
    fontSize: 26,
    letterSpacing: 2,
    marginBottom: 8,
  },
  description: {
    fontFamily: "outfit",
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
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
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontFamily: "playfairBold",
    fontSize: 20,
  },
  cardText: {
    fontFamily: "outfit",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  linkText: {
    fontFamily: "outfitBold",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  licenseText: {
    fontFamily: "outfit",
    fontSize: 12,
    opacity: 0.7,
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    fontFamily: "outfit",
    fontSize: 12,
    opacity: 0.6,
  },
  photographerList: {
    marginBottom: 15,
    gap: 8,
  },
  creditItem: {
    fontFamily: "outfit",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
