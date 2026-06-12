import React from "react";
import { Tabs, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Colors, useThemeColors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS
} from "react-native-reanimated";

const iconSize = 25;
const createIconSize = 35;

export default function TabLayout() {
  const router = useRouter();
  const rotation = useSharedValue(0);
  const colors = useThemeColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  // Dynamically position the tab bar above the home indicator.
  // Minimum 15 so the pill never touches the very bottom edge.
  const tabBarBottom = Math.max(insets.bottom, 15);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const handlePress = () => {
    rotation.value = 0;
    rotation.value = withTiming(360, {
      duration: 700,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    }, (finished) => {
      if (finished) {
        runOnJS(router.push)("/create-trip" as any);
      }
    });
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: colors.TAB_INACTIVE,
        tabBarActiveTintColor: colors.GOLD,
        tabBarStyle: {
          position: "absolute",
          bottom: tabBarBottom,
          left: 16,
          right: 16,
          height: 65,
          margin: 10,
          borderRadius: 44,
          backgroundColor: colors.TAB_BAR_BG,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: colors.TAB_BAR_BORDER,
          paddingBottom: 8,
          paddingTop: 8,
          paddingLeft: 5,
          paddingRight: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.5,
          shadowRadius: 15,
          elevation: 10,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarLabelStyle: {
          fontFamily: "outfit",
          fontSize: 11,
          fontWeight: "700",
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="mytrip"
        options={{
          tabBarLabel: "My Trips",
          tabBarIcon: ({ color }) => (
            <Ionicons name="location-sharp" size={iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          tabBarLabel: "Discover",
          tabBarIcon: ({ color }) => (
            <Ionicons name="compass" size={iconSize} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          tabBarLabel: "Create",
          tabBarButton: () => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handlePress}
              style={styles.createButtonContainer}
            >
              <Animated.View style={[
                styles.createIconWrapper,
                { backgroundColor: colors.GOLD },
                animatedStyle
              ]}>
                <Ionicons name="navigate" size={createIconSize} color={colors.BLACK} />
              </Animated.View>
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="activeTrips"
        options={{
          tabBarLabel: "Active",
          tabBarIcon: ({ color }) => (
            <Ionicons name="rocket" size={iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={iconSize} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  createButtonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  createIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});