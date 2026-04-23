import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Button from "@/src/components/common/Button";

interface BudgetSetupProps {
  isDark: boolean;
  colors: any;
  newBudgetInput: string;
  setNewBudgetInput: (text: string) => void;
  handleSetBudget: () => void;
  loading: boolean;
}

export const BudgetSetup = ({
  isDark,
  colors,
  newBudgetInput,
  setNewBudgetInput,
  handleSetBudget,
  loading,
}: BudgetSetupProps) => {
  return (
    <BlurView
      intensity={80}
      tint={isDark ? "dark" : "light"}
      style={[
        styles.setupContainer,
        {
          backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(241, 245, 249, 0.5)",
          borderColor: colors.BORDER,
        },
      ]}
    >
      <MaterialCommunityIcons name="wallet-plus-outline" size={40} color={colors.PRIMARY} />
      <Text style={[styles.setupHeader, { color: colors.TEXT }]}>Initialize Budget</Text>
      <Text style={[styles.setupDesc, { color: colors.MUTED_TEXT }]}>
        Set a total budget for this journey to start tracking your savings.
      </Text>
      <TextInput
        placeholder="Enter Amount (₹)"
        value={newBudgetInput}
        onChangeText={(text) => setNewBudgetInput(text.replace(/[^0-9.]/g, ""))}
        keyboardType="numeric"
        style={[
          styles.input,
          { backgroundColor: colors.SURFACE, borderColor: colors.BORDER, color: colors.PRIMARY },
        ]}
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
  );
};

const styles = StyleSheet.create({
  setupContainer: {
    padding: 30,
    borderRadius: 24,
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
  },
  setupHeader: {
    fontSize: 22,
    fontFamily: "playfairBold",
    marginTop: 15,
  },
  setupDesc: {
    fontFamily: "outfit",
    fontSize: 14,
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
  setTotalButton: { width: "100%", height: 60, borderRadius: 16 },
});
