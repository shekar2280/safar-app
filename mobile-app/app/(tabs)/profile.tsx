import React, { useState, useEffect } from "react";
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
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Colors } from "@/src/constants/colors";
import { useUser } from "@/src/context/UserContext";
import SafarAlert from "@/src/components/ui/SafarAlert";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");

type ModalType = "none" | "personal" | "password" | "terminate";

export default function Profile() {
  const insets = useSafeAreaInsets();
  const auth = getAuth();
  const router = useRouter();
  const { userProfile, setUserProfile } = useUser();
  
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>("none");
  const [logoutVisible, setLogoutVisible] = useState(false);
  
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.fullName || "");
    }
  }, [userProfile]);

  const showAlert = (title: string, message: string, type: "error" | "info" = "info") => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const handleSavePersonal = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (!name.trim()) return showAlert("Validation Error", "Name cannot be empty.", "error");

    setLoading(true);
    try {
      const updatedData = { ...userProfile!, fullName: name };
      await setDoc(doc(db, "users", user.uid), { fullName: name }, { merge: true });
      setUserProfile(updatedData);
      await AsyncStorage.setItem(`profile_${user.uid}`, JSON.stringify(updatedData));
      
      showAlert("Profile Updated", "Your personal details have been saved successfully.");
    } catch (e: any) {
      showAlert("Update Failed", e.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (password !== confirmPassword) {
      return showAlert("Password Mismatch", "The passwords you entered do not match. Please verify.", "error");
    }
    if (password.length < 6) {
      return showAlert("Weak Password", "Password should be at least 6 characters long.", "error");
    }

    setLoading(true);
    try {
      await updatePassword(user, password);
      setPassword("");
      setConfirmPassword("");
      showAlert("Security Updated", "Your password has been changed successfully.");
    } catch (e: any) {
      showAlert("Update Failed", e.message, "error");
    } finally {
      setLoading(false);
    }
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
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIconBox, isDestructive && { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
        <Ionicons name={icon} size={22} color={isDestructive ? '#EF4444' : Colors.PRIMARY} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, isDestructive && { color: '#EF4444' }]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} bounces={false}>
        <LinearGradient
          colors={["#1C1C1C", "#9A7E3D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.headerContent}>
            <Image 
              source={require("@/src/assets/images/icon.png")} 
              style={styles.logoImage} 
              contentFit="contain" 
            />
            <Text style={styles.appName}>SAFAR</Text>
            <Text style={styles.tagline}>Your Premium Travel Companion</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={styles.sectionHeader}>SETTINGS HUB</Text>
          <View style={styles.cardGroup}>
            <MenuItem 
              icon="person-outline" 
              title="Personal Details" 
              subtitle="Name and Email address"
              onPress={() => setActiveModal("personal")} 
            />
            <View style={styles.divider} />
            <MenuItem 
              icon="lock-closed-outline" 
              title="Change Password" 
              subtitle="Keep your account secure"
              onPress={() => setActiveModal("password")} 
            />
            <View style={styles.divider} />
            <MenuItem 
              icon="server-outline" 
              title="Data Credits" 
              subtitle="Manage your AI processing credits"
              onPress={() => router.push("/profile/data-credits" as any)} 
            />
            <View style={styles.divider} />
            <MenuItem 
              icon="log-out-outline" 
              title="Sign Out" 
              subtitle="Securely log out of your session"
              onPress={() => setLogoutVisible(true)} 
            />
             <View style={styles.divider} />
             <MenuItem 
              icon="trash-bin-outline" 
              title="Delete Account" 
              subtitle="Permanently erase your data"
              isDestructive={true}
              onPress={() => setActiveModal("terminate")} 
            />
          </View>
          
          <View style={styles.versionContainer}>
             <Text style={styles.versionText}>v1.0.0</Text>
          </View>
          <View style={{ height: 160 }} />
        </View>
      </ScrollView>

      <Modal visible={activeModal === "personal"} transparent animationType="slide">
        <View style={styles.modalOverlayFull}>
           <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
           <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
              <View style={styles.modalFullContent}>
                 <View style={[styles.modalHeaderFixed, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity onPress={() => setActiveModal("none")} style={styles.backBtn}>
                       <Ionicons name="chevron-back" size={28} color={Colors.PRIMARY} />
                    </TouchableOpacity>
                    <Text style={styles.modalHeaderTitle}>Personal Details</Text>
                    <View style={{ width: 40 }} />
                 </View>
                 
                 <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
                   <View style={styles.headerSpacerModal} />
                   
                   <View style={[styles.card, { borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0, elevation: 0, shadowOpacity: 0 }]}>
                      <View style={styles.cardHeader}>
                         <Ionicons name="person-outline" size={24} color={Colors.PRIMARY} />
                         <Text style={styles.cardTitle}>Identity Information</Text>
                      </View>
                      
                      <View style={styles.inputWrapper}>
                         <Ionicons name="mail" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
                         <TextInput
                           style={[styles.input, { color: "#94A3B8" }]}
                           value={auth.currentUser?.email || ""}
                           editable={false}
                         />
                      </View>

                      <View style={styles.inputWrapper}>
                         <Ionicons name="person" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
                         <TextInput
                           style={styles.input}
                           value={name}
                           onChangeText={setName}
                           placeholder="Full Name"
                           placeholderTextColor="#94A3B8"
                         />
                      </View>

                      <TouchableOpacity style={styles.actionBtn} onPress={handleSavePersonal} disabled={loading}>
                         {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionBtnText}>SAVE CHANGES</Text>}
                      </TouchableOpacity>
                   </View>
                   <View style={styles.modalFooterSpacer} />
                 </ScrollView>
              </View>
           </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={activeModal === "password"} transparent animationType="slide">
        <View style={styles.modalOverlayFull}>
           <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
           <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
              <View style={styles.modalFullContent}>
                 <View style={[styles.modalHeaderFixed, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity onPress={() => { setActiveModal("none"); setPassword(""); setConfirmPassword(""); }} style={styles.backBtn}>
                       <Ionicons name="chevron-back" size={28} color={Colors.PRIMARY} />
                    </TouchableOpacity>
                    <Text style={styles.modalHeaderTitle}>Change Password</Text>
                    <View style={{ width: 40 }} />
                 </View>
                 
                 <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
                   <View style={styles.headerSpacerModal} />
                   
                   <View style={[styles.card, { borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0, elevation: 0, shadowOpacity: 0 }]}>
                      <View style={styles.cardHeader}>
                         <Ionicons name="shield-checkmark-outline" size={24} color={Colors.PRIMARY} />
                         <Text style={styles.cardTitle}>Security Update</Text>
                      </View>
                      
                      <View style={styles.inputWrapper}>
                         <Ionicons name="key-outline" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
                         <TextInput
                           style={styles.input}
                           value={password}
                           onChangeText={setPassword}
                           placeholder="New Password"
                           secureTextEntry
                           placeholderTextColor="#94A3B8"
                         />
                      </View>
                      <View style={styles.inputWrapper}>
                         <Ionicons name="checkmark-circle-outline" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
                         <TextInput
                           style={styles.input}
                           value={confirmPassword}
                           onChangeText={setConfirmPassword}
                           placeholder="Confirm New Password"
                           secureTextEntry
                           placeholderTextColor="#94A3B8"
                         />
                      </View>

                      <TouchableOpacity style={styles.actionBtn} onPress={handleSaveSecurity} disabled={loading}>
                         {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionBtnText}>UPDATE PASSWORD</Text>}
                      </TouchableOpacity>
                   </View>
                   <View style={styles.modalFooterSpacer} />
                 </ScrollView>
              </View>
           </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={activeModal === "terminate"} transparent animationType="fade">
        <View style={styles.modalOverlayCenter}>
           <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
           <View style={[styles.modalCard, { width: width * 0.85 }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.dangerTitle}>Terminate Account</Text>
              </View>
              <Text style={styles.modalDesc}>
                This action is permanent and will delete all your curated journeys and records instantly.
                Enter your password to authorize this action.
              </Text>
              
              <View style={[styles.inputWrapper, { borderColor: "#EF4444" }]}>
                <Ionicons name="key" size={20} color="#EF4444" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Account Password"
                  secureTextEntry
                  onChangeText={setCurrentPassword}
                  placeholderTextColor="#FCA5A5"
                />
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { 
                  setCurrentPassword("");
                  setActiveModal("none");
                }} disabled={loading}>
                  <Text style={styles.cancelBtnText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dangerBtn} onPress={handleDeleteAccount} disabled={loading}>
                   {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.dangerBtnText}>DELETE DATA</Text>}
                </TouchableOpacity>
              </View>
           </View>
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
  mainWrapper: { flex: 1, backgroundColor: "#F8FAFC" },
  container: { flex: 1 },
  headerGradient: {
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    elevation: 10,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  headerContent: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoImage: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  appName: {
    fontFamily: "playfairBold",
    fontSize: 28,
    color: Colors.WHITE,
    letterSpacing: 4,
  },
  tagline: {
    fontFamily: "outfitMedium",
    fontSize: 12,
    color: Colors.GOLD,
    letterSpacing: 1.5,
    marginTop: 2,
    marginBottom: 25,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  sectionHeader: {
    fontFamily: "outfitBold",
    fontSize: 11,
    color: "#64748B",
    letterSpacing: 2,
    marginBottom: 10,
    marginLeft: 10,
  },
  cardGroup: {
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    backgroundColor: Colors.WHITE,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
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
    color: "#94A3B8",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 70,
  },
  modalOverlayFull: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalFullContent: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalHeaderFixed: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  backBtnText: {
    fontFamily: "outfitMedium",
    fontSize: 16,
    color: Colors.PRIMARY,
  },
  modalHeaderTitle: {
    fontFamily: "playfairBold",
    fontSize: 20,
    color: Colors.PRIMARY,
  },
  modalScrollContent: {
    paddingVertical: 25,
    paddingHorizontal: 0,
    paddingBottom: 120,
  },
  headerSpacerModal: { height: 10 },
  modalFooterSpacer: { height: 40 },
  description: {
    fontFamily: "outfit",
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
    marginBottom: 30,
  },
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: "outfitBold",
    fontSize: 18,
    color: Colors.PRIMARY,
  },
  cardText: {
    fontFamily: "outfit",
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 20,
  },
  modalOverlayCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 24,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontFamily: "playfairBold",
    fontSize: 24,
    color: Colors.PRIMARY,
  },
  dangerTitle: {
    fontFamily: "playfairBold",
    fontSize: 24,
    color: "#EF4444",
  },
  modalDesc: {
    fontFamily: "outfit",
    fontSize: 14,
    color: "#64748B",
    marginBottom: 25,
    lineHeight: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#F8FAFC",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    fontFamily: "outfitMedium",
    fontSize: 16,
    color: Colors.PRIMARY,
  },
  actionBtn: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 10,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  actionBtnText: {
    fontFamily: "outfitBold",
    fontSize: 14,
    color: Colors.WHITE,
    letterSpacing: 1.5,
  },
  dangerBtnOutline: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: "#EF4444",
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    backgroundColor: "rgba(239, 68, 68, 0.05)",
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  cancelBtnText: {
    fontFamily: "outfitBold",
    fontSize: 14,
    color: "#64748B",
  },
  dangerBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  dangerBtnText: {
    fontFamily: "outfitBold",
    fontSize: 14,
    color: Colors.WHITE,
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  versionText: {
    fontFamily: "outfitMedium",
    fontSize: 12,
    color: "#CBD5E1",
    letterSpacing: 2,
  },
});
