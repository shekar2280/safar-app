import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  StatusBar,
} from "react-native";
import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Colors } from "@/src/constants/colors";
import { CreateTripContext } from "@/src/context/CreateTripContext";
import { UserContext } from "@/src/context/UserContext";
import { MAX_TRIP_DAYS } from "@/src/constants/limits";
import LocationPicker from "@/src/components/trip/LocationPicker";
import DestinationPicker from "@/src/components/trip/DestinationPicker";
import { SelectBudgetOptions } from "@/src/constants/travel-data";
import SafarAlert from "@/src/components/ui/SafarAlert";
import { MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LocationData, DestinationData, TravelerGroup, BudgetOption, TravelerMode } from "@/src/types/interfaces";

const { width, height } = Dimensions.get("window");

const getTravelerObject = (mode: TravelerMode, count: number): TravelerGroup => {
  if (mode === TravelerMode.Solo) return { id: 1, title: "Solo", desc: "A solo traveler", people: "1" };
  if (mode === TravelerMode.Couple) return { id: 2, title: "Couple", desc: "Two people", people: "2" };
  if (mode === TravelerMode.Family) return { id: 3, title: "Family", desc: "A family trip", people: `${count}` };
  return { id: 4, title: "Friends", desc: "A fun trip with friends", people: `${count}` };
};

export default function CreateTripIndex() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const context = useContext(CreateTripContext);
  if (!context) return null;
  const { setTripData } = context;

  const userCtx = useContext(UserContext);
  const userProfile = userCtx?.userProfile;

  const [departure, setDeparture] = useState<LocationData | null>(userProfile?.homeLocation || null);
  const [destination, setDestination] = useState<DestinationData | null>(null);
  const [travelerMode, setTravelerMode] = useState<TravelerMode>(TravelerMode.Solo);
  const [travelerCount, setTravelerCount] = useState(1);
  const [budget, setBudget] = useState<BudgetOption | null>(null);
  const [totalDays, setTotalDays] = useState(1);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const processedParamsRef = useRef<string>("");

  useEffect(() => {
    const paramsKey = JSON.stringify(params);
    if (processedParamsRef.current === paramsKey) return;
    processedParamsRef.current = paramsKey;

    if (params.destName) {
      const cityOnly = (params.destName as string).split(",")[0].trim();
      setDestination({
        name: cityOnly,
        shortName: cityOnly,
        country: params.destCountry as string || "",
        countryCode: params.destCountryCode as string || "",
        coordinates: {
          lat: Number(params.destLat) || 0,
          lon: Number(params.destLon) || 0
        },
        imageUrl: params.destPhoto as string || undefined,
        festival: params.festival as string || undefined,
        venueAddress: params.venueAddress as string || undefined,
        concertDate: params.concertDate as string || undefined,
        concertTime: params.concertTime as string || undefined,
        bookingUrl: params.bookingUrl as string || undefined,
        priceRange: params.priceRange ? JSON.parse(params.priceRange as string) : undefined,
      });
    }

    if (params.originName) {
      const cityOnly = (params.originName as string).split(",")[0].trim();
      setDeparture({
        name: cityOnly,
        label: cityOnly,
        fullAddress: params.originName as string,
        country: params.originCountry as string || "",
        countryCode: params.originCountryCode as string || "",
        coordinates: {
          lat: Number(params.originLat) || 0,
          lon: Number(params.originLon) || 0
        }
      });
    }
  }, [params]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      setTripData({});
    }, [])
  );

  useEffect(() => {
    // Determine traveler mode based on count since the top slider is gone
    if (travelerCount === 1) setTravelerMode(TravelerMode.Solo);
    else if (travelerCount === 2) setTravelerMode(TravelerMode.Couple);
    else if (travelerCount >= 3 && travelerCount <= 4) setTravelerMode(TravelerMode.Family);
    else setTravelerMode(TravelerMode.Friends);
  }, [travelerCount]);

  const handleGenerateTrip = () => {
    const missing: string[] = [];
    if (!departure) missing.push("Departure");
    if (!destination) missing.push("Destination");
    if (!budget) missing.push("Budget");

    if (missing.length > 0) {
      setAlertMessage(`Please complete the following: ${missing.join(", ")}`);
      setAlertVisible(true);
      return;
    }

    setTripData({
      departureInfo: departure,
      destinationInfo: destination,
      travelerMode,
      totalDays,
      traveler: getTravelerObject(travelerMode, travelerCount),
      budget: budget!.title,
      isInternational: departure!.countryCode !== destination!.countryCode,
      tripCategory: (params.tripCategory as any) || "GENERAL",
    });
    router.push("/create-trip/generate-trip" as any);
  };

  const DELAY = 100;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 800 }}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <Text style={styles.mainTitle}>Start a New Adventure</Text>
      </MotiView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {params.insight ? (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 800 }}
            style={styles.insightHero}
          >
            <View style={styles.insightHeader}>
              <View style={styles.insightIconCircle}>
                <Ionicons name="bulb" size={20} color={Colors.GOLD} />
              </View>
              <Text style={styles.insightHeaderTitle}>
                {params.festival
                  ? `WHY IS ${params.festival.toString().toUpperCase()} CELEBRATED?`
                  : `WHY ${(
                      destination?.name ||
                      (params.destName as string)?.split(",")[0] ||
                      "THIS PLACE"
                    ).toUpperCase()}?`}
              </Text>
            </View>
            <Text style={styles.insightText}>
              {params.insight as string}
            </Text>

            {(params.auspiciousDay || params.recommendedMonth) && (
              <View style={styles.insightTimingRow}>
                <View style={styles.insightTimingBadge}>
                  <Ionicons
                    name="calendar"
                    size={14}
                    color={Colors.GOLD}
                  />
                  <Text style={styles.insightTimingLabel}>
                    {params.auspiciousDay
                      ? "MAIN CELEBRATION"
                      : "BEST TIME TO VISIT"}
                  </Text>
                </View>
                <Text style={styles.insightTimingValue}>
                  {params.auspiciousDay || params.recommendedMonth}
                </Text>
              </View>
            )}
          </MotiView>
        ) : (
          <View style={{ height: 10 }} />
        )}

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: DELAY + 100, type: "timing" }}
          style={styles.bridgeCard}
        >
          <View style={styles.bridgeContent}>
            <View style={[styles.bridgeHalf, { zIndex: 2 }]}>
              <LocationPicker
                placeholder="Origin"
                onLocationChange={setDeparture}
                value={departure}
              />
            </View>
            <View style={[styles.bridgeHalf, { zIndex: 1 }]}>
              {params.destName ? (
                <View style={styles.staticDestinationWrapper}>
                  <View style={styles.labelSection}>
                    <Text style={styles.label}>TO</Text>
                  </View>
                  <View style={styles.staticContent}>
                    <Text style={styles.staticValue} numberOfLines={1}>
                      {destination?.name || (params.destName as string).split(",")[0].trim()}
                    </Text>
                    <Ionicons name="sparkles" size={14} color={Colors.SECONDARY} />
                  </View>
                </View>
              ) : (
                <DestinationPicker
                  placeholder="Destination"
                  onLocationSelect={setDestination}
                  value={destination}
                />
              )}
            </View>
          </View>
        </MotiView>


        <View style={styles.statsGrid}>
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: DELAY + 200, type: "timing" }}
            style={styles.statTile}
          >
            <Text style={styles.tileLabel}>DURATION</Text>
            <Text style={styles.tileValue}>{totalDays}</Text>
            <Text style={styles.tileUnit}>{totalDays === 1 ? "DAY" : "DAYS"}</Text>

            <View style={styles.tileActions}>
              <TouchableOpacity
                style={[styles.tileBtn, totalDays === 1 && { opacity: 0.3 }]}
                onPress={() => setTotalDays(p => Math.max(1, p - 1))}
                disabled={totalDays === 1}
              >
                <Text style={styles.tileBtnText}>—</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tileBtn, totalDays === MAX_TRIP_DAYS && { opacity: 0.3 }]}
                onPress={() => setTotalDays(p => Math.min(MAX_TRIP_DAYS, p + 1))}
                disabled={totalDays === MAX_TRIP_DAYS}
              >
                <Text style={styles.tileBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </MotiView>

          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: DELAY + 300, type: "timing" }}
            style={styles.statTile}
          >
            <Text style={styles.tileLabel}>COMPANIONS</Text>
            <Text style={styles.tileValue}>{travelerCount}</Text>
            <Text style={styles.tileUnit}>{travelerCount === 1 ? "PERSON" : "PEOPLE"}</Text>

            <View style={styles.tileActions}>
              <TouchableOpacity
                style={[styles.tileBtn, travelerCount === 1 && { opacity: 0.3 }]}
                onPress={() => setTravelerCount(p => Math.max(1, p - 1))}
                disabled={travelerCount === 1}
              >
                <Text style={styles.tileBtnText}>—</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tileBtn, travelerCount === 6 && { opacity: 0.3 }]}
                onPress={() => setTravelerCount(p => Math.min(6, p + 1))}
                disabled={travelerCount === 6}
              >
                <Text style={styles.tileBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: DELAY + 400, type: "timing" }}
          style={styles.budgetTierCard}
        >
          <Text style={styles.tileLabelCenter}>INVESTMENT TIER</Text>
          <View style={styles.budgetRow}>
            {SelectBudgetOptions.map((item) => {
              const isSelected = budget?.id === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setBudget(item)}
                  style={[styles.budgetPill, isSelected && styles.budgetPillActive]}
                >
                  <Text style={[styles.budgetPillText, isSelected && styles.budgetPillTextActive]}>
                    {item.title.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </MotiView>

      </ScrollView>

      <MotiView
        from={{ opacity: 0, translateY: 50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: DELAY + 500, type: "timing", duration: 1000 }}
        style={styles.footer}
      >
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleGenerateTrip}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryBtnText}>BEGIN EXPLORATION</Text>
        </TouchableOpacity>
      </MotiView>

      <SafarAlert
        visible={alertVisible}
        title="INCOMPLETE"
        message={alertMessage}
        type="error"
        confirmText="RETRY"
        onConfirm={() => setAlertVisible(false)}
        onCancel={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.WHITE },
  header: {
    paddingBottom: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontFamily: "playfairBold",
    fontSize: 28,
    color: Colors.PRIMARY,
    lineHeight: 34,
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 150
  },
  modeTextActive: {
    color: Colors.PRIMARY,
  },
  insightHero: {
    backgroundColor: "#FFFAF0",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FEF3C7",
    borderLeftWidth: 5,
    borderLeftColor: Colors.GOLD,
    shadowColor: Colors.GOLD,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  insightIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.WHITE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  insightHeaderTitle: {
    fontFamily: "outfitBold",
    fontSize: 10,
    color: Colors.GOLD,
    letterSpacing: 2,
  },
  insightText: {
    fontFamily: "playfair",
    fontSize: 16,
    color: Colors.PRIMARY,
    lineHeight: 26,
    fontStyle: "italic",
    opacity: 0.95,
  },
  insightTimingRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(254, 243, 199, 0.5)",
    gap: 12,
  },
  insightTimingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(254, 243, 199, 0.4)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  insightTimingLabel: {
    fontFamily: "outfitBold",
    fontSize: 9,
    color: Colors.GOLD,
    letterSpacing: 0.5,
  },
  insightTimingValue: {
    fontFamily: "outfitBold",
    fontSize: 13,
    color: Colors.PRIMARY,
    opacity: 0.8,
    flex: 1,
    textAlign: "right",
  },
  bridgeCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 24,
    padding: 2,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    zIndex: 10,
  },
  bridgeContent: {
    flexDirection: "column",
    padding: 5,
    zIndex: 20,
  },
  bridgeHalf: {
    width: "100%",
  },
  staticDestinationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.035)",
    height: 65,
    borderRadius: 22,
    paddingHorizontal: 20,
  },
  labelSection: { width: 40 },
  label: {
    fontFamily: "outfitBold",
    fontSize: 10,
    color: Colors.SECONDARY,
    letterSpacing: 1.5,
  },
  staticContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  staticValue: {
    fontFamily: "outfitBold",
    fontSize: 18,
    color: Colors.PRIMARY,
    flex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 15,
    zIndex: -1,
  },
  statTile: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    aspectRatio: 1,
    borderRadius: 32,
    padding: 18,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  tileLabel: {
    fontFamily: "outfitBold",
    fontSize: 9,
    letterSpacing: 2,
    color: Colors.SECONDARY,
    opacity: 0.7,
  },
  tileLabelCenter: {
    fontFamily: "outfitBold",
    fontSize: 9,
    letterSpacing: 2,
    color: Colors.SECONDARY,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 15,
  },
  tileValue: {
    fontFamily: "playfairBold",
    fontSize: 54,
    color: Colors.PRIMARY,
    lineHeight: 60,
    marginBottom: 10,
  },
  tileUnit: {
    fontFamily: "outfitBold",
    fontSize: 10,
    color: Colors.MUTED_TEXT,
    letterSpacing: 1,
    marginTop: -8,
  },
  tileActions: {
    flexDirection: "row",
    gap: 20,
    marginTop: 10,
  },
  tileBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.03)",
    alignItems: "center",
    justifyContent: "center",
  },
  tileBtnText: {
    fontSize: 16,
    fontFamily: "outfitBold",
    color: Colors.PRIMARY,
  },
  budgetTierCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    zIndex: -1,
  },
  budgetRow: {
    flexDirection: "row",
    gap: 10,
  },
  budgetPill: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  budgetPillActive: {
    backgroundColor: Colors.PRIMARY,
  },
  budgetPillText: {
    fontFamily: "outfitBold",
    fontSize: 10,
    letterSpacing: 1,
    color: Colors.MUTED_TEXT,
  },
  budgetPillTextActive: {
    color: Colors.WHITE,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 25,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.02)",
  },
  primaryBtn: {
    backgroundColor: Colors.PRIMARY,
    height: 70,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  primaryBtnText: {
    color: Colors.WHITE,
    fontFamily: "outfitBold",
    fontSize: 15,
    letterSpacing: 4,
  },
  festiveInsightCard: {
    backgroundColor: "#FFFCF5",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: "#FEF3C7",
    alignItems: "center",
  },
  festiveInsightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  festiveInsightTitle: {
    fontFamily: "outfitBold",
    fontSize: 10,
    color: Colors.GOLD,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  festiveInsightText: {
    fontFamily: "outfit",
    fontSize: 13,
    color: Colors.PRIMARY,
    lineHeight: 18,
    opacity: 0.9,
  },
});
