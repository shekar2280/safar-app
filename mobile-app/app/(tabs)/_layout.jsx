import React from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "../../constants/Colors";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const iconSize = width * 0.06;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: Colors.GRAY,
        tabBarActiveTintColor: "black",
        tabBarStyle: {
          height: 115, 
          paddingBottom: 20, 
          paddingTop: 5, 
        },
        tabBarLabelStyle: {
          fontSize: width * 0.035,
          fontFamily: "outfit",
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
        name="wallet"
        options={{
          tabBarLabel: "Walllet",
          tabBarIcon: ({ color }) => (
            <Ionicons name="wallet" size={iconSize} color={color} />
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
