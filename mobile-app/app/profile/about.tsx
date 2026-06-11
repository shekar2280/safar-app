import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Dimensions,
} from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { LOGO } from "@/src/constants/images";
import { useThemeColors } from "@/src/constants/colors";
import { useTheme } from "@/src/context/ThemeContext";

const { width } = Dimensions.get("window");

export default function AboutLegals() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { isDark } = useTheme();

  const [expandedSection, setExpandedSection] = useState<"none" | "privacy" | "terms">("none");

  const handleSupportEmail = () => {
    Linking.openURL("mailto:somashekar528234@gmail.com?subject=Safar App Support");
  };

  const toggleSection = (section: "privacy" | "terms") => {
    setExpandedSection(expandedSection === section ? "none" : section);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "ABOUT & LEGALS",
          headerTitleStyle: { fontFamily: "playfairBold", fontSize: 18, color: colors.TEXT },
          headerTransparent: true,
          headerTintColor: colors.TEXT,
          headerStyle: { backgroundColor: "transparent" },
        }}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 70 }]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.appHeader}>
          <View style={[styles.logoOutline, { borderColor: colors.GOLD, overflow: "hidden" }]}>
            <Image
              source={LOGO}
              style={styles.logoImage}
              contentFit="cover"
            />
          </View>
          <Text style={[styles.appName, { color: colors.TEXT }]}>SAFAR</Text>
          <Text style={[styles.appVersion, { color: colors.GOLD }]}>VERSION 1.0.0</Text>
          <Text style={[styles.appDesc, { color: colors.MUTED_TEXT }]}>
            Experience travel curated by artificial intelligence. Safar organizes premium itineraries, tracks your global spending, and uncovers hidden spots.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.SURFACE, borderColor: isDark ? "rgba(251,191,36,0.1)" : "rgba(201,168,76,0.15)" }]}>
          <Text style={[styles.cardTitle, { color: colors.TEXT }]}>Contact Support</Text>
          <Text style={[styles.cardText, { color: colors.MUTED_TEXT }]}>
            Have questions, feedback, or need data deletion assistance? Get in touch directly.
          </Text>
          <TouchableOpacity activeOpacity={0.9} onPress={handleSupportEmail}>
            <LinearGradient
              colors={["#C9A84C", "#B3923B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.emailGradientButton}
            >
              <Ionicons name="mail-open" size={18} color="#000" style={styles.btnIcon} />
              <Text style={styles.emailButtonText}>somashekar528234@gmail.com</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.accordionHeader,
            {
              backgroundColor: colors.SURFACE,
              borderColor: colors.BORDER,
              borderLeftWidth: 1,
              borderLeftColor: colors.BORDER,
            },
            expandedSection === "privacy" && {
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
          ]}
          onPress={() => toggleSection("privacy")}
          activeOpacity={0.7}
        >
          <View style={styles.accordionTitleBox}>
            <Ionicons name="shield-checkmark" size={20} color={colors.GOLD} style={styles.accordionIcon} />
            <Text style={[styles.accordionTitle, { color: colors.TEXT }]}>Privacy Policy</Text>
          </View>
          <Ionicons
            name={expandedSection === "privacy" ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.MUTED_TEXT}
          />
        </TouchableOpacity>

        {expandedSection === "privacy" && (
          <View style={[
            styles.accordionBody,
            {
              backgroundColor: isDark ? "#121212" : colors.SURFACE_LIGHT,
              borderColor: colors.BORDER,
              borderLeftWidth: 1,
              borderLeftColor: colors.BORDER,
            }
          ]}>
            <Text style={[styles.legalIntro, { color: colors.TEXT }]}>
              Safar values your trust. This policy describes our data logging practices.
            </Text>

            <Text style={[styles.sectionHeading, { color: colors.GOLD }]}>Information We Collect</Text>

            <View style={[styles.bulletCard, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
              <View style={styles.bulletHeader}>
                <Ionicons name="person-circle" size={20} color={colors.GOLD} />
                <Text style={[styles.bulletTitle, { color: colors.TEXT }]}>Account Profile</Text>
              </View>
              <Text style={[styles.bulletBody, { color: colors.MUTED_TEXT }]}>
                We collect your name, email address, and profile photo when registering through Google Authentication.
              </Text>
            </View>

            <View style={[styles.bulletCard, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
              <View style={styles.bulletHeader}>
                <Ionicons name="location" size={20} color={colors.GOLD} />
                <Text style={[styles.bulletTitle, { color: colors.TEXT }]}>Geographical Coordinates</Text>
              </View>
              <Text style={[styles.bulletBody, { color: colors.MUTED_TEXT }]}>
                We utilize your coordinates (GPS location) locally on-device and in Firebase to verify visited sights and display active updates. We do not sell location history.
              </Text>
            </View>

            <View style={[styles.bulletCard, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
              <View style={styles.bulletHeader}>
                <Ionicons name="wallet" size={20} color={colors.GOLD} />
                <Text style={[styles.bulletTitle, { color: colors.TEXT }]}>Itineraries & Ledger</Text>
              </View>
              <Text style={[styles.bulletBody, { color: colors.MUTED_TEXT }]}>
                We save travel budgets, expense details, selected sights, and trip dates to keep your planner synced across devices.
              </Text>
            </View>

            <Text style={[styles.sectionHeading, { color: colors.GOLD }]}>Data Management Rights</Text>
            <View style={[styles.warningCard, { borderColor: colors.RED, backgroundColor: isDark ? "rgba(239,68,68,0.05)" : "rgba(239,68,68,0.02)" }]}>
              <View style={styles.bulletHeader}>
                <Ionicons name="trash-bin" size={20} color={colors.RED} />
                <Text style={[styles.bulletTitle, { color: colors.RED }]}>Instant & Permanent Account Deletion</Text>
              </View>
              <Text style={[styles.bulletBody, { color: colors.MUTED_TEXT }]}>
                You maintain total ownership of your records. Triggering "Delete Account" on the profile page permanently removes your profile, saved trips, budgets, and location logs from our servers and Firebase.
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.accordionHeader,
            {
              backgroundColor: colors.SURFACE,
              borderColor: colors.BORDER,
              marginTop: 16,
              borderLeftWidth: 1,
              borderLeftColor: colors.BORDER,
            },
            expandedSection === "terms" && {
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
          ]}
          onPress={() => toggleSection("terms")}
          activeOpacity={0.7}
        >
          <View style={styles.accordionTitleBox}>
            <Ionicons name="document-text" size={20} color={colors.GOLD} style={styles.accordionIcon} />
            <Text style={[styles.accordionTitle, { color: colors.TEXT }]}>Terms of Service</Text>
          </View>
          <Ionicons
            name={expandedSection === "terms" ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.MUTED_TEXT}
          />
        </TouchableOpacity>

        {expandedSection === "terms" && (
          <View style={[
            styles.accordionBody,
            {
              backgroundColor: isDark ? "#121212" : colors.SURFACE_LIGHT,
              borderColor: colors.BORDER,
              borderLeftWidth: 1,
              borderLeftColor: colors.BORDER,
            }
          ]}>
            <Text style={[styles.legalIntro, { color: colors.TEXT }]}>
              By using Safar, you agree to these legal conditions.
            </Text>

            <Text style={[styles.sectionHeading, { color: colors.GOLD }]}>Disclaimers & Limits</Text>

            <View style={[styles.bulletCard, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
              <View style={styles.bulletHeader}>
                <Ionicons name="sparkles" size={20} color={colors.GOLD} />
                <Text style={[styles.bulletTitle, { color: colors.TEXT }]}>Generative AI Suggestions</Text>
              </View>
              <Text style={[styles.bulletBody, { color: colors.MUTED_TEXT }]}>
                Itineraries, estimates, and venue timings are compiled via AI. Users are responsible for verifying schedules, ticket prices, and security details locally.
              </Text>
            </View>

            <View style={[styles.bulletCard, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
              <View style={styles.bulletHeader}>
                <Ionicons name="alert-circle" size={20} color={colors.GOLD} />
                <Text style={[styles.bulletTitle, { color: colors.TEXT }]}>Liability Scope</Text>
              </View>
              <Text style={[styles.bulletBody, { color: colors.MUTED_TEXT }]}>
                Safar is provided "as is". We are not responsible for transport delays, reservation issues, itinerary adjustments, or any travel disruption.
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingVertical: 25, paddingHorizontal: 15, paddingBottom: 50 },
  appHeader: {
    alignItems: "center",
    marginBottom: 35,
    paddingHorizontal: 10,
  },
  logoOutline: {
    width: 90,
    height: 90,
    borderRadius: 30,
    borderWidth: 2,
    padding: 3,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },
  logoGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontFamily: "playfairBold",
    fontSize: 32,
    letterSpacing: 4,
    marginBottom: 4,
  },
  appVersion: {
    fontFamily: "outfitBold",
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 16,
  },
  appDesc: {
    fontFamily: "outfit",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  card: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 3,
  },
  cardTitle: {
    fontFamily: "playfairBold",
    fontSize: 18,
    marginBottom: 8,
  },
  cardText: {
    fontFamily: "outfit",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 18,
  },
  emailGradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 18,
  },
  btnIcon: { marginRight: 8 },
  emailButtonText: {
    fontFamily: "outfitBold",
    fontSize: 13,
    color: "#000",
    letterSpacing: 0.5,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderLeftWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  accordionTitleBox: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  accordionIcon: { marginRight: 12 },
  accordionTitle: {
    fontFamily: "outfitBold",
    fontSize: 15,
  },
  accordionBody: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 1,
    borderLeftWidth: 1,
    borderTopWidth: 0,
    padding: 20,
    marginTop: 0,
  },
  legalIntro: {
    fontFamily: "outfitMedium",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  sectionHeading: {
    fontFamily: "playfairBold",
    fontSize: 16,
    marginTop: 14,
    marginBottom: 12,
  },
  bulletCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  warningCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 12,
  },
  bulletHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  bulletTitle: {
    fontFamily: "outfitBold",
    fontSize: 13,
    marginLeft: 8,
  },
  bulletBody: {
    fontFamily: "outfit",
    fontSize: 12,
    lineHeight: 18,
  },
});
