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
import { Colors } from "@/src/constants/colors";
import { useUser } from "@/src/context/UserContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ActiveTripCard from "@/src/components/wallet/ActiveTripCard";
import { UserTrip } from "@/src/types/interfaces";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function ActiveTrips() {
  const insets = useSafeAreaInsets();
  const { userTrips, loading } = useUser();
  const router = useRouter();

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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
          <Text style={styles.subtitle}>MY JOURNEY HISTORY</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Active Trips</Text>
            <View style={styles.goldDot} />
          </View>
        </View>

        {loading && (
          <ActivityIndicator
            size="large"
            color={Colors.PRIMARY}
            style={styles.loader}
          />
        )}

        {!loading && sortedTrips.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="bag-checked"
              size={width * 0.2}
              color={Colors.GRAY}
            />
            <Text style={styles.emptyTitle}>You have no active trips.</Text>
            <Text style={styles.emptySubtitle}>
              Activate a trip from the "My Trips" details page to manage its
              expenses and itinerary here.
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => router.push("/mytrip")}
            >
              <Text style={styles.exploreBtnText}>Browse My Portfolio</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.listContainer}>
          {sortedTrips.map((trip) => (
            <ActiveTripCard key={trip.id} trip={trip as any} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: Colors.WHITE,
    paddingBottom: 160,
  },
  header: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 20,
    minHeight: 80,
    justifyContent: "flex-end",
  },
  subtitle: {
    fontFamily: "outfitMedium",
    fontSize: 11,
    color: Colors.MUTED_TEXT,
    letterSpacing: 3,
    marginBottom: 0,
    textTransform: "uppercase",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: -4,
  },
  title: {
    fontFamily: "playfairBold",
    fontSize: 40,
    color: Colors.TEXT,
    lineHeight: 48,
  },
  goldDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.SECONDARY,
    marginLeft: 2,
    marginBottom: 8,
  },
  loader: {
    marginTop: height * 0.1,
  },
  emptyContainer: {
    marginTop: height * 0.1,
    alignItems: "center",
    paddingHorizontal: width * 0.03,
  },
  emptyTitle: {
    fontFamily: "outfitMedium",
    fontSize: 20,
    color: Colors.GRAY,
    marginTop: height * 0.02,
  },
  emptySubtitle: {
    fontFamily: "outfit",
    fontSize: 14,
    color: Colors.GRAY,
    marginTop: height * 0.01,
    textAlign: "center",
  },
  exploreBtn: {
    marginTop: 35,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  exploreBtnText: {
    color: "#FFF",
    fontFamily: "outfitBold",
    fontSize: 15,
  },
  listContainer: {
    paddingHorizontal: width * 0.03,
    marginTop: 10,
    gap: 15,
  },
});
