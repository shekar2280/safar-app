import React from "react";
import { Text, TouchableOpacity, StyleSheet, Dimensions, ViewStyle, TextStyle } from "react-native";
import { Colors } from "@/src/constants/colors";
import { ActionButtonProps } from "@/src/types/interfaces";

const { width } = Dimensions.get("window");

export const ActionButton = ({ title, onPress, disabled, styleOverride = {} }: ActionButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.primaryActionButton,
      { opacity: disabled ? 0.5 : 1 },
      styleOverride as ViewStyle,
      { backgroundColor: Colors.PRIMARY },
    ]}
  >
    {typeof title === "string" ? (
      <Text style={styles.actionButtonText}>{title}</Text>
    ) : (
      title
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  primaryActionButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: width * 0.04,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    textAlign: "center",
    color: Colors.WHITE,
    fontFamily: "outfitMedium",
    fontSize: width * 0.04,
  },
});
