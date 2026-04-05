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
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/src/constants/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import StartNewTripCard from "@/src/components/trips/StartNewTripCard";
import UserTripList from "@/src/components/trips/UserTripList";
import HomeLocationPrompt from "@/src/components/trips/HomeLocationPrompt";
import GlobalLocationHeader from "@/src/components/common/GlobalLocationHeader";
import { useUser } from "@/src/context/UserContext";
import NetInfo from "@react-native-community/netinfo";
import { UserTrip } from "@/src/types/interfaces";

const { width, height } = Dimensions.get("window");

export default function Mytrip() {
  const insets = useSafeAreaInsets();
  const { userTrips, setUserTrips, userProfile, loading } = useUser();
  const [isOffline, setIsOffline] = useState(false);
  const [showBackOnline, setShowBackOnline] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const firstName = userProfile?.fullName?.trim()?.split(" ")[0] || "Explorer";

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected;
      if (offline) {
        setIsOffline(true);
        setShowBackOnline(false);
      } else if (isOffline) {
        setShowBackOnline(true);
        setIsOffline(false);
        triggerOnlineAnimation();
      }
    });
    return () => unsubscribe();
  }, [isOffline]);

  const triggerOnlineAnimation = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => setShowBackOnline(false));
  };

  const handleDelete = (deletedId: string) => {
    setUserTrips((prev: UserTrip[]) => prev.filter((t) => t.id !== deletedId));
  };

  const filteredTrips = useMemo(() => {
    if (!searchQuery.trim()) return userTrips;
    const q = searchQuery.toLowerCase().trim();
    return userTrips.filter((item: UserTrip) => {
      const tripName = item?.concertData?.artist
        ? `${item.concertData.artist} Concert`
        : item?.tripPlan?.tripName ||
          (item?.savedTripId ? item.savedTripId.split("-")[0] : "My Trip");
      
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

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={{ paddingTop: insets.top + 10 }}
        contentContainerStyle={{
          paddingHorizontal: width * 0.03,
          paddingTop: 0,
          paddingBottom: 160,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* <GlobalLocationHeader /> */}
        <View style={styles.header}>
          {isSearching ? (
            <View style={styles.searchBarWrapper}>
              <Ionicons
                name="search"
                size={20}
                color={Colors.GRAY}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search journeys..."
                placeholderTextColor={Colors.GRAY}
                autoFocus={true}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity onPress={toggleSearch} style={styles.closeBtn}>
                <Ionicons name="close-circle" size={22} color={Colors.GRAY} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.greetingWrapper}>
                <Text style={styles.welcomeText}>{timeGreeting}</Text>
                <View style={styles.nameRow}>
                  <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                    {firstName}
                  </Text>
                  <View style={styles.goldDot} />
                </View>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color={Colors.TEXT}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  activeOpacity={0.8}
                  onPress={toggleSearch}
                >
                  <Ionicons
                    name="search-outline"
                    size={22}
                    color={Colors.TEXT}
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {isOffline && (
          <View style={[styles.banner, { backgroundColor: Colors.SECONDARY }]}>
            <Text style={styles.bannerText}>Offline Mode</Text>
          </View>
        )}
        {showBackOnline && (
          <Animated.View
            style={[
              styles.banner,
              { backgroundColor: Colors.ACCENT, opacity: fadeAnim },
            ]}
          >
            <Text style={styles.bannerText}>Back Online</Text>
          </Animated.View>
        )}

        <HomeLocationPrompt />

        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.PRIMARY}
            style={{ marginTop: 50 }}
          />
        ) : filteredTrips?.length === 0 ? (
          searchQuery.trim() ? (
            <View style={styles.noResults}>
              <View style={styles.noResultsIcon}>
                <Ionicons
                  name="search-outline"
                  size={42}
                  color={Colors.TEXT}
                  style={{ opacity: 0.2 }}
                />
              </View>
              <Text style={styles.noResultsText}>NO JOURNEYS FOUND</Text>
              <Text style={styles.noResultsSubtext}>
                We couldn't find any trips matching "{searchQuery}".
              </Text>
            </View>
          ) : (
            <StartNewTripCard />
          )
        ) : (
          <UserTripList userTrips={filteredTrips} onDelete={handleDelete} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: Colors.MUTED_TEXT,
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
