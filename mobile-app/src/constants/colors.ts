const palette = {
  background: "#F7F3F0",
  surface: "#FFFFFF",
  primary: "#1C1C1C",
  secondary: "#E1C16E",
  accent: "#E1C16E",
  text: "#1F2933",
  mutedText: "#6B7280",
  border: "#E0E0E0",
  highlight: "#FFFFFF",
  white: "#FFFFFF",
  black: "#1C1C1C",
  gray: "#9CA3AF",
  lightGray: "#E5E7EB",
  red: "#EF4444",
  gold: "#D4AF37",
  darkSurface:"#121212",
  tabInactive: "rgba(31,41,51,0.6)",
  green: "#34a326ff",
} as const;

export const Colors = {
  BACKGROUND: palette.background,
  SURFACE: palette.surface,
  PRIMARY: palette.primary,
  SECONDARY: palette.secondary,
  ACCENT: palette.accent,
  TEXT: palette.text,
  MUTED_TEXT: palette.mutedText,
  BORDER: palette.border,
  HIGHLIGHT: palette.highlight,
  WHITE: palette.white,
  BLACK: palette.black,
  GRAY: palette.gray,
  LIGHT_GRAY: palette.lightGray,
  BLUE: palette.primary,
  RED: palette.red,
  TAB_INACTIVE: palette.tabInactive,
  GOLD: palette.gold,
  DARK_SURFACE: palette.darkSurface,
  GREEN: palette.green
} as const;

export type ColorKey = keyof typeof Colors;
