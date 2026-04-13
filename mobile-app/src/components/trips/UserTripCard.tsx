import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  LayoutChangeEvent,
} from "react-native";
import moment from "moment";
import { Colors, useThemeColors } from "@/src/constants/colors";
import { Typography, Radius, Shadow, Spacing } from "@/src/constants/theme";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import SafarAlert from "@/src/components/ui/SafarAlert";
import { concertImages, fallbackImages } from "@/src/constants/travel-data";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { UserTripCardProps } from "@/src/types/interfaces";
import { apiDelete } from "@/src/lib/api";

const { width } = Dimensions.get("window");

export default function UserTripCard({ trip, onDelete }: UserTripCardProps) {
  const router = useRouter();
  const colors = useThemeColors();
  const { isDark } = useTheme();
  const [deleteVisible, setDeleteVisible] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [cardWidth, setCardWidth] = React.useState(width - 40);
  const flatListRef = React.useRef<FlatList>(null);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0) setCardWidth(width);
  };

  const tripData =
    trip?.concertData ||
    (trip as any)?.tripData ||
    (trip as any)?.discoverData ||
    (trip as any)?.festiveData ||
    (trip as any)?.trendingData ||
    {};

  const isConcertLegacy = useMemo(() => {
    const searchStr = (trip?.savedTripId || trip?.savedTrip?.normalized_key || "").toLowerCase();
    const keywords = ["center", "stadium", "arena", "theater", "theatre", "hall", "atx", "bowl", "concert"];
    return keywords.some(k => searchStr.includes(k));
  }, [trip]);

  const tripName = (trip?.concertData || trip?.savedTrip?.trip_plan?.festival)
    ? `${trip?.concertData?.artist || trip?.savedTrip?.trip_plan?.festival}${((trip?.concertData?.artist || trip?.savedTrip?.trip_plan?.festival) as string || "").toLowerCase().includes("concert") ? "" : " Concert"}`
    : isConcertLegacy
      ? (trip?.savedTripId || "").split("-")[0].split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") + ((trip?.savedTripId || "").toLowerCase().includes("concert") ? "" : " Concert")
      : (trip?.savedTrip?.normalized_key || (trip as any)?.savedTripId)
        ? (trip?.savedTrip?.normalized_key || (trip as any)?.savedTripId).split("-")[0].charAt(0).toUpperCase() +
        (trip?.savedTrip?.normalized_key || (trip as any)?.savedTripId).split("-")[0].slice(1)
        : "My Trip";

  const randomFallback = useMemo(() => {
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  }, [trip?.id]);

  const concertFallback = useMemo(() => {
    return concertImages[Math.floor(Math.random() * concertImages.length)];
  }, [trip?.id]);

  const imageSources = useMemo(() => {
    let urls: string[] = [];

    const personalImages = trip?.concertData?.image_urls;
    if (Array.isArray(personalImages)) urls.push(...personalImages);

    const legacyImg = (trip as any)?.imageUrl || (trip as any)?.image_urls;
    if (Array.isArray(legacyImg)) urls.push(...legacyImg);
    else if (typeof legacyImg === "string" && legacyImg.trim()) urls.push(legacyImg);

    if (Array.isArray(trip?.savedTrip?.image_urls)) {
      urls.push(...trip.savedTrip.image_urls);
    }

    const aiPlanImages = trip?.tripPlan?.imageUrl;
    if (Array.isArray(aiPlanImages)) urls.push(...aiPlanImages);
    else if (typeof aiPlanImages === "string" && aiPlanImages.trim()) urls.push(aiPlanImages);

    const uniqueUrls = Array.from(new Set(urls))
      .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
      .map(u => u.trim());

    if (trip?.concertData || trip?.savedTrip?.trip_plan?.festival || isConcertLegacy) {
      if (uniqueUrls.length > 0) return [{ uri: uniqueUrls[0] }];
      return [{ uri: concertFallback }];
    }

    if (uniqueUrls.length > 0) return uniqueUrls.map(u => ({ uri: u }));

    return [{ uri: randomFallback }];
  }, [trip, randomFallback, concertFallback, isConcertLegacy]);

  React.useEffect(() => {
    if (imageSources.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % imageSources.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex, imageSources.length]);

  const onScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index !== activeIndex && index >= 0 && index < imageSources.length) {
      setActiveIndex(index);
    }
  };

  const getItemLayout = (_: any, index: number) => ({
    length: cardWidth,
    offset: cardWidth * index,
    index,
  });

  const handleDeleteFinal = async () => {
    try {
      await apiDelete(`/api/v1/trips/${trip.id}`);
      onDelete?.(trip.id);
      setDeleteVisible(false);
    } catch {
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.SURFACE, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }]}
      onLayout={onLayout}
      onPress={() =>
        router.push({
          pathname: "/trip-details",
          params: {
            trip: JSON.stringify(trip),
            imageUrl: imageSources[activeIndex]?.uri || imageSources[0]?.uri,
          },
        } as any)
      }
    >
      <View style={[StyleSheet.absoluteFill, { borderRadius: 20, overflow: 'hidden' }]}>
        <FlatList
          ref={flatListRef}
          data={imageSources}
          horizontal
          pagingEnabled
          decelerationRate="fast"
          snapToInterval={cardWidth}
          snapToAlignment="center"
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          getItemLayout={getItemLayout}
          keyExtractor={(_, index) => index.toString()}
          initialNumToRender={5}
          windowSize={2}
          maxToRenderPerBatch={5}
          removeClippedSubviews={false}
          renderItem={({ item, index }) => (
            <View style={{ width: cardWidth, height: 230 }}>
              <Image
                source={item}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                priority="high"
                cachePolicy="disk"
                placeholder={{ blurhash: "L6PZf6ayfQfQfQfQfQfQfQfQfQfQ" }}
                transition={200}
                recyclingKey={trip.id + index}
              />
            </View>
          )}
        />
      </View>

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.85)"]}
        style={styles.bottomGradient}
      />

      {imageSources.length > 1 && (
        <View style={styles.paginationContainer}>
          {imageSources.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex && styles.activeDot
              ]}
            />
          ))}
        </View>
      )}

      {(trip?.concertData || trip?.savedTrip?.trip_plan?.festival || isConcertLegacy) && (
        <View style={styles.badgeContainer}>
          <View style={[styles.eventBadge, { backgroundColor: colors.SECONDARY }]}>
            <Text style={[styles.badgeText, { color: isDark ? colors.BLACK : colors.WHITE }]}>CONCERT</Text>
          </View>
        </View>
      )}

      <View style={styles.content}>
        <View style={{ flex: 1 }}>
          <Text
            style={styles.title}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {tripName}
          </Text>
          <Text style={styles.dateText}>
            {(trip?.concertData?.concertDate) ? (
              <>
                <MaterialIcons name="calendar-today" size={14} color="rgba(249,250,251,0.86)" />
                {` ${trip?.concertData?.concertDate} • ${trip?.concertData?.venueName || "Venue"}`}
              </>
            ) : (
              `${trip.totalDays} ${trip.totalDays === 1 ? "Day" : "Days"} • ${trip?.traveler?.title || "1"}`
            )}
          </Text>
        </View>

        <TouchableOpacity onPress={() => setDeleteVisible(true)} style={styles.deleteBtn}>
          <MaterialIcons name="delete-outline" size={22} color="rgba(247, 13, 13, 0.73)" />
        </TouchableOpacity>
      </View>

      <SafarAlert
        visible={deleteVisible}
        title="Delete Journey"
        message="Are you sure you want to permanently remove this trip from your collection? This action cannot be revoked."
        type="confirm"
        confirmText="Delete"
        cancelText="Keep Trip"
        onConfirm={handleDeleteFinal}
        onCancel={() => setDeleteVisible(false)}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 230,
    borderRadius: 20,
    marginBottom: Spacing.lg,
    overflow: "hidden",
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  bannerImage: { ...StyleSheet.absoluteFillObject },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    opacity: 0.8,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  title: {
    ...Typography.body,
    fontFamily: "outfitBold",
    fontSize: width * 0.058,
    lineHeight: width * 0.07,
    color: Colors.WHITE,
  },
  dateText: {
    ...Typography.bodyMuted,
    fontSize: width * 0.037,
    color: "rgba(249,250,251,0.86)",
    marginTop: 6,
  },
  deleteBtn: {
    width: 46,
    height: 46,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(15,23,42,0.78)",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeContainer: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 10,
  },
  eventBadge: {
    backgroundColor: Colors.SECONDARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    ...Shadow.sm,
  },
  badgeText: {
    fontFamily: "outfitBold",
    fontSize: 9,
    color: Colors.BLACK,
    letterSpacing: 2,
  },
  paginationContainer: {
    position: 'absolute',
    top: 15,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 5,
    zIndex: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeDot: {
    backgroundColor: 'white',
    width: 6,
  },
});
