import { Dimensions, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "./../context/ThemeContext";

const { width } = Dimensions.get("window");

const palette = {
  light: {
    background: "#FFFFFF",
    surface: "#F8FAFC",
    surfaceLight: "#F1F5F9",
    primary: "#000000",
    secondary: "#D4AF37",
    accent: "#D4AF37",
    text: "#000000",
    mutedText: "#64748B",
    border: "#E2E8F0",
    highlight: "#000000",
    white: "#FFFFFF",
    black: "#000000",
    gray: "#94A3B8",
    lightGray: "#F1F5F9",
    red: "#EF4444",
    gold: "#D4AF37",
    goldLight: "#FDF9EC",
    goldMuted: "rgba(212, 175, 55, 0.1)",
    tabBarBackground: "#111111",
    tabBarBorder: "#222222",
    tabInactive: "rgba(255,255,255,0.4)",
    green: "#10B981",
  },
  dark: {
    background: "#000000",
    surface: "#111111",
    surfaceLight: "#1E293B",
    primary: "#FFFFFF",
    secondary: "#D4AF37",
    accent: "#D4AF37",
    text: "#FFFFFF",
    mutedText: "#94A3B8",
    border: "#333333",
    highlight: "#FFFFFF",
    white: "#FFFFFF",
    black: "#000000",
    gray: "#64748B",
    lightGray: "#1E293B",
    red: "#F87171",
    gold: "#D4AF37",
    goldLight: "#2D281D",
    goldMuted: "rgba(212, 175, 55, 0.1)",
    tabBarBackground: "#111111",
    tabBarBorder: "#222222",
    tabInactive: "rgba(255,255,255,0.4)",
    green: "#34D399",
  },
} as const;

export const Colors = {
  BACKGROUND: palette.light.background,
  SURFACE: palette.light.surface,
  SURFACE_LIGHT: palette.light.surfaceLight,
  PRIMARY: palette.light.primary,
  SECONDARY: palette.light.secondary,
  ACCENT: palette.light.accent,
  TEXT: palette.light.text,
  MUTED_TEXT: palette.light.mutedText,
  BORDER: palette.light.border,
  HIGHLIGHT: palette.light.highlight,
  WHITE: palette.light.white,
  BLACK: palette.light.black,
  GRAY: palette.light.gray,
  LIGHT_GRAY: palette.light.lightGray,
  BLUE: palette.light.primary,
  RED: palette.light.red,
  TAB_BAR_BG: palette.light.tabBarBackground,
  TAB_BAR_BORDER: palette.light.tabBarBorder,
  TAB_INACTIVE: palette.light.tabInactive,
  GOLD: palette.light.gold,
  GOLD_LIGHT: palette.light.goldLight,
  GOLD_MUTED: palette.light.goldMuted,
  DARK_SURFACE: "#121212",
  DARK_SURFACE_ALT: "#1E1E1E",
  GREEN: palette.light.green
} as const;

export function useThemeColors() {
  const { theme } = useTheme();
  const colors = theme === "light" ? palette.light : palette.dark;
  
  return {
    BACKGROUND: colors.background,
    SURFACE: colors.surface,
    SURFACE_LIGHT: colors.surfaceLight,
    PRIMARY: colors.primary,
    SECONDARY: colors.secondary,
    ACCENT: colors.accent,
    TEXT: colors.text,
    MUTED_TEXT: colors.mutedText,
    BORDER: colors.border,
    HIGHLIGHT: colors.highlight,
    WHITE: colors.white,
    BLACK: colors.black,
    GRAY: colors.gray,
    LIGHT_GRAY: colors.lightGray,
    BLUE: colors.primary,
    RED: colors.red,
    TAB_BAR_BG: colors.tabBarBackground,
    TAB_BAR_BORDER: colors.tabBarBorder,
    TAB_INACTIVE: colors.tabInactive,
    GOLD: colors.gold,
    GOLD_LIGHT: colors.goldLight,
    GOLD_MUTED: colors.goldMuted,
    GREEN: colors.green,
    isDark: theme === "dark",
  };
}

export type ColorKey = keyof typeof Colors;

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

export const LOADING_STEPS = [
  "Curating Local Secrets",
  "Finding Elite Stays",
  "Mapping Local Hotspots",
  "Analyzing Transit Routes",
  "Gathering Weather Insights",
  "Polishing Bespoke Itinerary"
];
