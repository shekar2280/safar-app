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

const travelerModes = [
  { mode: TravelerMode.Solo, label: "SOLO", count: 1 },
  { mode: TravelerMode.Couple, label: "COUPLE", count: 2 },
  { mode: TravelerMode.Family, label: "FAMILY", count: 3 },
  { mode: TravelerMode.Friends, label: "FRIENDS", count: 5 },
];

const getTravelerObject = (mode: TravelerMode, count: number): TravelerGroup => {
  if (mode === TravelerMode.Solo) return { id: 1, title: "Just Me", desc: "A solo traveler on a personal journey", people: "1" };
  if (mode === TravelerMode.Couple) return { id: 2, title: "Couple", desc: "Two people traveling together", people: "2" };
  if (mode === TravelerMode.Family) return { id: 3, title: "Family", desc: "A family trip with parents and kids", people: `${count}` };
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
    const modeData = travelerModes.find(m => m.mode === travelerMode);
    if (modeData) {
      setTravelerCount(modeData.count);
    }
  }, [travelerMode]);

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
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: DELAY, type: "timing" }}
          style={styles.modeContainer}
        >
          <View style={styles.modeWrapper}>
            <MotiView
              animate={{
                translateX: (travelerModes.findIndex(m => m.mode === travelerMode) * (width - 58)) / 4,
              }}
              transition={{ type: "timing", duration: 300, easing: Easing.out(Easing.exp) }}
              style={styles.modeIndicator}
            />
            {travelerModes.map((item) => (
              <TouchableOpacity
                key={item.mode}
                style={styles.modeSegment}
                onPress={() => setTravelerMode(item.mode)}
                activeOpacity={1}
              >
                <Text style={[
                  styles.modeText,
                  travelerMode === item.mode && styles.modeTextActive
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </MotiView>

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
    paddingHorizontal: 25,
    paddingBottom: 150
  },
  modeContainer: {
    marginBottom: 20,
    marginTop: 5,
  },
  modeWrapper: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 20,
    height: 54,
    padding: 4,
    position: "relative",
  },
  modeIndicator: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 4,
    width: (width - 58) / 4,
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeSegment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  modeText: {
    fontFamily: "outfitBold",
    fontSize: 10,
    color: Colors.MUTED_TEXT,
    letterSpacing: 1.2,
  },
  modeTextActive: {
    color: Colors.PRIMARY,
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
});
