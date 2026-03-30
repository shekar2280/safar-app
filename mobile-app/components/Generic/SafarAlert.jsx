import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { BlurView } from "expo-blur";
import { MotiView, AnimatePresence } from "moti";
import { Colors } from "../../constants/Colors";
import { Typography, Radius, Shadow, Spacing } from "../../constants/Theme";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");


export default function SafarAlert({
  visible,
  title,
  message,
  type = "info",
  confirmText = "Continue",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  const isDestructive = type === "confirm";
  const iconName = type === "error" ? "alert-circle" : type === "confirm" ? "trash" : "information-circle";
  const iconColor = type === "error" || type === "confirm" ? Colors.RED : Colors.SECONDARY;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <AnimatePresence>
          {visible && (
            <BlurView intensity={25} style={StyleSheet.absoluteFill} tint="dark">
              <TouchableOpacity 
                activeOpacity={1} 
                style={styles.centeredView} 
                onPress={onCancel}
              >
                <MotiView
                  from={{ opacity: 0, scale: 0.9, translateY: 10 }}
                  animate={{ opacity: 1, scale: 1, translateY: 0 }}
                  exit={{ opacity: 0, scale: 0.9, translateY: 10 }}
                  transition={{ type: "timing", duration: 250 }}

                  style={styles.alertCard}
                >
                  <View style={styles.iconWrapper}>
                    <View style={[styles.iconCircle, { backgroundColor: `${iconColor}20` }]}>
                      <Ionicons name={iconName} size={32} color={iconColor} />
                    </View>
                  </View>

                  <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                  </View>

                  <View style={styles.buttonContainer}>
                    {isDestructive && (
                      <TouchableOpacity 
                        style={styles.cancelBtn} 
                        onPress={onCancel}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.cancelText}>{cancelText}</Text>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity 
                      style={[
                        styles.confirmBtn, 
                        { backgroundColor: iconColor }
                      ]} 
                      onPress={onConfirm}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.confirmText}>{confirmText}</Text>
                    </TouchableOpacity>
                  </View>
                </MotiView>
              </TouchableOpacity>
            </BlurView>
          )}
        </AnimatePresence>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  alertCard: {
    width: width * 0.85,
    backgroundColor: Colors.WHITE,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    alignItems: "center",
    ...Shadow.card,
  },
  iconWrapper: {
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  title: {
    fontFamily: "playfairBold",
    fontSize: 24,
    color: Colors.PRIMARY,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  message: {
    fontFamily: "outfit",
    fontSize: 15,
    color: Colors.MUTED_TEXT,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    height: 54,
    borderRadius: Radius.lg,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  cancelText: {
    fontFamily: "outfitBold",
    fontSize: 14,
    color: Colors.MUTED_TEXT,
  },
  confirmBtn: {
    flex: 1,
    height: 54,
    borderRadius: Radius.lg,
    justifyContent: "center",
    alignItems: "center",
    ...Shadow.soft,
  },
  confirmText: {
    fontFamily: "outfitBold",
    fontSize: 14,
    color: Colors.WHITE,
    letterSpacing: 1,
  },
});
