import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../common/Button";
import { Colors, useThemeColors } from "@/src/constants/theme";
import { SpendingFormProps } from "@/src/constants";
import { useTheme } from "@/src/context/ThemeContext";

const { width } = Dimensions.get("window");

export const SpendingForm = ({
  spendingName,
  amountInput,
  isSaving,
  setSpendingName,
  setAmountInput,
  hideForm,
  clearAll,
  recordSpending,
}: SpendingFormProps) => {
  const isRecordDisabled = isSaving || !spendingName.trim() || isNaN(parseFloat(amountInput));

  return (
    <View style={styles.formCard}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Add New Expense</Text>
          <Text style={styles.subtitle}>Fill in the details below</Text>
        </View>
        <TouchableOpacity onPress={hideForm} style={styles.closeIconButton}>
          <Ionicons name="close" size={24} color={Colors.GOLD} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputSection}>
        <View style={styles.inputWrapper}>
          <Ionicons name="pencil-outline" size={20} color={Colors.GOLD} style={styles.inputIcon} />
          <TextInput
            placeholder="What did you spend on?"
            value={spendingName}
            onChangeText={setSpendingName}
            style={styles.textInput}
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="cash-outline" size={20} color={Colors.GOLD} style={styles.inputIcon} />
          <TextInput
            placeholder="0.00"
            value={amountInput}
            onChangeText={(text) => setAmountInput(text.replace(/[^0-9.]/g, ""))}
            keyboardType="numeric"
            style={styles.textInput}
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
          />
          <Text style={styles.currencySuffix}>INR</Text>
        </View>
      </View>
      
      <View style={styles.footerActions}>
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={clearAll}
        >
          <Ionicons name="refresh-outline" size={20} color={Colors.GOLD} />
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>

        <Button
          title="SAVE"
          icon="checkmark-circle"
          onPress={recordSpending}
          disabled={isRecordDisabled}
          loading={isSaving}
          type="primary"
          style={styles.recordButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formCard: {
    borderRadius: 28,
    padding: 24,
    width: width * 0.9,
    backgroundColor: Colors.BLACK,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 1.5,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontFamily: "playfairBold",
    color: Colors.WHITE,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "outfitMedium",
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  closeIconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  inputSection: {
    gap: 15,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 18,
    height: 60,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    fontFamily: "outfitBold",
    color: Colors.WHITE,
  },
  currencySuffix: {
    fontFamily: "outfitBold",
    fontSize: 14,
    color: Colors.WHITE,
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 30,
  },
  clearButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 60,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  clearText: {
    fontFamily: "outfitBold",
    fontSize: 15,
    color: Colors.WHITE,
  },
  recordButton: {
    flex: 2,
    height: 60,
    borderRadius: 20,
  },
});
