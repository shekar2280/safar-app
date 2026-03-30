import React from "react";
import { View, Text, Dimensions } from "react-native";
import { Colors } from "@/src/constants/colors";
import { OptionCardProps } from "@/src/types/interfaces";

const { width, height } = Dimensions.get("window");

export default function OptionCard({ option, selectedOption }: OptionCardProps) {
  const isSelected = selectedOption?.id === option?.id;

  return (
    <View
      style={{
        padding: width * 0.06,
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: Colors.LIGHT_GRAY,
        borderWidth: isSelected ? 3 : 0,
        borderColor: Colors.PRIMARY,
        borderRadius: width * 0.04,
        alignItems: "center",
      }}
    >
      <View style={{ flexShrink: 1 }}>
        <Text
          style={{
            fontSize: width * 0.05,
            fontFamily: "outfitBold",
          }}
        >
          {option?.title}
        </Text>
        <Text
          style={{
            fontSize: width * 0.043,
            fontFamily: "outfit",
            color: Colors.GRAY,
            marginTop: height * 0.005,
          }}
        >
          {option?.desc}
        </Text>
      </View>
      {option?.icon && <Text style={{ fontSize: width * 0.06 }}>{option.icon}</Text>}
    </View>
  );
}
