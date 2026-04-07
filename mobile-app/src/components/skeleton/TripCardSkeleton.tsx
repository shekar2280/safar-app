import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import SkeletonBase from "./SkeletonBase";
import { Spacing } from "@/src/constants/theme";

const { width } = Dimensions.get("window");

export default function TripCardSkeleton() {
  const cardWidth = width - 40;

  return (
    <View style={[styles.container, { width: cardWidth }]}>
      {/* Hero Image Area */}
      <SkeletonBase height={230} radius={20} />
      
      {/* Floating Info Overlay Simulation */}
      <View style={styles.contentOverlay}>
        <SkeletonBase width="60%" height={24} radius={6} />
        <View style={{ height: 8 }} />
        <SkeletonBase width="40%" height={16} radius={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 230,
    marginBottom: Spacing.lg,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  contentOverlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  }
});
