import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import React, { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, useThemeColors } from "@/src/constants/colors";
import { useTheme } from "@/src/context/ThemeContext";
import { useTrips } from "@/src/hooks/queries/useTrips";
import TripCardSkeleton from "@/src/components/skeleton/TripCardSkeleton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ActiveTripCard from "@/src/components/wallet/ActiveTripCard";
import { UserTrip } from "@/src/types/interfaces";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function ActiveTrips() {
  const insets = useSafeAreaInsets();
  const { data: userTrips = [], isLoading: loading } = useTrips();
  const router = useRouter();
  const colors = useThemeColors();
  const { isDark } = useTheme();

  const sortedTrips = useMemo(() => {
    return (userTrips || [])
      .filter((t: UserTrip) => t.isActive || t.isFinished)
      .sort((a, b) => {

        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;

        const parseDate = (val: any) => {
          if (!val) return 0;
          if (val.seconds) return val.seconds * 1000;
          return new Date(val).getTime();
        };

        if (a.isFinished && b.isFinished) {
          return parseDate(b.completedAt) - parseDate(a.completedAt);
        }

        return parseDate(b.activatedAt) - parseDate(a.activatedAt);
      });
  }, [userTrips]);

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.BACKGROUND }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
          <Text style={[styles.subtitle, { color: colors.MUTED_TEXT }]}>MY JOURNEY HISTORY</Text>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.TEXT }]}>Active Trips</Text>
            <View style={[styles.goldDot, { backgroundColor: colors.GOLD }]} />
          </View>
        </View>

        {loading ? (
          <View style={{ marginTop: 20, paddingHorizontal: width * 0.03, gap: 15 }}>
            <TripCardSkeleton />
            <TripCardSkeleton />
            <TripCardSkeleton />
          </View>
        ) : sortedTrips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="bag-checked"
              size={width * 0.2}
              color={colors.GRAY}
            />
            <Text style={[styles.emptyTitle, { color: colors.GRAY }]}>You have no active trips.</Text>
            <Text style={[styles.emptySubtitle, { color: colors.GRAY }]}>
              Activate a trip from the "My Trips" details page to manage its
              expenses and itinerary here.
            </Text>
            <TouchableOpacity
              style={[styles.exploreBtn, { backgroundColor: colors.PRIMARY }]}
              onPress={() => router.push("/mytrip")}
            >
              <Text style={[styles.exploreBtnText, { color: colors.WHITE }]}>Browse My Portfolio</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {sortedTrips.map((trip) => (
              <ActiveTripCard key={trip.id} trip={trip as any} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: width * 0.03,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: "outfitMedium",
    fontSize: 11,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: -4,
  },
  title: {
    fontFamily: "playfairBold",
    fontSize: 36,
    lineHeight: 48,
  },
  goldDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginLeft: 2,
    marginBottom: 8,
  },
  loader: {
    marginTop: height * 0.1,
  },
  emptyContainer: {
    marginTop: height * 0.3,
    alignItems: "center",
    paddingHorizontal: width * 0.03,
  },
  emptyTitle: {
    fontFamily: "outfitMedium",
    fontSize: 20,
    marginTop: height * 0.02,
  },
  emptySubtitle: {
    fontFamily: "outfit",
    fontSize: 14,
    marginTop: height * 0.01,
    textAlign: "center",
    lineHeight: 22,
  },
  exploreBtn: {
    marginTop: 35,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  exploreBtnText: {
    fontFamily: "outfitBold",
    fontSize: 15,
  },
  listContainer: {
    paddingHorizontal: width * 0.03,
    marginTop: 10,
    gap: 15,
  },
});
