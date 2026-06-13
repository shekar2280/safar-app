import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Colors, useThemeColors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { useRouter, useNavigation } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import SafarAlert from "@/src/components/ui/SafarAlert";
import { useActiveTrip } from "@/src/context/ActiveTripContext";
import { useUser } from "@/src/context/UserContext";
import { apiPatch } from "@/src/lib/api";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { fallbackImages } from "@/src/constants";
import { ActiveTripCardProps } from "@/src/constants";
import { useQueryClient } from "@tanstack/react-query";
import { tripQueryKeys } from "@/src/hooks/queries/useTrips";
import * as Sentry from "@sentry/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ActiveTripCard({ trip }: ActiveTripCardProps) {
  const { setActiveTrip } = useActiveTrip();
  const queryClient = useQueryClient();
  const router = useRouter();
  const colors = useThemeColors();
  const { isDark } = useTheme();
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveVisible, setArchiveVisible] = useState(false);
  
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigation = useNavigation();
  const [currency, setCurrency] = useState("₹");

  const loadCurrency = async () => {
    if (trip?.id) {
      const saved = await AsyncStorage.getItem(`currency_${trip.id}`);
      if (saved) {
        setCurrency(saved);
      } else {
        setCurrency("₹");
      }
    }
  };

  useEffect(() => {
    loadCurrency();
    const unsubscribe = navigation.addListener("focus", loadCurrency);
    return unsubscribe;
  }, [navigation, trip?.id]);

  const randomFallback = useMemo(() => {
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  }, [trip?.id]);

  const tripImageSource = useMemo(() => {
    const personalImages = trip?.concertData?.image_urls || trip?.concertData?.imageUrl;
    if (Array.isArray(personalImages) && personalImages.length > 0) {
      return { uri: personalImages[0] };
    } else if (typeof personalImages === "string" && personalImages.trim().length > 0) {
      return { uri: personalImages };
    }

    const img = trip?.imageUrl;
    if (Array.isArray(img) && img.length > 0) {
      return { uri: img[1] || img[0] };
    }
    if (typeof img === "string" && img.trim().length > 0) {
      return { uri: img };
    }
    return randomFallback;
  }, [trip?.imageUrl, trip?.concertData, randomFallback]);

  const tripName = trip?.concertData?.artist
    ? `${trip.concertData.artist} Concert`
    : trip?.tripPlan?.tripName || "Active Trip";

  const goToPlanner = () => {
    setActiveTrip(trip as any);
    router.push("/day-planner-details" as any);
  };

  const goToWallet = () => {
    setActiveTrip(trip as any);
    router.push({
      pathname: "/wallet-details",
      params: { tripId: trip.id },
    } as any);
  };

  const handleResetWallet = () => {
    setArchiveVisible(true);
  };

  const handleArchiveConfirmed = async () => {
    try {
      if (!trip.id) return;
      setArchiveVisible(false);
      setIsArchiving(true);

      await apiPatch(`/api/v1/trips/${trip.id}/deactivate`, {});

      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
      setIsArchiving(false);
    } catch (error) {
      Sentry.captureException(error, { extra: { context: "ActiveTripCard:handleArchiveConfirmed", tripId: trip.id } });
      setIsArchiving(false);
      setErrorTitle("Archive Failed");
      setErrorMessage("Something went wrong while finalizing your journey history. Please try again.");
      setErrorVisible(true);
    }
  };

  return (
    <View style={[styles.cardContainer, { backgroundColor: colors.SURFACE, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }]}>
      <TouchableOpacity activeOpacity={0.95} style={[styles.card, { backgroundColor: colors.LIGHT_GRAY }]} onPress={goToPlanner} disabled={isArchiving}>
        <Image source={tripImageSource} style={styles.bannerImage} transition={500} />

        <View style={styles.topRow}>
          <BlurView intensity={75} tint={isDark ? "dark" : "light"} style={[styles.liveBadge, { borderColor: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)" }]}>
            <View style={[styles.statusDot, trip.isFinished && { backgroundColor: colors.GRAY }]} />
            <Text style={[styles.liveText, { color: isDark ? colors.WHITE : colors.TEXT }]}>
              {isArchiving ? "ARCHIVING..." : trip.isFinished ? "COMPLETED" : "ON JOURNEY"}
            </Text>
          </BlurView>

          {!trip.isFinished && !isArchiving && (
            <TouchableOpacity onPress={handleResetWallet} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color="white" />
            </TouchableOpacity>
          )}

          {isArchiving && <ActivityIndicator size="small" color="#FFF" />}
        </View>

        <View style={styles.bottomSection}>
          <BlurView intensity={80} tint="dark" style={styles.glassPanel}>
            <View style={styles.infoCol}>
              <Text style={styles.title} numberOfLines={1}>
                {tripName}
              </Text>
              <View style={styles.budgetRow}>
                <MaterialCommunityIcons name="wallet-outline" size={16} color="rgba(255,255,255,0.6)" />
                <Text style={styles.budgetText}>
                  {trip.totalBudget && trip.totalBudget > 0
                    ? `${currency}${Number(trip.totalBudget).toLocaleString()}`
                    : "Not initialized yet"}
                </Text>
              </View>
            </View>

            <View style={styles.actionGroup}>
              <TouchableOpacity onPress={goToPlanner} style={styles.actionIconBtn} disabled={isArchiving}>
                <Ionicons name="compass-outline" size={24} color="white" />
                <Text style={styles.actionLabel}>GUIDE</Text>
              </TouchableOpacity>

              <View style={styles.verticalDivider} />

              <TouchableOpacity onPress={goToWallet} style={styles.actionIconBtn} disabled={isArchiving}>
                <Ionicons name="wallet-outline" size={24} color="white" />
                <Text style={styles.actionLabel}>WALLET</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </TouchableOpacity>

      <SafarAlert
        visible={archiveVisible}
        title="Finalize Journey"
        message="Completing this journey will archive your spending records and finalize your current itinerary. This action is permanent."
        type="confirm"
        confirmText="Archive"
        cancelText="Keep Going"
        onConfirm={handleArchiveConfirmed}
        onCancel={() => setArchiveVisible(false)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 0.3,
    borderColor: Colors.WHITE,
  },
  card: { height: 160, borderRadius: 20, overflow: "hidden" },
  bannerImage: { ...StyleSheet.absoluteFillObject },
  topRow: { flexDirection: "row", justifyContent: "space-between", padding: 16, alignItems: 'center' },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#34C759", marginRight: 6 },
  liveText: { color: "white", fontFamily: "outfitBold", fontSize: 10, letterSpacing: 1.2 },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(214, 17, 17, 0.49)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  bottomSection: { position: "absolute", bottom: 0, width: "100%", padding: 12 },
  glassPanel: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  infoCol: { flex: 1 },
  title: { color: "white", fontFamily: "outfitBold", fontSize: 20, letterSpacing: -0.5 },
  budgetRow: { flexDirection: "row", alignItems: "center", marginTop: 2, gap: 4 },
  budgetText: { color: "rgba(255,255,255,0.7)", fontFamily: "outfit", fontSize: 13 },
  actionGroup: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionIconBtn: { alignItems: "center", justifyContent: "center", minWidth: 50 },
  actionLabel: { color: "white", fontFamily: "outfitMedium", fontSize: 10, marginTop: 4 },
  verticalDivider: { width: 1, height: 24, backgroundColor: "rgba(255,255,255,0.2)" },
});
