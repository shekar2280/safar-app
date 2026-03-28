import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";
import { Colors } from "../../constants/Colors";

export default function AuthLayout() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkSeenLogin = async () => {
      const seen = await AsyncStorage.getItem("seenLogin");
      setInitialRoute(seen === "true" ? "sign-in/index" : "Login");
    };
    checkSeenLogin();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.BACKGROUND }}>
        <ActivityIndicator size="large" color={Colors.SECONDARY} />
      </View>
    );
  }

  return (
    <Stack
      initialRouteName={initialRoute}
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
