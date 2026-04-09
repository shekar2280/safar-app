import React from "react";
import { ViewStyle } from "react-native";
import { ActionButtonProps } from "@/src/types/interfaces";
import Button from "../common/Button";

export const ActionButton = ({ title, onPress, disabled, styleOverride = {} }: ActionButtonProps) => (
  <Button
    title={typeof title === "string" ? title : "Action"}
    onPress={onPress}
    disabled={disabled}
    style={styleOverride as ViewStyle}
  />
);
