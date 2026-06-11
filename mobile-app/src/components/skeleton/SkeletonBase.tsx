import React from "react";
import { Skeleton } from "moti/skeleton";
import { useThemeColors } from "@/src/constants/colors";
import { useTheme } from "@/src/context/ThemeContext";

interface SkeletonBaseProps {
  width?: string | number;
  height?: string | number;
  radius?: number;
  show?: boolean;
}

export default function SkeletonBase({ 
  width = "100%", 
  height = 20, 
  radius = 8, 
  show = true 
}: SkeletonBaseProps) {
  const colors = useThemeColors();
  const { theme } = useTheme();

  return (
    <Skeleton
      show={show}
      width={width as any}
      height={height as any}
      radius={radius}
      colorMode={theme as "light" | "dark"}
      colors={
        theme === "dark"
          ? [colors.SURFACE, colors.SURFACE_LIGHT, colors.SURFACE]
          : [colors.SURFACE_LIGHT, colors.WHITE, colors.SURFACE_LIGHT]
      }
      transition={{
        type: "timing",
        duration: 1500,
      }}
    />
  );
}
