import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Button from "@/src/components/common/Button";
import { useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, useThemeColors } from "@/src/constants/colors";
import { useTheme } from "@/src/context/ThemeContext";
import { getAuth, updatePassword } from "firebase/auth";
import SafarAlert from "@/src/components/ui/SafarAlert";

export default function Security() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = getAuth();
  const colors = useThemeColors();
  const { isDark } = useTheme();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const showAlert = (title: string, message: string, type: "error" | "info" = "info") => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const handleUpdatePassword = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!password || !confirmPassword) {
      return showAlert("Input Required", "Please fill in all password fields.", "error");
    }
    if (password !== confirmPassword) {
      return showAlert("Password Mismatch", "The passwords you entered do not match.", "error");
    }
    if (password.length < 6) {
      return showAlert("Weak Password", "Password should be at least 6 characters long.", "error");
    }

    setLoading(true);
    try {
      await updatePassword(user, password);
      showAlert("Security Updated", "Your password has been changed successfully.");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => router.back(), 1500);
    } catch (e: any) {
      showAlert("Update Failed", e.message || "Failed to update password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "SECURITY SETTINGS",
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
            <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>Change Password</Text>
            <Text style={[styles.sectionDesc, { color: colors.MUTED_TEXT }]}>Ensure your account is protected by using a strong, unique password.</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.SURFACE }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.MUTED_TEXT }]}>NEW PASSWORD</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.025)", borderColor: colors.BORDER }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.TEXT} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.TEXT }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter new password"
                  placeholderTextColor={colors.GRAY}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.MUTED_TEXT }]}>CONFIRM PASSWORD</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.025)", borderColor: colors.BORDER }]}>
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.TEXT} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.TEXT }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.GRAY}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          <Button
            title="UPDATE PASSWORD"
            onPress={handleUpdatePassword}
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
});
