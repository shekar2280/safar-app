import React, { useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  LayoutChangeEvent,
  Animated,
} from "react-native";
import moment from "moment";
import { Colors, useThemeColors } from "@/src/constants/colors";
import { Typography, Radius, Shadow, Spacing } from "@/src/constants/theme";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import SafarAlert from "@/src/components/ui/SafarAlert";
import { concertImages, fallbackImages } from "@/src/constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { UserTripCardProps, AlertType } from "@/src/constants";
import { apiDelete } from "@/src/lib/api";
import * as Sentry from "@sentry/react-native";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

const UserTripCard = React.memo(({ trip, onDelete, isPaused, isVisible = true }: UserTripCardProps) => {
  const router = useRouter();
  const colors = useThemeColors();
  const { isDark } = useTheme();
  const [deleteVisible, setDeleteVisible] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [cardWidth, setCardWidth] = React.useState(width * 0.94);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const imageLengthRef = useRef(0);
  const pressAnimRef = useRef(new Animated.Value(1)).current;
  const isNavigatingRef = useRef(false);

  const [errorVisible, setErrorVisible] = React.useState(false);
  const [errorTitle, setErrorTitle] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

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

  const isConcert = !!trip?.concertData || isConcertLegacy;

  const tripName = trip?.concertData
    ? `${trip?.concertData?.artist}${trip?.concertData?.artist?.toLowerCase().includes("concert") ? "" : " Concert"}`
    : trip?.tripPlan?.tripName
      ? trip.tripPlan.tripName
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

    if (isConcert) {
      if (uniqueUrls.length > 0) return [{ uri: uniqueUrls[0] }];
      return [{ uri: concertFallback }];
    }

    if (uniqueUrls.length > 0) return uniqueUrls.map(u => ({ uri: u }));

    return [{ uri: randomFallback }];
  }, [trip, randomFallback, concertFallback, isConcert]);

  imageLengthRef.current = imageSources.length;

  const isAutoplayPausedRef = React.useRef(false);
  const isDraggingRef = React.useRef(false);
  const pauseTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetAutoplayTimer = React.useCallback(() => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }
    pauseTimerRef.current = setTimeout(() => {
      isAutoplayPausedRef.current = false;
    }, 5000);
  }, []);

  React.useEffect(() => {
    return () => {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    setActiveIndex(0);
    scrollViewRef.current?.scrollTo({ x: 0, animated: false });
  }, [trip?.id]);

  React.useEffect(() => {
    if (imageLengthRef.current <= 1 || isPaused || !isVisible) return;

    const interval = setInterval(() => {
      if (isDraggingRef.current || isAutoplayPausedRef.current) {
        return;
      }
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % imageLengthRef.current;
        scrollViewRef.current?.scrollTo({ x: nextIndex * cardWidth, animated: true });
        return nextIndex;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isPaused, isVisible, cardWidth]);

  const handleScroll = React.useCallback((event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const slideSize = event.nativeEvent.layoutMeasurement.width || cardWidth;
    if (slideSize > 0) {
      const index = Math.round(scrollOffset / slideSize);
      if (index >= 0 && index < imageSources.length) {
        setActiveIndex((prev) => (prev !== index ? index : prev));
      }
    }
  }, [imageSources.length, cardWidth]);

  const onScrollEnd = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width || cardWidth;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index >= 0 && index < imageSources.length) {
      setActiveIndex((prev) => (prev !== index ? index : prev));
    }
    isDraggingRef.current = false;
  };

  const handleDeleteFinal = async () => {
    try {
      setIsDeleting(true);
      await apiDelete(`/api/v1/trips/${trip.id}`);
      onDelete?.(trip.id);
      setIsDeleting(false);
      setDeleteVisible(false);
    } catch (err) {
      Sentry.captureException(err, { extra: { context: "UserTripCard:handleDeleteFinal", tripId: trip.id } });
      setIsDeleting(false);
      setDeleteVisible(false);
      setErrorTitle("Delete Failed");
      setErrorMessage("Something went wrong while trying to remove your journey. Please check your connection.");
      setErrorVisible(true);
    }
  };

  const animatePressIn = () => {
    Animated.spring(pressAnimRef, {
      toValue: 0.965,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const animatePressOut = () => {
    Animated.spring(pressAnimRef, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressCard = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    requestAnimationFrame(() => {
      animatePressOut();
      router.push({
        pathname: "/trip-details",
        params: {
          tripId: trip.id,
          imageUrl: imageSources[activeIndex]?.uri || imageSources[0]?.uri,
        },
      } as any);
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 800);
    });
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.SURFACE,
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
          transform: [{ scale: pressAnimRef }],
        }
      ]}
      onLayout={onLayout}
    >
      <View style={[StyleSheet.absoluteFill, { borderRadius: 20, overflow: 'hidden' }]}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled={false}
          snapToInterval={cardWidth}
          snapToAlignment="start"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onScrollBeginDrag={() => {
            isDraggingRef.current = true;
            isAutoplayPausedRef.current = true;
            if (pauseTimerRef.current) {
              clearTimeout(pauseTimerRef.current);
            }
          }}
          onMomentumScrollEnd={(event) => {
            onScrollEnd(event);
            resetAutoplayTimer();
          }}
          onScrollEndDrag={(event) => {
            onScrollEnd(event);
            resetAutoplayTimer();
          }}
        >
          {imageSources.map((item, index) => (
            <TouchableOpacity
              key={`${trip.id}-${index}`}
              activeOpacity={1}
              onPressIn={animatePressIn}
              onPressOut={animatePressOut}
              onPress={handlePressCard}
              style={{ width: cardWidth, height: 230 }}
            >
              <Image
                source={item}
                style={[StyleSheet.absoluteFill, { backgroundColor: colors.SURFACE_LIGHT }]}
                contentFit="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.85)"]}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {imageSources.length > 1 && (
        <View style={styles.paginationContainer} pointerEvents="none">
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

      <View style={styles.badgeContainer} pointerEvents="none">
        {isConcert && (
          <View style={[styles.eventBadge, { backgroundColor: colors.SECONDARY }]}>
            <Text style={[styles.badgeText, { color: Colors.BLACK }]}>CONCERT</Text>
          </View>
        )}
        {trip.isActive && (
          <View style={[styles.eventBadge, { backgroundColor: colors.GREEN || "#10B981" }]}>
            <Text style={[styles.badgeText, { color: Colors.WHITE }]}>ACTIVE</Text>
          </View>
        )}
        {trip.isFinished && (
          <View style={[styles.eventBadge, { backgroundColor: "rgba(100, 116, 139, 0.8)" }]}>
            <Text style={[styles.badgeText, { color: Colors.WHITE }]}>COMPLETED</Text>
          </View>
        )}
      </View>

      <View style={styles.content} pointerEvents="box-none">
        <TouchableOpacity
          style={{ flex: 1 }}
          onPressIn={animatePressIn}
          onPressOut={animatePressOut}
          onPress={handlePressCard}
          activeOpacity={1}
        >
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
        </TouchableOpacity>

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
        loading={isDeleting}
        onConfirm={handleDeleteFinal}
        onCancel={() => setDeleteVisible(false)}
      />

      <SafarAlert
        visible={errorVisible}
        title={errorTitle}
        message={errorMessage}
        type="error"
        confirmText="OK"
        onConfirm={() => setErrorVisible(false)}
        onCancel={() => setErrorVisible(false)}
      />
    </Animated.View>
  );
});

export default UserTripCard;

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
    flexDirection: "row",
    gap: 6,
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
