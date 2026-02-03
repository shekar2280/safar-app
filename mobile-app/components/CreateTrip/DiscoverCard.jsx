import {
  View,
  Text,
  Dimensions,
  ImageBackground,
  StyleSheet,
} from "react-native";
import React from "react";
import { Colors } from "../../constants/Colors";

const { width, height } = Dimensions.get("window");


export default function DiscoverCard({ option, selectedOption, cardHeight }) {
  const isSelected = selectedOption?.id === option?.id;
  const defaultHeight = height * 0.14;
  const cardRadius = width * 0.04;

  const getImageSource = () => {
    if (option?.image) {
      return typeof option.image === "string"
        ? { uri: option.image }
        : option.image;
    }
    const fallbackIndex = (option?.id || 0) % trendingTripCardImages.length;
    return { uri: trendingTripCardImages[fallbackIndex] };
  };

  return (
    <View
      style={{
        width: "100%",
        height: cardHeight || defaultHeight,
        borderRadius: cardRadius,
        overflow: "hidden",
        borderWidth: isSelected ? 3 : 0,
        borderColor: Colors.PRIMARY,
      }}
    >
      <ImageBackground
        source={getImageSource()}
        resizeMode="cover"
        style={{
          flex: 1,
          justifyContent: "space-between",
          flexDirection: "row",
          padding: width * 0.02,
          alignItems: "center",
        }}
      >
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        />

        <View style={{ flexShrink: 1 }}>
          <Text
            style={{
              fontSize: width * 0.05,
              fontFamily: "outfitBold",
              color: "white",
              textShadowColor: "rgba(0,0,0,0.6)",
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
            }}
          >
            {option?.title}
          </Text>
          <Text
            style={{
              fontSize: width * 0.043,
              fontFamily: "outfit",
              color: "white",
              marginTop: height * 0.005,
              textShadowColor: "rgba(0,0,0,0.6)",
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
            }}
          >
            {option?.desc || option?.festival}
          </Text>
          {option?.Highlights && (
            <Text
              style={{
                fontSize: width * 0.043,
                fontFamily: "outfit",
                color: "white",
                marginTop: height * 0.005,
                textShadowColor: "rgba(0,0,0,0.6)",
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
              }}
            >
              🚀 Experience: {option?.Highlights}
            </Text>
          )}
        </View>

        {option?.icon && (
          <Text
            style={{
              fontSize: width * 0.06,
              color: "white",
              textShadowColor: "rgba(0,0,0,0.6)",
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
            }}
          >
            {option.icon}
          </Text>
        )}
      </ImageBackground>
    </View>
  );
}
