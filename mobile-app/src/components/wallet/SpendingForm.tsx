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
import { ActionButton } from "./ActionButton";
import { Colors } from "@/src/constants/colors";
import { SpendingFormProps } from "@/src/types/interfaces";

const { width } = Dimensions.get("window");

export const SpendingForm = ({
  spendingName,
  amountInput,
  setSpendingName,
  setAmountInput,
  hideForm,
  clearAll,
  recordSpending,
  isProcessing,
}: SpendingFormProps) => {
  const isRecordDisabled = isProcessing || !spendingName.trim() || isNaN(parseFloat(amountInput));

  return (
    <View style={styles.formCard}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Add New Expense</Text>
          <Text style={styles.subtitle}>Fill in the details below</Text>
        </View>
        <TouchableOpacity onPress={hideForm} style={styles.closeIconButton}>
          <Ionicons name="close" size={24} color={Colors.GRAY} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputSection}>
        <View style={styles.inputWrapper}>
          <Ionicons name="pencil-outline" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
          <TextInput
            placeholder="What did you spend on?"
            value={spendingName}
            onChangeText={setSpendingName}
            style={styles.textInput}
            placeholderTextColor={Colors.GRAY}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="cash-outline" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
          <TextInput
            placeholder="0.00"
            value={amountInput}
            onChangeText={(text) => setAmountInput(text.replace(/[^0-9.]/g, ""))}
            keyboardType="numeric"
            style={styles.textInput}
            placeholderTextColor={Colors.GRAY}
          />
          <Text style={styles.currencySuffix}>INR</Text>
        </View>
      </View>
      
      <View style={styles.footerActions}>
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={clearAll}
        >
          <Ionicons name="refresh-outline" size={20} color={Colors.RED} />
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>

        <ActionButton
          title={
            <View style={styles.recordContent}>
              <Ionicons name="checkmark-circle" size={22} color={Colors.WHITE} />
              <Text style={styles.recordText}>Save</Text>
            </View>
          }
          onPress={recordSpending}
          disabled={isRecordDisabled}
          styleOverride={styles.recordButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 24,
    padding: 24,
    width: width * 0.9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "outfitBold",
    color: Colors.BLACK,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "outfit",
    color: Colors.GRAY,
    marginTop: 2,
  },
  closeIconButton: {
    padding: 4,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
  },
  inputSection: {
    gap: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "outfitMedium",
    color: Colors.BLACK,
  },
  currencySuffix: {
    fontFamily: "outfitBold",
    color: Colors.PRIMARY,
    fontSize: 12,
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 24,
  },
  clearButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.RED,
  },
  clearText: {
    color: Colors.RED,
    fontFamily: "outfitBold",
    fontSize: 16,
  },
  recordButton: {
    flex: 2,
    height: 56,
    borderRadius: 16,
  },
  recordContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recordText: {
    color: Colors.WHITE,
    fontFamily: "outfitBold",
    fontSize: 16,
  },
});
