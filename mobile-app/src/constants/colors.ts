import { useTheme } from "./../context/ThemeContext";

const palette = {
  // Light Mode (High Contrast Premium)
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
  // Dark Mode (High Contrast Premium)
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

// Legacy Static Colors (Mostly Light)
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
