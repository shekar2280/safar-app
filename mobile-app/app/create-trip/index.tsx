import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  StatusBar,
} from "react-native";
import React, { useContext, useEffect, useState, useCallback, useRef, memo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Colors, useThemeColors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { CreateTripContext } from "@/src/context/CreateTripContext";
import { UserContext } from "@/src/context/UserContext";
import { MAX_TRIP_DAYS } from "@/src/constants/config";
import DestinationPicker from "@/src/components/trip/DestinationPicker";
import { SelectBudgetOptions } from "@/src/constants";
import SafarAlert from "@/src/components/ui/SafarAlert";
import { MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { DestinationData, TravelerGroup, BudgetOption, TravelerMode } from "@/src/constants";
import Button from "@/src/components/common/Button";

interface CounterTileProps {
  label: string;
  value: number;
  unit: string;
  unitPlural: string;
  min: number;
  max: number;
  onChange: (val: number) => void;
  colors: any;
  delay: number;
}

const CounterTile = memo(({ label, value, unit, unitPlural, min, max, onChange, colors, delay }: CounterTileProps) => (
  <MotiView
    from={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: "timing" }}
    style={[styles.statTile, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}
  >
    <Text style={[styles.tileLabel, { color: colors.MUTED_TEXT }]}>{label}</Text>
    <Text style={[styles.tileValue, { color: colors.TEXT }]}>{value}</Text>
    <Text style={[styles.tileUnit, { color: colors.MUTED_TEXT }]}>{value === 1 ? unit : unitPlural}</Text>
    <View style={styles.tileActions}>
      <TouchableOpacity
        style={[styles.tileBtn, { backgroundColor: colors.BLACK }, value === min && { opacity: 0.3 }]}
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value === min}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.tileBtnText, { color: Colors.GOLD }]}>—</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tileBtn, { backgroundColor: colors.BLACK }, value === max && { opacity: 0.3 }]}
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value === max}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.tileBtnText, { color: Colors.GOLD }]}>+</Text>
      </TouchableOpacity>
    </View>
  </MotiView>
));

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

  const [destination, setDestination] = useState<DestinationData | null>(null);
  const [travelerMode, setTravelerMode] = useState<TravelerMode>(TravelerMode.Solo);
  const [travelerCount, setTravelerCount] = useState(1);
  const [budget, setBudget] = useState<BudgetOption | null>(null);
  const [totalDays, setTotalDays] = useState(1);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const processedParamsRef = useRef<string>("");
  const colors = useThemeColors();
  const { isDark } = useTheme();

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
    if (travelerCount === 1) setTravelerMode(TravelerMode.Solo);
    else if (travelerCount === 2) setTravelerMode(TravelerMode.Couple);
    else if (travelerCount >= 3 && travelerCount <= 4) setTravelerMode(TravelerMode.Family);
    else setTravelerMode(TravelerMode.Friends);
  }, [travelerCount]);

  const handleGenerateTrip = () => {
    if (!destination) {
      setAlertMessage("Please select a destination to continue.");
      setAlertVisible(true);
      return;
    }
    if (!budget) {
      setAlertMessage("Please select a budget tier to continue.");
      setAlertVisible(true);
      return;
    }

    setTripData({
      destinationInfo: destination,
      travelerMode,
      totalDays,
      traveler: getTravelerObject(travelerMode, travelerCount),
      budget: budget.title,
      tripCategory: (params.tripCategory as any) || "GENERAL",
    });
    router.push("/create-trip/generate-trip" as any);
  };

  const DELAY = 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 800 }}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <Text style={[styles.mainTitle, { color: colors.TEXT }]}>Start a New Adventure</Text>
      </MotiView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: colors.BACKGROUND }}
      >
        {params.insight ? (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 800 }}
            style={[styles.insightHero, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,191,0,0.03)", borderColor: colors.GOLD, shadowColor: colors.GOLD }]}
          >
            <View style={styles.insightHeader}>
              <View style={[styles.insightIconCircle, { borderColor: colors.GOLD, backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,191,0,0.05)" }]}>
                <Ionicons name="bulb" size={20} color={colors.GOLD} />
              </View>
              <Text style={[styles.insightHeaderTitle, { color: colors.GOLD }]}>
                {params.festival
                  ? `WHY IS ${params.festival.toString().toUpperCase()} CELEBRATED?`
                  : `WHY ${(
                    destination?.name ||
                    (params.destName as string)?.split(",")[0] ||
                    "THIS PLACE"
                  ).toUpperCase()}?`}
              </Text>
            </View>
            <Text style={[styles.insightText, { color: colors.TEXT }]}>
              {params.insight as string}
            </Text>

            {(params.auspiciousDay || params.recommendedMonth) && (
              <View style={[styles.insightTimingRow, { borderTopColor: colors.BORDER }]}>
                <View style={[styles.insightTimingBadge, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }]}>
                  <Ionicons
                    name="calendar"
                    size={14}
                    color={colors.GOLD}
                  />
                  <Text style={[styles.insightTimingLabel, { color: colors.MUTED_TEXT }]}>
                    {params.auspiciousDay
                      ? "MAIN CELEBRATION"
                      : "BEST TIME TO VISIT"}
                  </Text>
                </View>
                <Text style={[styles.insightTimingValue, { color: colors.TEXT }]}>
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
          style={[styles.bridgeCard, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}
        >
          <View style={styles.bridgeContent}>
            {params.destName ? (
              <View style={[styles.staticDestinationWrapper, { backgroundColor: colors.SURFACE_LIGHT }]}>
                <View style={styles.labelSection}>
                  <Text style={[styles.label, { color: colors.MUTED_TEXT }]}>TO</Text>
                </View>
                <View style={styles.staticContent}>
                  <Text style={[styles.staticValue, { color: colors.TEXT }]} numberOfLines={1}>
                    {destination?.name || (params.destName as string).split(",")[0].trim()}
                  </Text>
                  <Ionicons name="sparkles" size={14} color={colors.GOLD} />
                </View>
              </View>
            ) : (
              <DestinationPicker
                placeholder="Where do you want to go?"
                onLocationSelect={setDestination}
                value={destination}
              />
            )}
          </View>
        </MotiView>


        <View style={styles.statsGrid}>
          <CounterTile
            label="DURATION"
            value={totalDays}
            unit="DAY"
            unitPlural="DAYS"
            min={1}
            max={MAX_TRIP_DAYS}
            onChange={setTotalDays}
            colors={colors}
            delay={DELAY + 200}
          />
          <CounterTile
            label="COMPANIONS"
            value={travelerCount}
            unit="PERSON"
            unitPlural="PEOPLE"
            min={1}
            max={6}
            onChange={setTravelerCount}
            colors={colors}
            delay={DELAY + 300}
          />
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: DELAY + 400, type: "timing" }}
          style={[styles.budgetTierCard, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}
        >
          <Text style={[styles.tileLabelCenter, { color: colors.MUTED_TEXT }]}>INVESTMENT TIER</Text>
          <View style={styles.budgetRow}>
            {SelectBudgetOptions.map((item) => {
              const isSelected = budget?.id === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setBudget(item)}
                  style={[styles.budgetPill, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }, isSelected && { backgroundColor: colors.PRIMARY }]}
                >
                    <Text style={[
                      styles.budgetPillText, 
                      { color: colors.MUTED_TEXT }, 
                      isSelected && { color: colors.GOLD }
                    ]}>
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
        style={[styles.footer, { backgroundColor: isDark ? "rgba(10, 10, 10, 0.95)" : "rgba(255, 255, 255, 0.95)", borderTopColor: colors.BORDER, shadowColor: colors.PRIMARY }]}
      >
        <Button
          title="BEGIN EXPLORATION"
          onPress={handleGenerateTrip}
          size="medium"
          style={{ width: '100%' }}
          textStyle={{ letterSpacing: 2 }}
        />
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
  container: { flex: 1 },
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
    lineHeight: 34,
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 150
  },
  insightHero: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderLeftWidth: 2,
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
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  insightHeaderTitle: {
    fontFamily: "outfitBold",
    fontSize: 10,
    letterSpacing: 2,
  },
  insightText: {
    fontFamily: "playfair",
    fontSize: 16,
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
    gap: 12,
  },
  insightTimingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  insightTimingLabel: {
    fontFamily: "outfitBold",
    fontSize: 9,
    letterSpacing: 0.5,
  },
  insightTimingValue: {
    fontFamily: "outfitBold",
    fontSize: 13,
    flex: 1,
    textAlign: "right",
  },
  bridgeCard: {
    borderRadius: 24,
    padding: 2,
    marginBottom: 20,
    borderWidth: 1,
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
    height: 65,
    borderRadius: 22,
    paddingHorizontal: 20,
  },
  labelSection: { width: 40 },
  label: {
    fontFamily: "outfitBold",
    fontSize: 10,
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
    aspectRatio: 1,
    borderRadius: 32,
    padding: Math.min(18, width * 0.042),
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
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
    opacity: 0.7,
  },
  tileLabelCenter: {
    fontFamily: "outfitBold",
    fontSize: 9,
    letterSpacing: 2,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 15,
  },
  tileValue: {
    fontFamily: "playfairBold",
    fontSize: Math.min(54, width * 0.125),
    lineHeight: Math.min(60, width * 0.14),
    marginBottom: 6,
  },
  tileUnit: {
    fontFamily: "outfitBold",
    fontSize: 10,
    letterSpacing: 1,
    marginTop: -8,
  },
  tileActions: {
    flexDirection: "row",
    gap: Math.min(20, width * 0.045),
    marginTop: 8,
  },
  tileBtn: {
    width: Math.min(44, width * 0.1),
    height: Math.min(44, width * 0.1),
    borderRadius: Math.min(22, width * 0.05),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  tileBtnText: {
    fontSize: 20,
    fontFamily: "outfitBold",
  },
  budgetTierCard: {
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
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
  },
  budgetPillText: {
    fontFamily: "outfitBold",
    fontSize: 10,
    letterSpacing: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 25,
    borderTopWidth: 1,
  },
  primaryBtn: {
    height: 70,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  primaryBtnText: {
    fontFamily: "outfitBold",
    fontSize: 15,
    letterSpacing: 4,
  },
});
