import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import SkeletonBase from "./SkeletonBase";
import { Spacing } from "@/src/constants/theme";

const { width } = Dimensions.get("window");

export default function TripCardSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonBase height={230} radius={20} />
      
      <View style={styles.contentOverlay}>
        <View style={{ flex: 1, paddingRight: 15 }}>
          <SkeletonBase width="85%" height={26} radius={6} />
          <View style={{ height: 8 }} />
          <SkeletonBase width="50%" height={16} radius={4} />
        </View>
        <SkeletonBase width={46} height={46} radius={23} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 230,
    width: "100%",
    marginBottom: Spacing.lg,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  contentOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  }
});
