import { useState, useRef, useEffect } from "react";
import { Animated, View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useThemeColors } from "@/src/constants/colors";
import { TripType } from "@/src/types";
import { TripTypeToggleProps } from "@/src/types";

export default function TripTypeToggle({ selectedType, onSelectType }: TripTypeToggleProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(selectedType === TripType.Oneway ? 0 : 1)).current;
  const colors = useThemeColors();

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: selectedType === TripType.Oneway ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 60,
    }).start();
  }, [selectedType]);

  const buttonWidth = (containerWidth - 8) / 2;

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, buttonWidth > 0 ? buttonWidth : 0],
  });

  return (
    <View
      style={[styles.container, { backgroundColor: colors.SURFACE_LIGHT }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {containerWidth > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            { width: buttonWidth, transform: [{ translateX }], backgroundColor: colors.BACKGROUND, shadowColor: colors.BLACK },
          ]}
        />
      )}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onSelectType(TripType.Oneway)}
        style={styles.button}
      >
        <Text
          style={[
            styles.text,
            { color: selectedType === TripType.Oneway ? colors.TEXT : colors.MUTED_TEXT },
            selectedType === TripType.Oneway ? styles.textActive : styles.textInactive,
          ]}
        >
          One-way
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onSelectType(TripType.Round)}
        style={styles.button}
      >
        <Text
          style={[
            styles.text,
            { color: selectedType === TripType.Round ? colors.TEXT : colors.MUTED_TEXT },
            selectedType === TripType.Round ? styles.textActive : styles.textInactive,
          ]}
        >
          Round Trip
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 25,
    borderRadius: 22,
    padding: 4,
    width: "100%",
    height: 65,
    position: "relative",
    alignItems: "center",
  },
  indicator: {
    position: "absolute",
    top: 4,
    left: 4,
    height: 57,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  button: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  text: { fontSize: 14, letterSpacing: 0.5 },
  textActive: { fontFamily: "outfitBold" },
  textInactive: { fontFamily: "outfitMedium" },
});
