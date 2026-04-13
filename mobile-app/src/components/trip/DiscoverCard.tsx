import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { Colors, useThemeColors } from "@/src/constants/colors";
import { trendingTripCardImages } from "@/src/constants/travel-data";
import { DiscoverCardProps } from "@/src/types/interfaces";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

const DISCOVER_IMAGES = [...trendingTripCardImages];
const { width, height: screenHeight } = Dimensions.get("window");

export default function DiscoverCard({
  option,
  selectedOption,
  cardHeight,
  hideTag,
}: DiscoverCardProps) {
  const isSelected = selectedOption?.id === option?.id;
  const defaultHeight = screenHeight * 0.18;
  const cardRadius = 24;
  const colors = useThemeColors();

  const originalSource = React.useMemo(() => {
    if (option?.image) {
      return typeof option.image === "string"
        ? { uri: option.image }
        : option.image;
    }
    const fallbackIndex = (option?.id || 0) % DISCOVER_IMAGES.length;
    return { uri: DISCOVER_IMAGES[fallbackIndex] };
  }, [option]);

  const [imgSource, setImgSource] = React.useState(originalSource);

  React.useEffect(() => {
    setImgSource(originalSource);
  }, [originalSource]);

  const handleError = () => {
    const randomIdx = Math.floor(Math.random() * DISCOVER_IMAGES.length);
    setImgSource({ uri: DISCOVER_IMAGES[randomIdx] });
  };

  const hasSpecialTag = option?.festival && !hideTag;

  return (
    <View
      style={[
        styles.container,
        {
          height: cardHeight || defaultHeight,
          borderRadius: cardRadius,
          borderColor: colors.PRIMARY,
          borderWidth: isSelected ? 3 : 0,
        },
      ]}
    >
      <Image
        source={imgSource}
        onError={handleError}
        contentFit="cover"
        style={StyleSheet.absoluteFill}
        transition={500}
      />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.85)"]}
        style={styles.gradient}
      />

      {hasSpecialTag && option?.festival && (
        <View style={styles.topRow}>
          <BlurView intensity={30} tint="light" style={styles.badge}>
            <Text style={styles.badgeText}>
              {option.festival.toUpperCase()}
            </Text>
          </BlurView>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {option?.title || option?.name || "Discovery"}
          </Text>
          {isSelected && (
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.GOLD} />
            </View>
          )}
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {option?.desc || "Experience the unknown"}
        </Text>

        {option?.Highlights && (
          <View style={styles.highlightsContainer}>
            <Ionicons name="rocket-outline" size={12} color={Colors.GOLD} />
            <Text style={styles.highlightsText} numberOfLines={1}>
              {option.Highlights}
            </Text>
          </View>
        )}

        {option?.auspiciousDay && (
          <View style={styles.dateBadge}>
            <Ionicons name="calendar" size={11} color={Colors.GOLD_LIGHT} />
            <Text style={styles.dateText} numberOfLines={1}>
              Recommended: {option.auspiciousDay}
            </Text>
          </View>
        )}
      </View>

      {option?.icon && (
        <Text style={styles.floatingIcon}>
          {option.icon}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#eee",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
  },
  topRow: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  badgeText: {
    fontFamily: "outfitBold",
    fontSize: 9,
    color: "white",
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: "playfairBold",
    color: "white",
    flex: 1,
  },
  checkIcon: {
    marginLeft: 8,
  },
  description: {
    fontSize: 13,
    fontFamily: "outfit",
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 8,
    lineHeight: 18,
  },
  highlightsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    gap: 6,
  },
  highlightsText: {
    fontSize: 11,
    fontFamily: "outfitMedium",
    color: Colors.GOLD_LIGHT,
    letterSpacing: 0.3,
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 5,
  },
  dateText: {
    fontSize: 11,
    fontFamily: "outfitBold",
    color: Colors.WHITE,
    opacity: 0.9,
  },
  floatingIcon: {
    position: "absolute",
    top: 12,
    left: 12,
    fontSize: 24,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
