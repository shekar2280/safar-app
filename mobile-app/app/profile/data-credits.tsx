import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, useThemeColors } from "@/src/constants/theme";
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
            Safar uses world-class data and creative resources to curate your travel experiences. We attribution our providers as follows:
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9" }]}>
                <Ionicons name="map-outline" size={20} color={colors.TEXT} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.TEXT }]}>Discovery & Events</Text>
          </View>
          <Text style={[styles.cardText, { color: colors.MUTED_TEXT }]}>
            Local sights and points of interest are sourced from OpenTripMap under the Open Database License (ODbL). Event data and Ticket listings are provided by Ticketmaster.
          </Text>
          <View style={styles.linkRow}>
            <TouchableOpacity onPress={() => openLink("https://opentripmap.com/en/")}>
              <Text style={[styles.linkText, { color: colors.PRIMARY }]}>OpenTripMap</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.MUTED_TEXT, opacity: 0.5 }}>|</Text>
            <TouchableOpacity onPress={() => openLink("https://www.ticketmaster.com/")}>
              <Text style={[styles.linkText, { color: colors.PRIMARY }]}>Ticketmaster</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9" }]}>
                <Ionicons name="sunny-outline" size={20} color={colors.TEXT} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.TEXT }]}>Weather & Environment</Text>
          </View>
          <Text style={[styles.cardText, { color: colors.MUTED_TEXT }]}>
            Real-time weather updates and localized forecasts are powered by OpenWeatherMap.
          </Text>
          <TouchableOpacity onPress={() => openLink("https://openweathermap.org/")}>
            <Text style={[styles.linkText, { color: colors.PRIMARY }]}>OpenWeatherMap</Text>
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
            Beautiful imagery throughout the app is provided by the talented photographers and generous communities of:
          </Text>
          <View style={styles.linkRow}>
            <TouchableOpacity onPress={() => openLink("https://unsplash.com/")}>
              <Text style={[styles.linkText, { color: colors.PRIMARY }]}>Unsplash</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.MUTED_TEXT, opacity: 0.5 }}>|</Text>
            <TouchableOpacity onPress={() => openLink("https://www.pexels.com/")}>
              <Text style={[styles.linkText, { color: colors.PRIMARY }]}>Pexels</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.MUTED_TEXT }]}>
            Safar v1.0.0 • Building on Open Data
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingVertical: 25, paddingHorizontal: 16, paddingBottom: 60 },
  headerInfo: { marginBottom: 30 },
  mainTitle: {
    fontFamily: "playfairBold",
    fontSize: 28,
    letterSpacing: 2,
    marginBottom: 10,
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
    lineHeight: 21,
    marginBottom: 18,
  },
  linkText: {
    fontFamily: "outfitBold",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  footer: {
    marginTop: 30,
    alignItems: "center",
  },
  footerText: {
    fontFamily: "outfitBold",
    fontSize: 10,
    letterSpacing: 2,
    opacity: 0.5,
    textTransform: "uppercase",
  },
});
