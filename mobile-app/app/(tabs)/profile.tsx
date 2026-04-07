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
import { Colors } from "@/src/constants/colors";
import { useUser } from "@/src/context/UserContext";
import SafarAlert from "@/src/components/ui/SafarAlert";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");

export default function Profile() {
  const insets = useSafeAreaInsets();
  const auth = getAuth();
  const router = useRouter();
  const { setUserProfile } = useUser();

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

      await deleteDoc(doc(db, "UserTrips", user.uid));
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);

      await AsyncStorage.removeItem("seenLogin");
      setUserProfile(null);
      setActiveModal("none");
      router.replace("auth/Login" as any);

    } catch (e) {
      console.error("Deletion Error:", e);
      showAlert("Verification Failed", "Incorrect password. Account termination aborted.", "error");
    } finally {
      setLoading(false);
    }
  };

  const MenuItem = ({ icon, title, subtitle, onPress, isDestructive = false }: any) => (
    <TouchableOpacity
      style={[styles.menuItem, isDestructive && styles.destructiveShadow]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconBox}>
        <Ionicons name={icon} size={20} color={isDestructive ? "#EF4444" : Colors.GOLD} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, isDestructive && { color: "#EF4444" }]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.chevronBox}>
        <Ionicons name="chevron-forward" size={16} color={isDestructive ? "#FCA5A5" : Colors.BLACK} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} bounces={true}>
        <View style={[styles.minimalHeader, { paddingTop: insets.top + 20 }]}>
          <View style={styles.logoGlassFrame}>
            <Image
              source={{ uri: "https://res.cloudinary.com/dbjgmxt8h/image/upload/q_auto/f_auto/v1775573387/new_logo5_tnguhv.png" }}
              style={styles.logoImage}
              contentFit="cover"
            />
          </View>
          <Text style={styles.appNameLarge}>SAFAR</Text>
        </View>

        <View style={styles.content}>
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
            <View style={[styles.modalCard, { width: width * 0.9 }]}>
              <View style={styles.dangerIconHeader}>
                <Ionicons name="warning" size={40} color={Colors.RED} />
              </View>

              <Text style={styles.dangerTitleCenter}>Terminate Account</Text>
              <Text style={styles.modalDescCenter}>
                This action is <Text style={{ fontFamily: "outfitBold", color: Colors.RED }}>permanent</Text>.
                All your curated journeys, saved trips, and AI insights will be lost instantly.
              </Text>

              <View style={styles.modalInputWrapper}>
                <Ionicons name="key" size={20} color={Colors.RED} style={styles.modalInputIcon} />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Confirm with Password"
                  secureTextEntry
                  onChangeText={setCurrentPassword}
                  placeholderTextColor="#FCA5A5"
                />
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => {
                    setCurrentPassword("");
                    setActiveModal("none");
                  }}
                  disabled={loading}
                >
                  <Text style={styles.modalCancelBtnText}>KEEP MY DATA</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalDangerBtn}
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
  mainWrapper: { flex: 1, backgroundColor: Colors.BLACK },
  container: { flex: 1 },
  minimalHeader: {
    alignItems: "center",
    paddingBottom: 30,
    backgroundColor: Colors.BLACK,
  },
  logoGlassFrame: {
    width: 100,
    height: 100,
    borderRadius: 54,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 2,
    borderColor: Colors.GOLD,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: Colors.GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    overflow: "hidden",
  },
  logoImage: {
    width: 130,
    height: 130,
  },
  appNameLarge: {
    fontFamily: "playfairBold",
    fontSize: 32,
    color: Colors.GOLD,
    letterSpacing: 12,
    textAlign: "center",
    marginLeft: 12,
  },
  taglineWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 40,
  },
  lineDivider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(212, 175, 55, 0.3)",
    opacity: 0.5,
  },
  taglineText: {
    fontFamily: "outfit",
    fontSize: 10,
    color: Colors.GOLD,
    letterSpacing: 2,
    paddingHorizontal: 15,
    textAlign: "center",
    opacity: 0.8,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: 10,
    paddingTop: 25,
  },
  sectionHeader: {
    fontFamily: "outfitBold",
    fontSize: 11,
    color: Colors.SECONDARY,
    letterSpacing: 2,
    marginBottom: 5,
    marginLeft: 5,
    textTransform: "uppercase",
  },
  menuList: {
    gap: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    backgroundColor: Colors.LIGHT_GRAY,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  destructiveShadow: {
    borderColor: "rgba(239, 68, 68, 0.1)",
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.WHITE,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.05)",
    elevation: 2,
    shadowColor: Colors.GOLD,
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
    color: Colors.PRIMARY,
  },
  menuSubtitle: {
    fontFamily: "outfit",
    fontSize: 12,
    color: Colors.MUTED_TEXT,
    marginTop: 2,
  },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.WHITE,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.05)",
  },
  modalOverlayCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: Colors.WHITE,
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
    color: Colors.RED,
    marginBottom: 10,
  },
  modalDescCenter: {
    fontFamily: "outfit",
    fontSize: 15,
    color: "#64748B",
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
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    width: "100%",
  },
  modalInputIcon: { marginRight: 10 },
  modalInput: {
    flex: 1,
    paddingVertical: 15,
    fontFamily: "outfitBold",
    fontSize: 16,
    color: "#EF4444",
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
    backgroundColor: Colors.LIGHT_GRAY,
    alignItems: "center",
  },
  modalCancelBtnText: {
    fontFamily: "outfitBold",
    fontSize: 12,
    color: Colors.MUTED_TEXT,
    letterSpacing: 1,
  },
  modalDangerBtn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: Colors.RED,
    alignItems: "center",
    elevation: 5,
  },
  modalDangerBtnText: {
    fontFamily: "outfitBold",
    fontSize: 12,
    color: Colors.WHITE,
    letterSpacing: 1,
  },
  versionContainer: {
    alignItems: "center",
    paddingTop: 30,
  },
  versionText: {
    fontFamily: "outfitBold",
    fontSize: 10,
    color: Colors.BORDER,
    letterSpacing: 3,
  },
});