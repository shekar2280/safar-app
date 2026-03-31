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
    (trip as any)?.tripData ||
    (trip as any)?.discoverData ||
    (trip as any)?.festiveData ||
    (trip as any)?.concertData ||
    (trip as any)?.trendingData ||
    {};

  const tripName = trip?.concertData?.artist
    ? `${trip.concertData.artist} Concert`
    : trip?.savedTripId
      ? trip.savedTripId.split("-")[0].charAt(0).toUpperCase() +
        trip.savedTripId.split("-")[0].slice(1)
      : "My Trip";

  const randomFallback = useMemo(() => {
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  }, [trip?.id]);

  const concertFallback = useMemo(() => {
    return concertImages[Math.floor(Math.random() * concertImages.length)];
  }, [trip?.id]);

  const finalSource = useMemo(() => {
    if (trip?.concertData) {
      const concertImg =
        trip?.concertData?.artistImageUrl ||
        trip?.concertData?.locationInfo?.coordinates ||
        trip?.imageUrl;
      return concertImg ? { uri: concertImg as string } : { uri: concertFallback };
    }
    const img = trip?.imageUrl;
    if (Array.isArray(img) && img.length > 0) return { uri: img[0] };
    if (typeof img === "string" && img.trim().length > 0) return { uri: img };
    return { uri: randomFallback };
  }, [trip, randomFallback, concertFallback]);

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

      <View style={styles.content}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={2}>
            {tripName}
          </Text>
          <Text style={styles.dateText}>
            {moment(tripData.startDate).format("DD MMM YYYY")} •{" "}
            {trip?.traveler?.title || "1"}
          </Text>
        </View>

        <TouchableOpacity onPress={() => setDeleteVisible(true)} style={styles.deleteBtn}>
          <MaterialIcons name="delete-outline" size={22} color="rgba(247, 13, 13, 0.73)" />
        </TouchableOpacity>
      </View>

      <SafarAlert
        visible={deleteVisible}
        title="Delete Trip"
        message="Are you sure you want to remove this journey? This action cannot be undone."
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
});
