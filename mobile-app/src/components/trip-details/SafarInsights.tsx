import React, { memo } from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { Colors } from "@/src/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { TRANSPORT_INSIGHTS_IMAGES } from "@/src/constants";
import { useThemeColors } from "@/src/constants/colors";

interface SafarInsightsProps {
  bestTransport?: string;
  weatherInsight?: string;
}

const SafarInsights = ({ bestTransport, weatherInsight }: SafarInsightsProps) => {
  const colors = useThemeColors();

  if (!bestTransport && !weatherInsight) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={[styles.overline, { color: colors.MUTED_TEXT }]}>AI CURATED</Text>
        <View style={styles.titleRow}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>Safar Insights</Text>
          <View style={[styles.goldDot, { backgroundColor: colors.GOLD }]} />
        </View>
      </View>

      {bestTransport && (
        <ImageBackground
          source={{ uri: TRANSPORT_INSIGHTS_IMAGES.NAVIGATOR }}
          style={styles.insightCard}
          imageStyle={{ borderRadius: 20 }}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.85)"]}
            style={styles.insightOverlay}
          >
            <View style={styles.insightHeaderRow}>
              <Ionicons name="compass" size={20} color={Colors.SECONDARY} />
              <Text style={styles.insightTitle}>PRO NAVIGATOR</Text>
            </View>
            <Text style={styles.insightText}>{bestTransport}</Text>
          </LinearGradient>
        </ImageBackground>
      )}

      {weatherInsight && (
        <ImageBackground
          source={{ uri: TRANSPORT_INSIGHTS_IMAGES.WEATHER }}
          style={[styles.insightCard, bestTransport ? { marginTop: 14 } : {}]}
          imageStyle={{ borderRadius: 20 }}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.85)"]}
            style={styles.insightOverlay}
          >
            <View style={styles.insightHeaderRow}>
              <Ionicons name="partly-sunny" size={20} color="#FFC107" />
              <Text style={styles.insightTitle}>CLIMATIC INSIGHT</Text>
            </View>
            <Text style={styles.insightText}>{weatherInsight}</Text>
          </LinearGradient>
        </ImageBackground>
      )}
    </View>
  );
};

export default memo(SafarInsights);

const styles = StyleSheet.create({
  wrapper: { marginVertical: 10 },
  header: { marginBottom: 16 },
  overline: {
    fontFamily: "interMedium",
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  titleRow: { flexDirection: "row", alignItems: "baseline", marginTop: -4 },
  sectionTitle: { fontSize: 28, fontFamily: "playfairBold" },
  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 4,
    marginBottom: 6,
  },
  insightCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    backgroundColor: "#000",
  },
  insightOverlay: {
    borderRadius: 20,
    padding: 20,
    minHeight: 130,
    justifyContent: "flex-end",
  },
  insightHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {
    fontFamily: "interBold",
    fontSize: 11,
    color: "#FFF",
    letterSpacing: 1.5,
  },
  insightText: {
    fontFamily: "playfairBold",
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 26,
  },
});
