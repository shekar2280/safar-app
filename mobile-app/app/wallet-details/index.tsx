import {
  Dimensions,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, useThemeColors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { SpendingForm } from "@/src/components/wallet/SpendingForm";
import { SpendingItem } from "@/src/components/wallet/SpendingItem";
import { BudgetSetup } from "@/src/components/wallet/BudgetSetup";
import { WalletBalanceCard } from "@/src/components/wallet/WalletBalanceCard";
import SafarAlert from "@/src/components/ui/SafarAlert";
import WalletSkeleton from "@/src/components/skeleton/WalletSkeleton";
import Button from "@/src/components/common/Button";
import { useWallet } from "@/src/hooks/useWallet";

const { height } = Dimensions.get("window");

export default function SpendingsInput() {
  const {
    tripId,
    currentTrip,
    isFinished,
    loading,
    spendingName,
    setSpendingName,
    amountInput,
    setAmountInput,
    isFormVisible,
    setIsFormVisible,
    sortOrder,
    setSortOrder,
    totalBudget,
    newBudgetInput,
    setNewBudgetInput,
    isSaving,
    hasSeenSwipeTip,
    alertConfig,
    setAlertConfig,
    allSpendings,
    totalSpent,
    remBudget,
    currency,
    setCurrency,
    handleSetBudget,
    recordSpending,
    clearAll,
    hideForm,
    dismissSwipeTip,
  } = useWallet();

  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { isDark } = useTheme();

  if (loading && totalBudget <= 0) {
    return <WalletSkeleton />;
  }

  return (
    <View style={[styles.mainWrapper, { backgroundColor: colors.BACKGROUND }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: Math.max(insets.top + 20, height * 0.05) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {totalBudget <= 0 && (
          <View style={styles.header}>
            <Text style={[styles.subtitle, { color: colors.MUTED_TEXT }]}>
              EXPENSE TRACKER • {currentTrip?.tripPlan?.tripName?.toUpperCase()}
            </Text>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.TEXT }]}>Trip Wallet</Text>
              <View style={[styles.goldDot, { backgroundColor: colors.GOLD }]} />
            </View>
          </View>
        )}

        <View style={{ gap: 20 }}>
          {totalBudget <= 0 ? (
            <BudgetSetup
              isDark={isDark}
              colors={colors}
              newBudgetInput={newBudgetInput}
              setNewBudgetInput={setNewBudgetInput}
              handleSetBudget={handleSetBudget}
              loading={loading}
              currency={currency}
              setCurrency={setCurrency}
            />
          ) : (
            <WalletBalanceCard
              isFinished={isFinished}
              remBudget={remBudget}
              totalBudget={totalBudget}
              totalSpent={totalSpent}
              currency={currency}
            />
          )}

          <View style={styles.historySection}>
            <View style={styles.historyHeaderRow}>
              <Text style={[styles.historyHeader, { color: colors.TEXT }]}>Transaction Logs</Text>
              <TouchableOpacity
                onPress={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                style={styles.sortButton}
              >
                <Ionicons
                  name={sortOrder === "desc" ? "swap-vertical-outline" : "swap-vertical"}
                  size={16}
                  color={colors.BLACK}
                />
                <Text style={[styles.sortText, { color: colors.BLACK }]}>
                  {sortOrder === "desc" ? "LATEST" : "OLDEST"}
                </Text>
              </TouchableOpacity>
            </View>

            {allSpendings.length > 0 && !hasSeenSwipeTip && (
              <View
                style={[
                  styles.swipeTipBox,
                  {
                    backgroundColor: isDark
                      ? "rgba(225, 193, 110, 0.05)"
                      : "rgba(235, 245, 255, 0.9)",
                    borderColor: isDark ? "rgba(225, 193, 110, 0.2)" : "rgba(14, 165, 233, 0.2)",
                  },
                ]}
              >
                <Ionicons name="information-circle" size={24} color={colors.PRIMARY} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.swipeTipText, { color: colors.TEXT }]}>
                    Tip: Drag a log to the left to see delete button.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={dismissSwipeTip}
                  style={[
                    styles.swipeTipBtn,
                    { backgroundColor: isDark ? colors.GOLD : colors.PRIMARY },
                  ]}
                >
                  <Text
                    style={[styles.swipeTipBtnText, { color: isDark ? colors.BLACK : colors.WHITE }]}
                  >
                    OK, GOT IT
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {allSpendings.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Text style={[styles.emptyHistoryText, { color: colors.MUTED_TEXT }]}>
                  No transactions recorded yet.
                </Text>
              </View>
            ) : (
              allSpendings.map((item) => (
                <SpendingItem
                  key={item.id}
                  item={item}
                  tripId={tripId!}
                  isFinished={isFinished}
                  currency={currency}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {isFormVisible && (
        <View style={styles.formOverlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={hideForm} />
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
              currency={currency}
            />
          </View>
        </View>
      )}

      {!isFormVisible && !isFinished && totalBudget > 0 && (
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
        <View
          style={[
            styles.globalLoader,
            { backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)" },
          ]}
        >
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
  mainWrapper: { flex: 1 },
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
    fontSize: 26,
    lineHeight: 34,
  },
  goldDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginLeft: 2,
    marginBottom: 8,
  },
  historySection: { marginTop: 10 },
  historyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  historyHeader: { fontSize: 14, fontFamily: "outfitBold", letterSpacing: 1 },
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
    marginLeft: 6,
  },
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
  formOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15, 23, 42, 0.6)" },
  floatingFormCard: { width: "90%" },
  emptyHistory: { paddingVertical: 40, alignItems: "center" },
  emptyHistoryText: { fontFamily: "outfit", fontSize: 14 },
  globalLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
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
