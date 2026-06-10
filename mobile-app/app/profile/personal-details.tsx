import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Button from "@/src/components/common/Button";
import { useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, useThemeColors } from "@/src/constants/colors";
import { useTheme } from "@/src/context/ThemeContext";
import { useUser } from "@/src/context/UserContext";
import { updateUserProfile, USER_KEY } from "@/src/lib/api";
import SafarAlert from "@/src/components/ui/SafarAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { getAuth } from "firebase/auth";

export default function PersonalDetails() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = getAuth();
  const { userProfile, setUserProfile } = useUser();
  const colors = useThemeColors();
  const { isDark } = useTheme();

  const [name, setName] = useState(userProfile?.fullName || "");
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "info" | "error" | "confirm";
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.fullName || "");
    }
  }, [userProfile]);

  const showAlert = (title: string, message: string, type: "error" | "info" = "info") => {
    setAlertConfig({ visible: true, title, message, type });
  };



  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (!name.trim()) return showAlert("Validation Error", "Name cannot be empty.", "error");

    setLoading(true);
    try {
      await setDoc(doc(db, "users", user.uid), { fullName: name }, { merge: true });

      const updatedUser = await updateUserProfile({
        full_name: name,
      });

      const updatedProfile = { 
        ...userProfile!, 
        fullName: name, 
        isNameCustom: true, 
        ...updatedUser 
      };
      
      setUserProfile(updatedProfile);

      const rawUser = {
        full_name: name,
        is_name_custom: true,
        email: userProfile?.email,
        firebase_uid: user.uid,
        photo_url: userProfile?.photoURL
      };
      
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(rawUser));
      
      showAlert("Profile Updated", "Your personal details have been saved successfully.");
      setTimeout(() => router.back(), 1500);
    } catch (e: any) {
      showAlert("Update Failed", e.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "PERSONAL DETAILS",
          headerTitleStyle: { fontFamily: "playfairBold", fontSize: 18, color: colors.TEXT },
          headerTransparent: true,
          headerTintColor: colors.TEXT,
          headerStyle: { backgroundColor: "transparent" },
        }}
      />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 70 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerInfo}>
            <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>Identity Info</Text>
            <Text style={[styles.sectionDesc, { color: colors.MUTED_TEXT }]}>Update your public profile details.</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.SURFACE }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.MUTED_TEXT }]}>FULL NAME</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.025)", borderColor: colors.BORDER }]}>
                <Ionicons name="person-outline" size={20} color={colors.TEXT} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.TEXT }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.GRAY}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.MUTED_TEXT }]}>EMAIL ADDRESS (READ-ONLY)</Text>
                <View style={[styles.inputWrapper, { backgroundColor: isDark ? "rgba(255,255,255,0.02)" : colors.SURFACE_LIGHT, borderColor: "transparent" }]}>
                    <Ionicons name="mail-outline" size={20} color={colors.GRAY} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, { color: colors.GRAY }]}
                        value={auth.currentUser?.email || ""}
                        editable={false}
                    />
                </View>
            </View>
          </View>

          <Button
            title="SAVE CHANGES"
            onPress={handleSave}
            loading={loading}
            style={{ marginTop: 10 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <SafarAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })}
        onCancel={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingVertical: 25, paddingHorizontal: 10, paddingBottom: 50 },
  headerInfo: { marginBottom: 30 },
  sectionTitle: {
    fontFamily: "playfairBold",
    fontSize: 24,
    marginBottom: 8,
  },
  sectionDesc: {
    fontFamily: "outfit",
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontFamily: "outfitBold",
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontFamily: "outfitMedium",
    fontSize: 16,
  },
  detectBtn: {
    padding: 10,
    marginLeft: 5,
  },
});
