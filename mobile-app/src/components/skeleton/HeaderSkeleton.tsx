import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import SkeletonBase from "./SkeletonBase";
import { Spacing } from "@/src/constants/theme";

const { width } = Dimensions.get("window");

export default function HeaderSkeleton() {
  return (
    <View style={styles.header}>
      <View style={styles.headerActions} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 80,
    marginBottom: 20,
    marginTop: 20,
  },
  greetingWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
  },
  goldDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginLeft: 4,
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingBottom: 6,
  },
});
