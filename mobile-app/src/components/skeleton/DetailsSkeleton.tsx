import React from "react";
import { View, StyleSheet, Dimensions, ScrollView } from "react-native";
import SkeletonBase from "./SkeletonBase";
import { useThemeColors } from "@/src/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const SLIDESHOW_HEIGHT = height * 0.52;

export default function DetailsSkeleton() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <View style={styles.heroContainer}>
        <SkeletonBase height={SLIDESHOW_HEIGHT} radius={0} />

        <View style={[styles.backBtn, { top: insets.top + 16 }]}>
          <SkeletonBase width={40} height={40} radius={20} />
        </View>
      </View>

      <View style={[styles.contentSheet, { backgroundColor: colors.BACKGROUND }]}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
            <View style={styles.headerBlock}>
              <View style={styles.titleRow}>
                <SkeletonBase width="65%" height={32} radius={8} />
              </View>
              <View style={{ height: 8 }} />
              <SkeletonBase width="40%" height={14} radius={4} />
            </View>

            <View style={{ height: 25 }} />

            <SkeletonBase height={80} radius={16} />
            
            <View style={{ height: 25 }} />

            <SkeletonBase height={120} radius={32} />

            <View style={{ height: 40 }} />

            <SkeletonBase width={120} height={18} radius={4} />
            <View style={{ height: 20 }} />

            <View style={{ flexDirection: 'row', gap: 15 }}>
              <SkeletonBase width={width * 0.7} height={280} radius={24} />
              <SkeletonBase width={width * 0.7} height={280} radius={24} />
            </View>

            <View style={{ height: 40 }} />

            <SkeletonBase width={140} height={18} radius={4} />
            <View style={{ height: 20 }} />

            <View style={{ gap: 20 }}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ alignItems: 'center' }}>
                    <SkeletonBase width={8} height={8} radius={4} />
                    <View style={{ width: 2, flex: 1, backgroundColor: colors.BORDER, marginTop: 4, borderRadius: 1 }} />
                  </View>
                  <SkeletonBase width="90%" height={100} radius={20} />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    height: SLIDESHOW_HEIGHT,
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: 20,
    zIndex: 10,
  },
  contentSheet: {
    flex: 1,
    marginTop: -35,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    overflow: "hidden",
  },
  headerBlock: {
    marginBottom: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  }
});

