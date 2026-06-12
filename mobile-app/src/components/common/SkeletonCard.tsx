import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated } from "react-native";
import { useThemeColors, SKELETON_CONFIG } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { SkeletonCardProps } from "@/src/constants/types/ui";

export default function SkeletonCard({ cardHeight = SKELETON_CONFIG.DEFAULT_HEIGHT }: SkeletonCardProps) {
  const colors = useThemeColors();
  const { isDark } = useTheme();

  const opacityAnim = useRef(new Animated.Value(SKELETON_CONFIG.BASE_OPACITY)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: SKELETON_CONFIG.ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: SKELETON_CONFIG.BASE_OPACITY,
          duration: SKELETON_CONFIG.ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacityAnim]);

  const baseColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const highlightColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: cardHeight,
          backgroundColor: baseColor,
          opacity: opacityAnim
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.titleSkeleton, { backgroundColor: highlightColor }]} />
        <View style={[styles.descSkeleton, { backgroundColor: highlightColor }]} />
        <View style={[styles.descSkeletonShort, { backgroundColor: highlightColor }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  content: {
    padding: 16,
    gap: 8,
  },
  titleSkeleton: {
    height: 28,
    width: "60%",
    borderRadius: 8,
    marginBottom: 4,
  },
  descSkeleton: {
    height: 14,
    width: "90%",
    borderRadius: 6,
  },
  descSkeletonShort: {
    height: 14,
    width: "70%",
    borderRadius: 6,
  },
});
