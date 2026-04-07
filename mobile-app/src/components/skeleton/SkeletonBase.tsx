import React from "react";
import { Skeleton } from "moti/skeleton";
import { Colors } from "@/src/constants/colors";

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
  return (
    <Skeleton
      show={show}
      width={width as any}
      height={height as any}
      radius={radius}
      colorMode="light"
      backgroundColor={Colors.SURFACE_LIGHT || "#F3F4F6"}
      transition={{
        type: "timing",
        duration: 1500,
      }}
    />
  );
}
