import React, { useRef, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Dimensions, Animated, StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";

export default function TripTypeToggle({ selectedType, onSelectType }) {
  const [containerWidth, setContainerWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(selectedType === "Oneway" ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: selectedType === "Oneway" ? 0 : 1,
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
      style={styles.container}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {containerWidth > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            {
              width: buttonWidth,
              transform: [{ translateX }],
            },
          ]}
        />
      )}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onSelectType("Oneway")}
        style={styles.button}
      >
        <Text
          style={[
            styles.text,
            selectedType === "Oneway" ? styles.textActive : styles.textInactive,
          ]}
        >
          One-way
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onSelectType("Round")}
        style={styles.button}
      >
        <Text
          style={[
            styles.text,
            selectedType === "Round" ? styles.textActive : styles.textInactive,
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
    backgroundColor: "rgba(0,0,0,0.035)",
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
    backgroundColor: Colors.WHITE,
    borderRadius: 18,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
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
  text: {
    fontSize: 14,
    letterSpacing: 0.5,
  },
  textActive: {
    fontFamily: "outfitBold",
    color: Colors.PRIMARY,
  },
  textInactive: {
    fontFamily: "outfitMedium",
    color: Colors.MUTED_TEXT,
  },
});