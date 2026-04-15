import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Colors, useThemeColors } from "@/src/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { AIDisclaimerProps } from "@/src/types";

export default function AIDisclaimer({ style }: AIDisclaimerProps) {
  const colors = useThemeColors();
  return (
    <View style={[styles.container, style] as ViewStyle[]}>
      <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />
      <View style={styles.content}>
        <Text style={[styles.text, { color: colors.MUTED_TEXT }]}>
          Locations, hours, and estimated pricing are indicative. 
          Please verify with official sources before visiting.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    opacity: 0.8,
  },
  divider: {
    height: 1,
    marginBottom: 15,
    width: "40%",
    alignSelf: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 20,
  },
  text: {
    flex: 1,
    fontFamily: "outfit",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});
