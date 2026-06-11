import React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_left",
        animationDuration: 500,
      }}
    >
      <Stack.Screen name="Login" />
      <Stack.Screen name="sign-in/index" />
      <Stack.Screen name="sign-up/index" />
    </Stack>
  );
}
