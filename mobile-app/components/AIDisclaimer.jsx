import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export default function AIDisclaimer({ style }) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.divider} />
      <View style={styles.content}>
        <Ionicons name="sparkles-outline" size={14} color={Colors.GRAY} />
        <Text style={styles.text}>
          Curated by Safar AI. Locations, hours, and estimated pricing are indicative. 
          Please verify with official sources before visiting.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    opacity: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.BORDER,
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
    color: Colors.MUTED_TEXT,
    lineHeight: 18,
    textAlign: "center",
  },
});
