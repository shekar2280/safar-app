import {
  Dimensions,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Spending } from "@/src/types";
import { Colors, useThemeColors } from "@/src/constants/colors";
import { SpendingForm } from "@/src/components/wallet/SpendingForm";
import { SpendingItem } from "@/src/components/wallet/SpendingItem";
import { useUser } from "@/src/context/UserContext";
import { formatSpendingDate } from "@/src/utils/dateFormatter";
import { useTrips } from "@/src/hooks/queries/useTrips";
import { useQueryClient } from "@tanstack/react-query";
import { tripQueryKeys } from "@/src/hooks/queries/useTrips";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { UserTrip } from "@/src/types";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SafarAlert from "@/src/components/ui/SafarAlert";
import WalletSkeleton from "@/src/components/skeleton/WalletSkeleton";
import { useTheme } from "@/src/context/ThemeContext";
import Button from "@/src/components/common/Button";
import { useActiveTrip } from "@/src/context/ActiveTripContext";
import NetInfo from "@react-native-community/netinfo";

const { width, height } = Dimensions.get("window");

export default function SpendingsInput() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { userProfile } = useUser();
  const { data: userTrips = [] } = useTrips();
  const { activeTrip, updateTripBudget, ...useActiveTripContext } = useActiveTrip();
  const queryClient = useQueryClient();
  const user = userProfile;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(false);
  const [spendingName, setSpendingName] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [totalBudget, setTotalBudget] = useState(0);
  const [newBudgetInput, setNewBudgetInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasSeenSwipeTip, setHasSeenSwipeTip] = useState(true);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "info" | "error" | "confirm";
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    const checkSwipeTip = async () => {
      if (!tripId) return;
      const seen = await AsyncStorage.getItem(`seenSwipeTip_${tripId}`);
      setHasSeenSwipeTip(!!seen);
    };
    checkSwipeTip();
  }, [tripId]);

  const dismissSwipeTip = async () => {
    if (!tripId) return;
    await AsyncStorage.setItem(`seenSwipeTip_${tripId}`, "true");
    setHasSeenSwipeTip(true);
  };

  useEffect(() => {
    if (!activeTrip && tripId && userTrips.length > 0) {
      const trip = userTrips.find((t: UserTrip) => t.id === tripId);
      if (trip) {
        useActiveTripContext.setActiveTrip(trip);
      }
    }
  }, [activeTrip, tripId, userTrips]);

  const currentTrip = useMemo(() => {
    if (activeTrip?.id === tripId) return activeTrip;
    return userTrips?.find((t: UserTrip) => t.id === tripId);
  }, [userTrips, tripId, activeTrip]);

  const isFinished = currentTrip?.isFinished || false;

  useEffect(() => {
    if (currentTrip) {
      setTotalBudget(currentTrip.totalBudget || 0);
    }
  }, [currentTrip]);

  const allSpendings = useMemo(() => {
    const archived = (currentTrip?.archivedSpendings || []).map(s => ({
      ...s,
      date: s.date && !s.date.includes('T') ? s.date : formatSpendingDate(s.timestamp)
    }));

    return archived.sort((a, b) => {
      return sortOrder === "desc"
        ? b.timestamp - a.timestamp
        : a.timestamp - b.timestamp;
    });
  }, [currentTrip?.archivedSpendings, sortOrder]);

  const totalSpent = useMemo(() => {
    return allSpendings.reduce((sum, item) => sum + item.amount, 0);
  }, [allSpendings]);

  const remBudget = useMemo(() => totalBudget - totalSpent, [totalBudget, totalSpent]);

  const handleSetBudget = async () => {
    if (isFinished) return;
    if (!tripId || !user) return;
    const newBudget = parseFloat(newBudgetInput);
    if (isNaN(newBudget) || newBudget <= 0) {
      return setAlertConfig({
        visible: true,
        title: "Check Amount",
        message: "Budget values must be positive numeric amounts. Please verify your entry and try again.",
        type: "error",
      });
    }

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected && totalBudget <= 0) {
      return setAlertConfig({
        visible: true,
        title: "Connection Required",
        message: "You need to be connected to a network to set your initial trip budget. Please connect and try again.",
        type: "info",
      });
    }

    try {
      setLoading(true);
      await updateTripBudget(tripId, newBudget);
      setNewBudgetInput("");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setAlertConfig({
        visible: true,
        title: "Sync Pending",
        message: "Your budget has been saved locally, but we couldn't sync it with the server. It will sync automatically when you're back online.",
        type: "info",
      });
    }
  };

  const recordSpending = async () => {
    if (!tripId || !user) return;
    const amount = parseFloat(amountInput);
    if (!spendingName.trim() || isNaN(amount))
      return Alert.alert("Error", "Fill all details.");
    try {
      setIsSaving(true);
      await useActiveTripContext.recordSpending(tripId, {
        name: spendingName.trim(),
        amount,
      });
      clearAll();
      setIsSaving(false);
      setIsFormVisible(false);
    } catch (error) {
      setIsSaving(false);
    }
  };

  const clearAll = () => {
    setSpendingName("");
    setAmountInput("");
  };

  const hideForm = () => {
    clearAll();
    setIsFormVisible(false);
  };

  if (loading && totalBudget <= 0) {
    return <WalletSkeleton />;
  }

  return (
    <View style={[styles.mainWrapper, { backgroundColor: colors.BACKGROUND }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { paddingTop: Math.max(insets.top + 20, height * 0.05) }]}
        showsVerticalScrollIndicator={false}
      >
        {totalBudget <= 0 && (
          <View style={styles.header}>
            <Text style={[styles.subtitle, { color: colors.MUTED_TEXT }]}>EXPENSE TRACKER • {currentTrip?.tripPlan?.tripName?.toUpperCase()}</Text>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.TEXT }]}>Trip Wallet</Text>
              <View style={[styles.goldDot, { backgroundColor: colors.GOLD }]} />
            </View>
          </View>
        )}

        <View style={{ gap: 20 }}>
          {totalBudget <= 0 ? (
            <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={[styles.setupContainer, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(241, 245, 249, 0.5)", borderColor: colors.BORDER }]}>
              <MaterialCommunityIcons name="wallet-plus-outline" size={40} color={colors.PRIMARY} />
              <Text style={[styles.setupHeader, { color: colors.TEXT }]}>Initialize Budget</Text>
              <Text style={[styles.setupDesc, { color: colors.MUTED_TEXT }]}>Set a total budget for this journey to start tracking your savings.</Text>
              <TextInput
                placeholder="Enter Amount (₹)"
                value={newBudgetInput}
                onChangeText={(text) =>
                  setNewBudgetInput(text.replace(/[^0-9.]/g, ""))
                }
                keyboardType="numeric"
                style={[styles.input, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER, color: colors.PRIMARY }]}
                placeholderTextColor={colors.GRAY}
              />
              <Button
                title="SET BUDGET"
                onPress={handleSetBudget}
                disabled={!newBudgetInput.trim() || loading}
                loading={loading}
                style={styles.setTotalButton}
              />
            </BlurView>
          ) : (
            <LinearGradient
              colors={isFinished ? ["#94A3B8", "#1E293B"] : ["#000000ff", "#9A7E3D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.budgetSummary}
            >
              <View style={styles.balanceHeader}>
                <View style={styles.balanceInfo}>
                  <Text style={styles.label}>AVAILABLE BALANCE</Text>
                  <Text
                    style={[
                      styles.bigAmount,
                      { color: isFinished ? "#F1F5F9" : (remBudget < 0 ? "#FF4B4B" : "#FFFFFF") },
                    ]}
                  >
                    ₹{remBudget.toLocaleString("en-IN")}
                  </Text>
                </View>
                <View style={[styles.statusIndicator, { backgroundColor: isFinished ? "#94A3B8" : (remBudget < 0 ? "#FF4B4B" : "#4ADE80") }]} />
              </View>

              <View style={styles.dividerFull} />

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>TOTAL BUDGET</Text>
                  <Text style={styles.statValue}>
                    ₹{totalBudget.toLocaleString("en-IN")}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>SPENDINGS</Text>
                  <Text style={styles.statValue}>
                    ₹{totalSpent.toLocaleString("en-IN")}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          )}

          <View style={styles.historySection}>
            <View style={styles.historyHeaderRow}>
              <Text style={[styles.historyHeader, { color: colors.TEXT }]}>
                Transaction Logs
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                }
                style={styles.sortButton}
              >
                <Ionicons
                  name={
                    sortOrder === "desc"
                      ? "swap-vertical-outline"
                      : "swap-vertical"
                  }
                  size={16}
                  color={colors.BLACK}
                />
                <Text style={[styles.sortText, { color: colors.BLACK }]}>
                  {sortOrder === "desc" ? "LATEST" : "OLDEST"}
                </Text>
              </TouchableOpacity>
            </View>

            {allSpendings.length > 0 && !hasSeenSwipeTip && (
              <View style={[
                styles.swipeTipBox,
                {
                  backgroundColor: isDark ? "rgba(225, 193, 110, 0.05)" : "rgba(235, 245, 255, 0.9)",
                  borderColor: isDark ? "rgba(225, 193, 110, 0.2)" : "rgba(14, 165, 233, 0.2)"
                }
              ]}>
                <Ionicons name="information-circle" size={24} color={colors.PRIMARY} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.swipeTipText, { color: colors.TEXT }]}>
                    Tip: Drag a log to the left to see delete button.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={dismissSwipeTip}
                  style={[styles.swipeTipBtn, { backgroundColor: isDark ? colors.GOLD : colors.PRIMARY }]}
                >
                  <Text style={[styles.swipeTipBtnText, { color: isDark ? colors.BLACK : colors.WHITE }]}>OK, GOT IT</Text>
                </TouchableOpacity>
              </View>
            )}

            {allSpendings.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Text style={[styles.emptyHistoryText, { color: colors.MUTED_TEXT }]}>No transactions recorded yet.</Text>
              </View>
            ) : (
              allSpendings.map((item) => (
                <SpendingItem key={item.id} item={item} tripId={tripId!} isFinished={isFinished} />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {isFormVisible && (
        <View style={styles.formOverlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={hideForm}
          />
          <View style={styles.floatingFormCard}>
            <SpendingForm
              spendingName={spendingName}
              amountInput={amountInput}
              isSaving={isSaving}
              setSpendingName={setSpendingName}
              setAmountInput={setAmountInput}
              hideForm={hideForm}
              clearAll={clearAll}
              recordSpending={recordSpending}
            />
          </View>
        </View>
      )}

      {!isFormVisible && !isFinished && (
        <View style={styles.fixedButtonContainer}>
          <Button
            title="RECORD EXPENSE"
            onPress={() => setIsFormVisible(true)}
            icon="add"
            type="primary"
            style={[styles.addSpendingButtonFixed, { paddingVertical: 0 }]}
          />
        </View>
      )}

      {loading && (
        <View style={[styles.globalLoader, { backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)" }]}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
        </View>
      )}

      <SafarAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })}
        onCancel={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: "#FDFDFD" },
  container: { flex: 1 },
  contentContainer: {
    paddingHorizontal: 10,
    paddingBottom: height * 0.2,
  },
  header: {
    paddingBottom: 25,
  },
  subtitle: {
    fontFamily: "outfitMedium",
    fontSize: 10,
    color: "#94A3B8",
    letterSpacing: 2.5,
    marginBottom: 5,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: -4,
  },
  title: {
    fontFamily: "playfairBold",
    fontSize: 40,
    color: Colors.PRIMARY,
    lineHeight: 48,
  },
  goldDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginLeft: 2,
    marginBottom: 8,
  },
  setupContainer: {
    padding: 30,
    borderRadius: 24,
    backgroundColor: "rgba(241, 245, 249, 0.5)",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  setupHeader: {
    fontSize: 22,
    fontFamily: "playfairBold",
    color: Colors.PRIMARY,
    marginTop: 15
  },
  setupDesc: {
    fontFamily: "outfit",
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 25,
    lineHeight: 20,
  },
  input: {
    width: "100%",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    fontFamily: "outfitBold",
    fontSize: 18,
    borderWidth: 1,
    marginBottom: 20,
    textAlign: "center",
  },
  budgetSummary: {
    borderRadius: 15,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  balanceInfo: { flex: 1 },
  label: {
    color: Colors.GOLD,
    fontSize: 12,
    fontFamily: "outfitBold",
    letterSpacing: 2
  },
  bigAmount: {
    fontSize: 38,
    fontFamily: "outfitBold",
    marginTop: 8,
    color: "#FFFFFF",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  dividerFull: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    width: "100%",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: { flex: 1, alignItems: "flex-start" },
  statLabel: {
    color: Colors.GOLD,
    fontSize: 9,
    fontFamily: "outfitBold",
    letterSpacing: 1.5
  },
  statValue: {
    color: Colors.WHITE,
    fontSize: 18,
    fontFamily: "outfitBold",
    marginTop: 6
  },
  statDivider: {
    width: 1,
    height: 25,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 15,
  },
  historySection: { marginTop: 10 },
  historyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  historyHeader: { fontSize: 14, fontFamily: "outfitBold", color: "#1E293B", letterSpacing: 1 },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.GOLD,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  sortText: {
    fontSize: 10,
    fontFamily: "outfitBold",
    color: Colors.PRIMARY,
    marginLeft: 6,
  },
  setTotalButton: { width: "100%", height: 60, borderRadius: 16 },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 40,
    left: 10,
    right: 10,
  },
  addSpendingButtonFixed: {
    backgroundColor: Colors.GOLD,
    flexDirection: "row",
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  addBtnText: { color: "#FFF", fontFamily: "outfitBold", fontSize: 14, letterSpacing: 1 },
  formOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 1000, justifyContent: "center", alignItems: "center" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15, 23, 42, 0.6)" },
  floatingFormCard: { width: width * 0.9 },
  emptyHistory: { paddingVertical: 40, alignItems: "center" },
  emptyHistoryText: { fontFamily: "outfit", fontSize: 14 },
  globalLoader: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", zIndex: 2000 },
  swipeTipBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    gap: 12,
    borderWidth: 1,
  },
  swipeTipText: {
    fontFamily: "outfitMedium",
    fontSize: 13,
    lineHeight: 18,
  },
  swipeTipBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  swipeTipBtnText: {
    fontFamily: "outfitBold",
    fontSize: 11,
  },
});
