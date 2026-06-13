import React from "react";
import { View, StyleSheet, Dimensions, ScrollView } from "react-native";
import SkeletonBase from "./SkeletonBase";
import { useThemeColors } from "@/src/constants/theme";

const { width } = Dimensions.get("window");

export default function WalletSkeleton() {
  const colors = useThemeColors();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.BACKGROUND }]} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>


        <SkeletonBase height={200} radius={24} />

        <View style={{ height: 40 }} />

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
