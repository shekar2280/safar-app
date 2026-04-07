import React, { useState } from "react";
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
import { useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/colors";
import { getAuth, updatePassword } from "firebase/auth";
import SafarAlert from "@/src/components/ui/SafarAlert";

export default function Security() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = getAuth();

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
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "SECURITY SETTINGS",
          headerTitleStyle: { fontFamily: "playfairBold", fontSize: 18, color: Colors.PRIMARY },
          headerTransparent: true,
          headerTintColor: Colors.PRIMARY,
        }}
      />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 70 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerInfo}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <Text style={styles.sectionDesc}>Ensure your account is protected by using a strong, unique password.</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NEW PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter new password"
                  placeholderTextColor={Colors.GRAY}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRM PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="checkmark-circle-outline" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  placeholderTextColor={Colors.GRAY}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleUpdatePassword} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.WHITE} />
            ) : (
              <Text style={styles.saveBtnText}>UPDATE PASSWORD</Text>
            )}
          </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: Colors.WHITE },
  scrollContent: { padding: 25, paddingBottom: 50 },
  headerInfo: { marginBottom: 30 },
  sectionTitle: {
    fontFamily: "playfairBold",
    fontSize: 24,
    color: Colors.PRIMARY,
    marginBottom: 8,
  },
  sectionDesc: {
    fontFamily: "outfit",
    fontSize: 14,
    color: Colors.MUTED_TEXT,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.WHITE,
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
    color: Colors.SECONDARY,
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.025)",
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontFamily: "outfitMedium",
    fontSize: 16,
    color: Colors.PRIMARY,
  },
  saveBtn: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveBtnText: {
    fontFamily: "outfitBold",
    fontSize: 14,
    color: Colors.WHITE,
    letterSpacing: 2,
  },
});
