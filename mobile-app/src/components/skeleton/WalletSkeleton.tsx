import React from "react";
import { View, StyleSheet, Dimensions, ScrollView } from "react-native";
import SkeletonBase from "./SkeletonBase";
import { Spacing } from "@/src/constants/theme";
import { Colors } from "@/src/constants/colors";

const { width } = Dimensions.get("window");

export default function WalletSkeleton() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header Skeleton */}
        <View style={styles.header}>
            <SkeletonBase width={150} height={12} radius={4} />
            <View style={{ height: 8 }} />
            <SkeletonBase width={220} height={42} radius={8} />
        </View>

        {/* Budget Card Skeleton */}
        <SkeletonBase height={200} radius={24} />

        <View style={{ height: 40 }} />

        {/* Transaction History Skeleton */}
        <View style={styles.historyHeader}>
          <SkeletonBase width={140} height={20} radius={4} />
          <SkeletonBase width={80} height={32} radius={12} />
        </View>

        <View style={{ gap: 15 }}>
          <SkeletonBase height={80} radius={16} />
          <SkeletonBase height={80} radius={16} />
          <SkeletonBase height={80} radius={16} />
          <SkeletonBase height={80} radius={16} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  }
});
