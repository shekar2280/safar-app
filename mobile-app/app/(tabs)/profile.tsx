import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  getAuth,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";
import {
  doc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Colors, useThemeColors } from "@/src/constants/colors";
import { LOGO } from "@/src/constants/images";
import { useUser } from "@/src/context/UserContext";
import { useTheme } from "@/src/context/ThemeContext";
import SafarAlert from "@/src/components/ui/SafarAlert";
import { BlurView } from "expo-blur";
import { apiDelete } from "@/src/lib/api";

const { width } = Dimensions.get("window");

export default function Profile() {
  const insets = useSafeAreaInsets();
  const auth = getAuth();
  const router = useRouter();
  const { setUserProfile } = useUser();
  const colors = useThemeColors();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<"none" | "terminate">("none");
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

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

  const handleLogoutConfirm = async () => {
    setLogoutVisible(false);
    try {
      await signOut(auth);
      await AsyncStorage.removeItem("seenLogin");
      setUserProfile(null);
      router.replace("auth/Login" as any);
    } catch (e: any) {
      showAlert("Logout Failed", e.message, "error");
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!currentPassword || !user || !user.email) {
      return showAlert("Authentication Required", "Please enter your password to confirm termination.", "error");
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      const tripsCollectionRef = collection(db, "UserTrips", user.uid, "trips");
      const snapshot = await getDocs(tripsCollectionRef);

      const deleteTripsPromises = snapshot.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deleteTripsPromises);

      try {
        await apiDelete("/api/v1/auth/me");
      } catch (err) {
      }

      await deleteDoc(doc(db, "UserTrips", user.uid));
      await deleteDoc(doc(db, "users", user.uid));
      
      await deleteUser(user);

      await AsyncStorage.removeItem("seenLogin");
      setUserProfile(null);
      setActiveModal("none");
      router.replace("auth/Login" as any);

    } catch (e) {
      showAlert("Verification Failed", "Incorrect password. Account termination aborted.", "error");
    } finally {
      setLoading(false);
    }
  };

  const MenuItem = ({ icon, title, subtitle, onPress, isDestructive = false }: any) => (
    <TouchableOpacity
      style={[
        styles.menuItem,
        { backgroundColor: colors.SURFACE, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" },
        isDestructive && styles.destructiveShadow
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconBox, { backgroundColor: isDark ? "#1A1A1A" : Colors.SURFACE }]}>
        <Ionicons name={icon} size={20} color={isDestructive ? "#EF4444" : colors.GOLD} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, { color: colors.TEXT }, isDestructive && { color: "#EF4444" }]}>{title}</Text>
        {subtitle && <Text style={[styles.menuSubtitle, { color: colors.MUTED_TEXT }]}>{subtitle}</Text>}
      </View>
      <View style={[styles.chevronBox, { backgroundColor: isDark ? "#1A1A1A" : colors.SURFACE }]}>
        <Ionicons name="chevron-forward" size={16} color={isDestructive ? "#FCA5A5" : colors.TEXT} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.mainWrapper, { backgroundColor: colors.BACKGROUND }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} bounces={true}>
        <View style={[styles.minimalHeader, { backgroundColor: isDark ? colors.BACKGROUND : colors.BACKGROUND, paddingTop: insets.top + 20 }]}>
          <View style={[styles.logoGlassFrame, { borderColor: colors.BLACK, backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)" }]}>
            <Image
              source={LOGO}
              style={styles.logoImage}
              contentFit="cover"
            />
          </View>
          <Text style={[styles.appNameLarge, { color: colors.GOLD }]}>SAFAR</Text>
          <Text style={[styles.tagline, { color: colors.MUTED_TEXT }]}>BEYOND THE HORIZON AWAITS</Text>
        </View>

        <View style={[styles.content, { backgroundColor: colors.BACKGROUND }]}>
          <View style={styles.menuList}>
            <MenuItem
              icon="person-outline"
              title="Personal Details"
              subtitle="Update your name and home city"
              onPress={() => router.push("/profile/personal-details" as any)}
            />
            <MenuItem
              icon="lock-closed-outline"
              title="Change Password"
              subtitle="Keep your account secure"
              onPress={() => router.push("/profile/security" as any)}
            />
            <MenuItem
              icon="server-outline"
              title="Data Credits"
              subtitle="Manage your AI processing credits"
              onPress={() => router.push("/profile/data-credits" as any)}
            />

            <MenuItem
              icon="trash-outline"
              title="Delete Account"
              subtitle="Permanently erase your data"
              isDestructive={true}
              onPress={() => setActiveModal("terminate")}
            />

            <MenuItem
              icon="log-out-outline"
              title="Sign Out"
              subtitle="Securely log out of your session"
              onPress={() => setLogoutVisible(true)}
            />

          </View>

          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>SAFAR v1.0.0</Text>
          </View>
          <View style={{ height: 160 }} />
        </View>
      </ScrollView>

      <Modal visible={activeModal === "terminate"} transparent animationType="fade">
        <View style={styles.modalOverlayCenter}>
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={[styles.modalCard, { width: width * 0.9, backgroundColor: colors.SURFACE }]}>
              <View style={styles.dangerIconHeader}>
                <Ionicons name="warning" size={40} color={colors.RED} />
              </View>

              <Text style={[styles.dangerTitleCenter, { color: colors.RED }]}>Terminate Account</Text>
              <Text style={[styles.modalDescCenter, { color: colors.MUTED_TEXT }]}>
                This action is <Text style={{ fontFamily: "outfitBold", color: colors.RED }}>permanent</Text>.
                All your curated journeys, saved trips, and AI insights will be lost instantly.
              </Text>

              <View style={[styles.modalInputWrapper, { backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.05)" }]}>
                <Ionicons name="key" size={20} color={colors.RED} style={styles.modalInputIcon} />
                <TextInput
                  style={[styles.modalInput, { color: colors.RED }]}
                  placeholder="Confirm with Password"
                  secureTextEntry
                  onChangeText={setCurrentPassword}
                  placeholderTextColor={isDark ? "#F87171" : "#FCA5A5"}
                />
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { backgroundColor: colors.SURFACE_LIGHT }]}
                  onPress={() => {
                    setCurrentPassword("");
                    setActiveModal("none");
                  }}
                  disabled={loading}
                >
                  <Text style={[styles.modalCancelBtnText, { color: colors.MUTED_TEXT }]}>KEEP MY DATA</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalDangerBtn, { backgroundColor: colors.RED }]}
                  onPress={handleDeleteAccount}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalDangerBtnText}>DELETE</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <SafarAlert
        visible={logoutVisible}
        title="Sign Out"
        message="Are you sure you want to securely exit your session? You will need to log in again to access your journeys."
        type="confirm"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setLogoutVisible(false)}
      />

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
  mainWrapper: { flex: 1 },
  container: { flex: 1 },
  minimalHeader: {
    alignItems: "center",
    paddingBottom: 10,
  },
  logoGlassFrame: {
    width: 120,
    height: 120,
    borderRadius: 65,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    overflow: "hidden",
  },
  logoImage: {
    width: 160,
    height: 160,
  },
  appNameLarge: {
    fontFamily: "playfairBold",
    fontSize: 28,
    letterSpacing: 14,
    textAlign: "center",
    marginLeft: 14,
    marginTop: 10,
  },
  tagline: {
    fontFamily: "outfitBold",
    fontSize: 9,
    letterSpacing: 4,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 25,
  },
  menuList: {
    gap: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  destructiveShadow: {
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: "outfitBold",
    fontSize: 16,
  },
  menuSubtitle: {
    fontFamily: "outfit",
    fontSize: 12,
    marginTop: 2,
  },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  modalOverlayCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    borderRadius: 32,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 25,
  },
  dangerIconHeader: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  dangerTitleCenter: {
    fontFamily: "playfairBold",
    fontSize: 26,
    marginBottom: 10,
  },
  modalDescCenter: {
    fontFamily: "outfit",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 25,
  },
  modalInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FCA5A5",
    borderRadius: 18,
    paddingHorizontal: 15,
    marginBottom: 25,
    width: "100%",
  },
  modalInputIcon: { marginRight: 10 },
  modalInput: {
    flex: 1,
    paddingVertical: 15,
    fontFamily: "outfitBold",
    fontSize: 16,
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 15,
    width: "100%",
  },
  modalCancelBtn: {
    flex: 1.5,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  modalCancelBtnText: {
    fontFamily: "outfitBold",
    fontSize: 12,
    letterSpacing: 1,
  },
  modalDangerBtn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    elevation: 5,
  },
  modalDangerBtnText: {
    fontFamily: "outfitBold",
    fontSize: 12,
    color: "#FFF",
    letterSpacing: 1,
  },
  versionContainer: {
    alignItems: "center",
    paddingTop: 20,
  },
  versionText: {
    fontFamily: "outfitBold",
    fontSize: 10,
    letterSpacing: 3,
  },
});