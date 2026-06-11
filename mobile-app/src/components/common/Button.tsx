import React from "react";
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle, 
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/src/constants/colors";

import { ButtonProps } from "@/src/constants";

export default function Button({
  title,
  onPress,
  loading = false,
  icon,
  style,
  textStyle,
  disabled = false,
  type = "primary",
  size = "medium",
}: ButtonProps) {
  const colors = useThemeColors();

  const getBackgroundColor = () => {
    if (disabled) return colors.BORDER;
    switch (type) {
      case "primary": return colors.GOLD;
      case "secondary": return colors.PRIMARY;
      case "danger": return colors.RED;
      default: return colors.GOLD;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.MUTED_TEXT;
    switch (type) {
      case "primary": return colors.BLACK;
      case "secondary": return colors.BACKGROUND;
      case "danger": return colors.WHITE;
      default: return colors.BLACK;
    }
  };

  const getButtonPadding = () => {
    switch (size) {
      case "small": return { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 };
      case "large": return { paddingVertical: 22, paddingHorizontal: 32, borderRadius: 20 };
      default: return { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "small": return 13;
      case "large": return 18;
      default: return 15;
    }
  };

  const getLetterSpacing = () => {
    switch (size) {
      case "small": return 0.5;
      case "large": return 2;
      default: return 0.8;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getButtonPadding(),
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && (
            <Ionicons 
              name={icon} 
              size={size === "small" ? 14 : 18} 
              color={getTextColor()} 
              style={styles.icon} 
            />
          )}
          <Text style={[
            styles.text, 
            { color: getTextColor(), fontSize: getFontSize(), letterSpacing: getLetterSpacing() }, 
            textStyle
          ]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: "outfitBold",
    textAlign: "center",
  },
  icon: {
    marginRight: 8,
  },
});
