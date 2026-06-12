import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors, useThemeColors } from "@/src/constants/colors";
import { useTheme } from "@/src/context/ThemeContext";
import DiscoverCard from "@/src/components/trip/DiscoverCard";
import SafarAlert from "@/src/components/ui/SafarAlert";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "@/src/context/UserContext";
import { useTrendingPlaces } from "@/src/hooks/queries/useTrendingPlaces";
import { useNetInfo } from "@react-native-community/netinfo";
import Button from "@/src/components/common/Button";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  STORAGE_KEYS,
  SUGGESTED_OUTBOUND,
  BACKUPS,
  COUNTRY_EMOJIS,
} from "@/src/constants/discover";

const { width, height } = Dimensions.get("window");

const normalizeCountryName = (name: string): string => {
  const lower = name.toLowerCase().trim();
  if (lower.includes("united states") || lower === "us" || lower === "usa") return "United States";
  if (lower.includes("united kingdom") || lower === "uk" || lower === "gb") return "United Kingdom";
  if (lower.includes("uae") || lower.includes("united arab emirates")) return "UAE";
  return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const getCountryEmoji = (name: string): string => {
  const normalized = normalizeCountryName(name);
  return COUNTRY_EMOJIS[normalized] || "🌍";
};

export default function TrendingTrips() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userProfile } = useUser();
  const colors = useThemeColors();
  const { isDark } = useTheme();
  const params = useLocalSearchParams();

  const paramCountry = params.country as string | undefined;

  const [activeCountry, setActiveCountry] = useState(paramCountry || "");
  const [homeCountry, setHomeCountry] = useState<{ name: string; code: string } | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<"granted" | "denied" | "undetermined" | null>(null);
  const [isResolvingLocation, setIsResolvingLocation] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const changeCountry = (countryName: string) => {
    setIsTransitioning(true);
    setActiveCountry(countryName);
    AsyncStorage.setItem(STORAGE_KEYS.SELECTED_COUNTRY, countryName);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  const { data: places = [], isLoading: loading } = useTrendingPlaces(activeCountry);
  const { isConnected } = useNetInfo();

  useEffect(() => {
    async function setupLocation() {
      try {
        const cachedSelected = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_COUNTRY);
        if (cachedSelected && !paramCountry) {
          setActiveCountry(cachedSelected);
        }

        const cachedHome = await AsyncStorage.getItem(STORAGE_KEYS.HOME_COUNTRY);
        if (cachedHome) {
          const parsed = JSON.parse(cachedHome);
          setHomeCountry(parsed);
          setPermissionStatus("granted");
          if (!paramCountry && !cachedSelected) {
            setActiveCountry(parsed.name);
          }
          setIsResolvingLocation(false);
          triggerSilentBackgroundUpdate();
          return;
        }

        const { status: currentStatus } = await Location.getForegroundPermissionsAsync();
        setPermissionStatus(currentStatus as any);

        if (currentStatus === "granted") {
          await fetchAndSaveLocation();
        } else if (currentStatus === "undetermined") {
          const { status: askStatus } = await Location.requestForegroundPermissionsAsync();
          setPermissionStatus(askStatus as any);
          if (askStatus === "granted") {
            await fetchAndSaveLocation();
          } else {
            handleLocationFailure();
          }
        } else {
          handleLocationFailure();
        }
      } catch (err) {
        console.error("Error setting up location:", err);
        handleLocationFailure();
      } finally {
        setIsResolvingLocation(false);
      }
    }

    setupLocation();
  }, [paramCountry]);

  async function fetchAndSaveLocation() {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const reverse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (reverse && reverse.length > 0) {
        const first = reverse[0];
        const rawCountry = first.country || "United States";
        const code = first.isoCountryCode || "US";
        const normalized = normalizeCountryName(rawCountry);
        const resolved = { name: normalized, code: code.toUpperCase() };

        setHomeCountry(resolved);
        await AsyncStorage.setItem(STORAGE_KEYS.HOME_COUNTRY, JSON.stringify(resolved));
        if (!paramCountry && !(await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_COUNTRY))) {
          setActiveCountry(resolved.name);
        }
      } else {
        handleLocationFailure();
      }
    } catch (e) {
      console.error("Failed to fetch coordinates/reverse geocode:", e);
      handleLocationFailure();
    }
  }

  function handleLocationFailure() {
    if (!paramCountry && !activeCountry) {
      setActiveCountry("United States");
    }
  }

  async function triggerSilentBackgroundUpdate() {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const reverse = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (reverse && reverse.length > 0) {
          const first = reverse[0];
          const rawCountry = first.country || "United States";
          const code = first.isoCountryCode || "US";
          const normalized = normalizeCountryName(rawCountry);
          const resolved = { name: normalized, code: code.toUpperCase() };

          setHomeCountry(resolved);
          await AsyncStorage.setItem(STORAGE_KEYS.HOME_COUNTRY, JSON.stringify(resolved));
        }
      }
    } catch (e) {
    }
  }

  const requestLocationPermissionManual = async () => {
    try {
      setIsResolvingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status as any);
      if (status === "granted") {
        await fetchAndSaveLocation();
      } else {
        handleLocationFailure();
      }
    } catch (err) {
      console.error("Error in manual location prompt:", err);
      handleLocationFailure();
    } finally {
      setIsResolvingLocation(false);
    }
  };

  const handleSelect = (item: any) => {
    router.push({
      pathname: "/create-trip",
      params: {
        destName: item.name,
        destCountry: item.country,
        destPhoto: item.image,
        insight: item.insight,
        recommendedMonth: item.recommended_month || item.recommendedMonth,
        tripCategory: "TRENDING",
        destLat: item.lat,
        destLon: item.lon,
      },
    });
  };

  const getChips = () => {
    const chipsList: { name: string; label: string }[] = [];

    if (homeCountry) {
      chipsList.push({ name: homeCountry.name, label: "📍 Near Me" });
    }

    if (activeCountry && activeCountry.toLowerCase() !== homeCountry?.name?.toLowerCase()) {
      const normalizedActive = normalizeCountryName(activeCountry);
      chipsList.push({
        name: normalizedActive,
        label: `${getCountryEmoji(normalizedActive)} ${normalizedActive}`,
      });
    }

    const countryCode = homeCountry?.code || "DEFAULT";
    const outboundNames = SUGGESTED_OUTBOUND[countryCode] || SUGGESTED_OUTBOUND.DEFAULT;

    let filteredOutbound = outboundNames.filter(
      (name) => name.toLowerCase() !== homeCountry?.name?.toLowerCase()
    );

    if (filteredOutbound.length < outboundNames.length) {
      const replacement = BACKUPS.find(
        (b) =>
          b.toLowerCase() !== homeCountry?.name?.toLowerCase() &&
          !filteredOutbound.includes(b)
      );
      if (replacement) {
        filteredOutbound.push(replacement);
      }
    }

    filteredOutbound.forEach((name) => {
      chipsList.push({
        name,
        label: `${getCountryEmoji(name)} ${name}`,
      });
    });

    return chipsList.filter((v, i, a) => a.findIndex((t) => t.name.toLowerCase() === v.name.toLowerCase()) === i);
  };

  const getHeaderTitle = () => {
    if (homeCountry && activeCountry.toLowerCase() === homeCountry.name.toLowerCase()) {
      return "Popular near you";
    }
    return `Trending in ${activeCountry}`;
  };

  const showLoading = loading || isResolvingLocation || isTransitioning || isValidating || !activeCountry;

  if (isConnected === false && places.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.BACKGROUND, paddingTop: insets.top }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View style={[styles.header, { borderBottomColor: colors.BORDER }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color={colors.TEXT} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.subtitle, { color: colors.GOLD }]}>OFFLINE MODE</Text>
            <Text style={[styles.title, { color: colors.TEXT }]}>Trending Trips</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="wifi-off" size={60} color={colors.MUTED_TEXT} />
          <Text style={[styles.errorTitle, { color: colors.TEXT }]}>Connection Required</Text>
          <Text style={[styles.errorDesc, { color: colors.MUTED_TEXT }]}>
            Trending destinations are tailored to your current country and require an internet connection to load.
          </Text>
          <Button
            title="GO BACK"
            onPress={() => router.back()}
            style={{ width: width * 0.6, marginTop: 20 }}
          />
        </View>
      </View>
    );
  }

  const chips = getChips();

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={[styles.header, { borderBottomColor: colors.BORDER }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={colors.TEXT} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.subtitle, { color: colors.GOLD }]}>
            DISCOVER
          </Text>
          <Text
            style={[styles.title, { color: colors.TEXT }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {getHeaderTitle()}
          </Text>
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }]}>
          <Ionicons name="search" size={18} color={colors.MUTED_TEXT} />
          <TextInput
            style={[styles.searchInput, { color: colors.TEXT }]}
            placeholder="Search any country..."
            placeholderTextColor={colors.MUTED_TEXT}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={async () => {
              if (searchInput.trim().length > 2) {
                const searched = searchInput.trim();
                setIsValidating(true);
                try {
                  const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searched)}&format=json&addressdetails=1&limit=1`,
                    { headers: { "User-Agent": "safar-travel-app", "Accept-Language": "en" } }
                  );
                  const data = await res.json();
                  if (data && data.length > 0) {
                    const item = data[0];
                    const placeName = item.display_name.split(",")[0].trim();
                    changeCountry(placeName);
                    setSearchInput("");
                  } else {
                    setAlertVisible(true);
                  }
                } catch (err) {
                  console.error("Validation error:", err);
                  setAlertVisible(true);
                } finally {
                  setIsValidating(false);
                }
              }
            }}
            returnKeyType="search"
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={() => setSearchInput("")}>
              <Ionicons name="close-circle" size={18} color={colors.MUTED_TEXT} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}
          style={styles.chipsContainer}
        >
          {chips.map((c) => {
            const isActive = activeCountry.toLowerCase() === c.name.toLowerCase();
            return (
              <TouchableOpacity
                key={c.name}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? colors.GOLD : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"),
                    borderColor: isActive ? colors.GOLD : "transparent"
                  }
                ]}
                onPress={() => {
                  changeCountry(c.name);
                  setSearchInput("");
                }}
              >
                <Text style={[
                  styles.chipText,
                  { color: isActive ? "#000" : colors.TEXT, fontFamily: isActive ? "outfitBold" : "outfitMedium" }
                ]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {permissionStatus === "denied" && (
        <View style={[styles.bannerContainer, { backgroundColor: colors.GOLD_MUTED, borderColor: colors.GOLD }]}>
          <View style={styles.bannerIconContainer}>
            <Ionicons name="location-outline" size={24} color={colors.GOLD} />
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={[styles.bannerTitle, { color: colors.TEXT }]}>Enable Local Trends</Text>
            <Text style={[styles.bannerDesc, { color: colors.MUTED_TEXT }]}>
              Allow location access to see trending destinations near your location.
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.bannerButton, { backgroundColor: colors.GOLD }]}
            onPress={requestLocationPermissionManual}
          >
            <Text style={styles.bannerButtonText}>Enable</Text>
          </TouchableOpacity>
        </View>
      )}

      {showLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
          <Text style={[styles.loadingText, { color: colors.MUTED_TEXT }]}>
            {isValidating ? "Verifying location..." : isResolvingLocation ? "Detecting your location..." : "Finding trending spots..."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={false}
          getItemLayout={(_data, index) => ({
            length: height * 0.20 + 14,
            offset: (height * 0.20 + 14) * index,
            index,
          })}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              style={styles.cardContainer}
            >
              <DiscoverCard
                option={item}
                cardHeight={height * 0.20}
                hideTag={true}
              />
            </TouchableOpacity>
          )}
        />
      )}

      <SafarAlert
        visible={alertVisible}
        title="LOCATION NOT FOUND"
        message="We couldn't find a country matching your search. Please check the spelling and try again."
        type="error"
        confirmText="OK"
        onConfirm={() => setAlertVisible(false)}
        onCancel={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 5,
  },
  subtitle: {
    fontFamily: "outfitMedium",
    fontSize: 10,
    letterSpacing: 2,
  },
  title: {
    fontFamily: "playfairBold",
    fontSize: 22,
  },
  searchSection: {
    paddingTop: 15,
    paddingBottom: 5,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    fontFamily: "outfit",
    fontSize: 15,
    marginLeft: 10,
    height: "100%",
  },
  chipsContainer: {
    maxHeight: 40,
  },
  chipsContent: {
    paddingHorizontal: 15,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chipText: {
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },
  loadingText: {
    fontFamily: "outfit",
    fontSize: 15,
  },
  errorTitle: {
    fontFamily: "playfairBold",
    fontSize: 24,
    marginTop: 10,
  },
  errorDesc: {
    fontFamily: "outfit",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 40,
    marginTop: 10,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 14,
  },
  cardContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  bannerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  bannerIconContainer: {
    marginRight: 12,
  },
  bannerTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  bannerTitle: {
    fontFamily: "outfitBold",
    fontSize: 14,
    marginBottom: 2,
  },
  bannerDesc: {
    fontFamily: "outfit",
    fontSize: 11,
    lineHeight: 14,
  },
  bannerButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerButtonText: {
    color: "#000",
    fontFamily: "outfitBold",
    fontSize: 12,
  },
});

