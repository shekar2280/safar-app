import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { BlurView } from "expo-blur";
import { MotiView, AnimatePresence } from "moti";
import { Colors, useThemeColors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow, Spacing } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { SafarAlertProps } from "@/src/constants";

const { width } = Dimensions.get("window");

export default function SafarAlert({
  visible,
  title,
  message,
  type = "info",
  confirmText = "Continue",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: SafarAlertProps) {
  const colors = useThemeColors();
  const { isDark } = useTheme();
  const isDestructive = type === "confirm";
  const iconName = type === "error" ? "alert-circle" : type === "confirm" ? "trash" : "information-circle";
  const iconColor = type === "error" || type === "confirm" ? colors.RED : colors.SECONDARY;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <AnimatePresence>
          {visible && (
            <BlurView intensity={25} style={StyleSheet.absoluteFill} tint={isDark ? "dark" : "light"}>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.centeredView}
                onPress={loading ? undefined : onCancel}
              >
                <MotiView
                  from={{ opacity: 0, scale: 0.9, translateY: 10 }}
                  animate={{ opacity: 1, scale: 1, translateY: 0 }}
                  exit={{ opacity: 0, scale: 0.9, translateY: 10 }}
                  transition={{ type: "timing", duration: 250 }}
                  style={[styles.alertCard, { backgroundColor: colors.SURFACE }]}
                >
                  <View style={styles.iconWrapper}>
                    <View style={[styles.iconCircle, { backgroundColor: `${iconColor}20` }]}>
                      <Ionicons name={iconName} size={32} color={iconColor} />
                    </View>
                  </View>

                  <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: colors.TEXT }]}>{title}</Text>
                    <Text style={[styles.message, { color: colors.MUTED_TEXT }]}>{message}</Text>
                  </View>

                  <View style={styles.buttonContainer}>
                    {isDestructive && (
                        <TouchableOpacity
                          style={[styles.cancelBtn, { backgroundColor: colors.SURFACE_LIGHT }]}
                          onPress={onCancel}
                          activeOpacity={0.7}
                          disabled={loading}
                        >
                          <Text style={[styles.cancelText, { color: colors.MUTED_TEXT, opacity: loading ? 0.5 : 1 }]}>{cancelText}</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.confirmBtn, { backgroundColor: iconColor }]}
                      onPress={onConfirm}
                      activeOpacity={0.8}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color={(type === "error" || type === "confirm") ? colors.WHITE : colors.BLACK} size="small" />
                      ) : (
                        <Text style={[
                          styles.confirmText, 
                          { color: (type === "error" || type === "confirm") ? colors.WHITE : colors.BLACK }
                        ]}>
                          {confirmText}
                        </Text>
                      )}
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
    fontSize: 20,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  message: {
    fontFamily: "outfit",
    fontSize: 15,
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
  },
  cancelText: {
    fontFamily: "outfitBold",
    fontSize: 14,
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
    letterSpacing: 1,
  },
});
