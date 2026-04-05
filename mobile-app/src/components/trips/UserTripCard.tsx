import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import moment from "moment";
import { Colors } from "@/src/constants/colors";
import { Typography, Radius, Shadow, Spacing } from "@/src/constants/theme";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import SafarAlert from "@/src/components/ui/SafarAlert";
import { concertImages, fallbackImages } from "@/src/constants/travel-data";
import { Image } from "expo-image";
import { UserTripCardProps } from "@/src/types/interfaces";
import { apiDelete } from "@/src/lib/api";

const { width } = Dimensions.get("window");

export default function UserTripCard({ trip, onDelete }: UserTripCardProps) {
  const router = useRouter();
  const [deleteVisible, setDeleteVisible] = React.useState(false);

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

  const tripName = (trip?.concertData || trip?.savedTrip?.trip_plan?.festival || (trip as any)?.festival)
    ? `${trip?.concertData?.artist || trip?.savedTrip?.trip_plan?.festival || (trip as any)?.festival}${((trip?.concertData?.artist || trip?.savedTrip?.trip_plan?.festival || (trip as any)?.festival) as string).toLowerCase().includes("concert") ? "" : " Concert"}`
    : isConcertLegacy 
      ? (trip?.savedTripId || "").split("-")[0].split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") + ( (trip?.savedTripId || "").toLowerCase().includes("concert") ? "" : " Concert")
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

  const finalSource = useMemo(() => {
    const personalImages = trip?.concertData?.image_urls;
    if (personalImages && Array.isArray(personalImages) && personalImages.length > 0) {
      return { uri: personalImages[0] };
    }

    const legacyImg = (trip as any)?.imageUrl || (trip as any)?.image_urls;
    if (Array.isArray(legacyImg) && legacyImg.length > 0) return { uri: legacyImg[0] };
    if (typeof legacyImg === "string" && legacyImg.trim().length > 0) return { uri: legacyImg };

    if (trip?.savedTrip?.image_urls && trip.savedTrip.image_urls.length > 0) {
      return { uri: trip.savedTrip.image_urls[0] };
    }

    if (trip?.concertData || isConcertLegacy) return { uri: concertFallback };
    return { uri: randomFallback };
  }, [trip, randomFallback, concertFallback, isConcertLegacy]);

  const handleDeleteFinal = async () => {
    try {
      await apiDelete(`/api/trips/${trip.id}`);
      onDelete?.(trip.id);
      setDeleteVisible(false);
    } catch {
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/trip-details",
          params: {
            trip: JSON.stringify(trip),
            imageUrl: finalSource.uri,
          },
        } as any)
      }
    >
      <Image source={finalSource} style={styles.bannerImage} transition={400} />
      <View style={styles.overlay} />

      {(trip?.concertData || trip?.savedTrip?.trip_plan?.festival || isConcertLegacy) && (
        <View style={styles.badgeContainer}>
          <View style={styles.eventBadge}>
            <Text style={styles.badgeText}>LIVE EVENT</Text>
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
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
    overflow: "hidden",
    backgroundColor: Colors.SURFACE,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    ...Shadow.card,
  },
  bannerImage: { ...StyleSheet.absoluteFillObject },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.32)",
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
});
