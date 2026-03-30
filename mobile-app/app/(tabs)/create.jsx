import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";

export default function Create() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/create-trip");
  }, []);

  return null;
}
