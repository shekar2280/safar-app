import React, { useRef } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Button from "@/src/components/common/Button";
import { Modal, FlatList } from "react-native";
import { useState } from "react";
import { COMMON_CURRENCIES } from "@/src/constants";

interface BudgetSetupProps {
  isDark: boolean;
  colors: any;
  newBudgetInput: string;
  setNewBudgetInput: (text: string) => void;
  handleSetBudget: () => void;
  loading: boolean;
  currency: string;
  setCurrency: (c: string) => void;
}

export const BudgetSetup = ({
  isDark,
  colors,
  newBudgetInput,
  setNewBudgetInput,
  handleSetBudget,
  loading,
  currency,
  setCurrency,
}: BudgetSetupProps) => {
  const [modalVisible, setModalVisible] = useState(false);

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
      
      <TouchableOpacity
        style={[
          styles.accordionSelector,
          { backgroundColor: colors.SURFACE, borderColor: colors.BORDER },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.accordionLeft}>
          <MaterialCommunityIcons name="earth" size={20} color={colors.GOLD} style={styles.accordionIcon} />
          <Text style={[styles.accordionText, { color: colors.TEXT }]}>
            Selected Currency: {currency}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-down" size={20} color={colors.MUTED_TEXT} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.SURFACE }]}>
            <Text style={[styles.modalTitle, { color: colors.TEXT }]}>Select Currency</Text>
            <FlatList
              data={COMMON_CURRENCIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.currencyItem, { borderBottomColor: colors.BORDER }]}
                  onPress={() => {
                    setCurrency(item.symbol);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.currencyText, { color: colors.TEXT }]}>{item.code} ({item.symbol})</Text>
                </TouchableOpacity>
              )}
            />
            <Button title="Close" onPress={() => setModalVisible(false)} style={styles.closeButton} />
          </View>
        </View>
      </Modal>

      <TextInput
        placeholder={`Enter Amount (${currency})`}
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
    textAlign: "left",
  },
  accordionSelector: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  accordionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  accordionIcon: {
    marginRight: 10,
  },
  accordionText: {
    fontFamily: "outfitBold",
    fontSize: 16,
  },
  setTotalButton: { width: "100%", height: 60, borderRadius: 16 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    maxHeight: "60%",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontFamily: "outfitBold",
    fontSize: 20,
    marginBottom: 15,
    textAlign: "center",
  },
  currencyItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  currencyText: {
    fontFamily: "outfit",
    fontSize: 16,
  },
  closeButton: {
    marginTop: 15,
    width: "100%",
    height: 50,
  },
});
