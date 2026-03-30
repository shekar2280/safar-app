import { Dimensions, ViewStyle, TextStyle } from "react-native";
import { Colors } from "./colors";

const { width } = Dimensions.get("window");

export const Typography: Record<string, TextStyle> = {
  title: {
    fontFamily: "outfitBold",
    fontSize: width * 0.085,
    color: Colors.TEXT,
  },
  h2: {
    fontFamily: "outfitBold",
    fontSize: width * 0.065,
    color: Colors.TEXT,
  },
  sectionTitle: {
    fontFamily: "outfitBold",
    fontSize: width * 0.05,
    color: Colors.TEXT,
  },
  body: {
    fontFamily: "outfit",
    fontSize: width * 0.04,
    color: Colors.TEXT,
  },
  bodyMuted: {
    fontFamily: "outfit",
    fontSize: width * 0.038,
    color: Colors.MUTED_TEXT,
  },
  button: {
    fontFamily: "outfitBold",
    fontSize: width * 0.04,
    letterSpacing: 1.5,
    color: Colors.WHITE,
  },
  label: {
    fontFamily: "outfitMedium",
    fontSize: width * 0.032,
    letterSpacing: 1.5,
    color: Colors.MUTED_TEXT,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const Shadow: Record<string, ViewStyle> = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  soft: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
};
