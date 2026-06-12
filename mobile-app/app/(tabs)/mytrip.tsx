import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  TextInput,
  Keyboard,
  StatusBar,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, useThemeColors } from "@/src/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import StartNewTripCard from "@/src/components/trips/StartNewTripCard";
import UserTripList from "@/src/components/trips/UserTripList";

import GlobalLocationHeader from "@/src/components/common/GlobalLocationHeader";
import { useUser } from "@/src/context/UserContext";
import { useTrips, useDeleteTrip } from "@/src/hooks/queries/useTrips";
import { UserTrip } from "@/src/constants";
import TripCardSkeleton from "@/src/components/skeleton/TripCardSkeleton";
import { useTheme } from "@/src/context/ThemeContext";

const { width, height } = Dimensions.get("window");

export default function Mytrip() {
  const insets = useSafeAreaInsets();
  const { userProfile, loading: authLoading } = useUser();
  const { theme, toggleTheme, isDark } = useTheme();
  const colors = useThemeColors();
  const deleteTrip = useDeleteTrip();
  const { data: userTrips = [], isLoading: tripsLoading, refetch } = useTrips();
  const loading = authLoading || tripsLoading;

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const firstName = userProfile?.fullName?.trim()?.split(" ")[0] || "Explorer";

  const handleDelete = (deletedId: string) => {
    deleteTrip.mutate(deletedId);
  };

  const handleManualRefresh = async () => {
    setIsManualRefresh(true);
    await refetch();
    setIsManualRefresh(false);
  };

  useEffect(() => {
    const requestLocationUpfront = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === "undetermined") {
          await Location.requestForegroundPermissionsAsync();
        }
      } catch (e) {
      }
    };
    requestLocationUpfront();
  }, []);

  const filteredTrips = useMemo(() => {
    if (!searchQuery.trim()) return userTrips;
    const q = searchQuery.toLowerCase().trim();
    return userTrips.filter((item: UserTrip) => {
      const tripName = item?.concertData?.artist
        ? `${item.concertData.artist} Concert`
        : item?.tripPlan?.tripName || "My Trip";

      const tripLocation = (item as any)?.tripData?.locationInfo?.name || "";
      const discoverLocation = (item as any)?.discoverData?.locationInfo?.name || "";

      return (
        tripName.toLowerCase().includes(q) ||
        tripLocation.toLowerCase().includes(q) ||
        discoverLocation.toLowerCase().includes(q)
      );
    });
  }, [userTrips, searchQuery]);

  const toggleSearch = () => {
    if (isSearching) {
      setSearchQuery("");
      Keyboard.dismiss();
    }
    setIsSearching(!isSearching);
  };

  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour < 12
      ? "GOOD MORNING"
      : currentHour < 17
        ? "GOOD AFTERNOON"
        : "GOOD EVENING";

  const header = useMemo(() => (
    <View style={{ paddingTop: insets.top + 5 }}>
      <View style={styles.header}>
        {isSearching ? (
          <View style={[styles.searchBarWrapper, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
            <Ionicons
              name="search"
              size={20}
              color={colors.GRAY}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.TEXT }]}
              placeholder="Search journeys..."
              placeholderTextColor={colors.GRAY}
              autoFocus={true}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={toggleSearch} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={22} color={colors.GRAY} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.greetingWrapper}>
              <Text style={[styles.welcomeText, { color: colors.MUTED_TEXT }]}>{timeGreeting}</Text>
              <View style={styles.nameRow}>
                <Text
                  style={[styles.title, { color: colors.TEXT }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {firstName}
                </Text>
                <View style={[styles.goldDot, { backgroundColor: colors.SECONDARY }]} />
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}
                activeOpacity={0.8}
                onPress={toggleTheme}
              >
                <Ionicons
                  name={isDark ? "sunny-outline" : "moon-outline"}
                  size={22}
                  color={colors.TEXT}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}
                activeOpacity={0.8}
                onPress={toggleSearch}
              >
                <Ionicons
                  name="search-outline"
                  size={22}
                  color={colors.TEXT}
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {loading ? (
        <View style={{ flex: 1 }}>
          <TripCardSkeleton />
          <TripCardSkeleton />
          <TripCardSkeleton />
        </View>
      ) : null}
    </View>
  ), [isSearching, searchQuery, colors, isDark, firstName, timeGreeting, loading, toggleTheme, toggleSearch, insets.top]);

  const renderEmpty = () => {
    if (loading) return null;

    if (searchQuery.trim()) {
      return (
        <View style={styles.noResults}>
          <View style={[styles.noResultsIcon, { backgroundColor: colors.SURFACE }]}>
            <Ionicons
              name="search-outline"
              size={42}
              color={colors.TEXT}
              style={{ opacity: 0.2 }}
            />
          </View>
          <Text style={[styles.noResultsText, { color: colors.TEXT }]}>NO JOURNEYS FOUND</Text>
          <Text style={[styles.noResultsSubtext, { color: colors.MUTED_TEXT }]}>
            We couldn't find any trips matching "{searchQuery}".
          </Text>
        </View>
      );
    }
    return <StartNewTripCard />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.BACKGROUND }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <UserTripList
        userTrips={loading ? [] : filteredTrips}
        onDelete={handleDelete}
        isPaused={isSearching}
        ListHeaderComponent={header}
        ListEmptyComponent={renderEmpty()}
        contentContainerStyle={{ backgroundColor: colors.BACKGROUND }}
        refreshing={isManualRefresh}
        onRefresh={handleManualRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: width * 0.03,
    paddingBottom: 160,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 80,
    marginBottom: 10,
  },
  greetingWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    marginRight: 15,
  },
  welcomeText: {
    fontFamily: "outfitMedium",
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: 0,
    textTransform: "uppercase",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: -4,
  },
  title: {
    fontFamily: "playfairBold",
    fontSize: 36,
    lineHeight: 44,
  },
  goldDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginLeft: 2,
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingBottom: 6,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.SURFACE,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.SURFACE,
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontFamily: "outfit",
    fontSize: 16,
    color: Colors.TEXT,
  },
  closeBtn: { padding: 4 },
  banner: {
    flexDirection: "row",
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
    justifyContent: "center",
  },
  bannerText: { color: "white", fontFamily: "outfit" },
  noResults: {
    alignItems: "center",
    marginTop: height * 0.08,
    paddingHorizontal: width * 0.1,
  },
  noResultsIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.03)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  noResultsText: {
    fontFamily: "playfairBold",
    fontSize: 22,
    color: Colors.TEXT,
    textAlign: "center",
    letterSpacing: 1,
  },
  noResultsSubtext: {
    fontFamily: "outfit",
    fontSize: 15,
    color: Colors.MUTED_TEXT,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 20,
  },
});
