import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/src/constants/theme";

interface WalletBalanceCardProps {
  isFinished: boolean;
  remBudget: number;
  totalBudget: number;
  totalSpent: number;
  currency: string;
}

export const WalletBalanceCard = ({
  isFinished,
  remBudget,
  totalBudget,
  totalSpent,
  currency,
}: WalletBalanceCardProps) => {
  return (
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
              { color: isFinished ? "#F1F5F9" : remBudget < 0 ? "#FF4B4B" : "#FFFFFF" },
            ]}
          >
            {currency}{remBudget.toLocaleString("en-US")}
          </Text>
        </View>
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: isFinished ? "#94A3B8" : remBudget < 0 ? "#FF4B4B" : "#4ADE80",
            },
          ]}
        />
      </View>

      <View style={styles.dividerFull} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>TOTAL BUDGET</Text>
          <Text style={styles.statValue}>{currency}{totalBudget.toLocaleString("en-US")}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>SPENDINGS</Text>
          <Text style={styles.statValue}>{currency}{totalSpent.toLocaleString("en-US")}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
    letterSpacing: 2,
  },
  bigAmount: {
    fontSize: 32,
    fontFamily: "outfitBold",
    marginTop: 8,
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
    letterSpacing: 1.5,
  },
  statValue: {
    color: Colors.WHITE,
    fontSize: 18,
    fontFamily: "outfitBold",
    marginTop: 6,
  },
  statDivider: {
    width: 1,
    height: 25,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 15,
  },
});
