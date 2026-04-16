import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LockedSightProps {
  count: number;
  isDark: boolean;
  colors: any;
}

export const LockedSight: React.FC<LockedSightProps> = ({ count, isDark, colors }) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.65],
  });

  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const lockBg = colors.GOLD_MUTED;

  return (
    <View style={styles.wrapper}>
      <View style={styles.timelineContainer}>
        <View style={[styles.timelineDot, { borderColor }]} />
        <View style={[styles.timelineLine, { borderColor }]} />
      </View>

      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: cardBg,
            borderColor,
            opacity: shimmerOpacity,
          },
        ]}
      >
        <View style={[styles.lockCircle, { backgroundColor: lockBg }]}>
          <Ionicons name="lock-closed" size={18} color={colors.GOLD} />
        </View>

        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: colors.MUTED_TEXT }]}>
            {count === 1
              ? "1 Hidden Sight Ahead"
              : `${count} Hidden Sights Ahead`}
          </Text>
          <Text style={[styles.subtitle, { color: colors.MUTED_TEXT }]}>
            Complete your current stop to reveal the next destination
          </Text>
        </View>

        <View style={styles.fogLines}>
          {[0.5, 0.35, 0.2].map((opacity, i) => (
            <View
              key={i}
              style={[
                styles.fogLine,
                {
                  backgroundColor: isDark
                    ? `rgba(255,255,255,${opacity * 0.25})`
                    : `rgba(0,0,0,${opacity * 0.1})`,
                  width: `${85 - i * 15}%`,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    marginBottom: 8,
  },
  timelineContainer: {
    width: 32,
    alignItems: "center",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderStyle: "dashed",
    marginTop: 8,
    zIndex: 2,
  },
  timelineLine: {
    width: 1.5,
    flex: 1,
    borderStyle: "dashed",
    borderWidth: 0.75,
    marginTop: 4,
    borderRadius: 1,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginLeft: 10,
    marginRight: 20,
    marginBottom: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
  },
  lockCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: "outfitBold",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontFamily: "outfit",
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.7,
  },
  fogLines: {
    position: "absolute",
    bottom: 10,
    left: 68,
    right: 16,
    gap: 6,
    alignItems: "flex-start",
  },
  fogLine: {
    height: 4,
    borderRadius: 2,
  },
});
