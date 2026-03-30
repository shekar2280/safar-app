import React from "react";
import { Tabs, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "@/src/constants/colors";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");
const iconSize = width * 0.06;
const fabSize = 70;

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: Colors.TAB_INACTIVE,
        tabBarActiveTintColor: Colors.SECONDARY,
        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          left: 14,
          right: 14,
          height: 65,
          margin: 15,
          borderRadius: 32,
          backgroundColor: Colors.SURFACE,
          borderTopWidth: 0.5,
          borderColor: Colors.BORDER,
          paddingBottom: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.08,
          shadowRadius: 24,
          elevation: 8,
          overflow: "visible",
        },
        tabBarLabelStyle: {
          fontFamily: "outfit",
          fontSize: 11,
          fontWeight: "600",
          marginBottom: 6,
        },
        tabBarIconStyle: {
          marginTop: 8,
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
          tabBarLabel: "",
          tabBarButton: () => (
            <View style={styles.fabSlot} pointerEvents="box-none">
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push("/create-trip" as any)}
                style={styles.fab}
              >
                <Ionicons name="add" size={42} color={Colors.BLACK} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="activeTrips"
        options={{
          tabBarLabel: "Active Trips",
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
  fabSlot: {
    width: fabSize,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    width: fabSize,
    height: fabSize,
    borderRadius: fabSize / 2,
    backgroundColor: Colors.SECONDARY,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.BLACK,
    marginTop: -24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
});
