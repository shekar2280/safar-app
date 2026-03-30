import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  View,
  StyleSheet,
} from "react-native";
import React from "react";
import { Colors } from "../../constants/Colors";
import { useUser } from "../../context/UserContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ActiveTripCard from "../../components/WalletDetails/ActiveTripCard";

const { width, height } = Dimensions.get("window");

export default function ActiveTrips() {
  const { userTrips, loading } = useUser();

  const activeTrips = (userTrips || [])
    .filter((trip) => trip.isActive === true)
    .sort((a, b) => {
      const parseDate = (val) => {
        if (!val) return 0;
        if (val.seconds) return val.seconds * 1000;
        return new Date(val).getTime();
      };

      return parseDate(b.activatedAt) - parseDate(a.activatedAt);
    });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.subtitle}>CURRENT ADVENTURES</Text>
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

        {!loading && activeTrips.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="bag-checked"
              size={width * 0.2}
              color={Colors.GRAY}
            />
            <Text style={styles.emptyTitle}>You have no active trips.</Text>
            <Text style={styles.emptySubtitle}>
              Activate a trip from the "My Trips" details page to manage its
              expenses here.
            </Text>
          </View>
        )}

        <View style={styles.listContainer}>
          {activeTrips.map((trip) => (
            <ActiveTripCard key={trip.id} trip={trip} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: Colors.BACKGROUND,
    paddingBottom: height * 0.16,
  },
  header: {
    paddingHorizontal: width * 0.03,
    paddingTop: height * 0.06,
    paddingBottom: 20,
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
  listContainer: {
    paddingHorizontal: width * 0.03,
    marginTop: 10,
  },
});
