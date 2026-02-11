import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";
import { Colors } from "../../constants/Colors";
import { useUser } from "../../context/UserContext";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1770733460/profile_unrdpd.jpg";

export default function Profile() {
  const auth = getAuth();
  const router = useRouter();
  const { userProfile, setUserProfile } = useUser();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.fullName || "");
    }
  }, [userProfile]);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (password && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const updatedData = { ...userProfile, fullName: name };
      await setDoc(
        doc(db, "users", user.uid),
        { fullName: name },
        { merge: true },
      );
      setUserProfile(updatedData);
      await AsyncStorage.setItem(
        `profile_${user.uid}`,
        JSON.stringify(updatedData),
      );

      if (password) {
        await updatePassword(user, password);
      } 
      setPassword("");
      setConfirmPassword("");
      Alert.alert("Success", "Profile Updated");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem("seenLogin");
      setUserProfile(null);
      router.replace("auth/Login");
    } catch (e) {
      Alert.alert("Logout Error", e.message);
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!currentPassword || !user) {
      Alert.alert("Error", "Password required to confirm deletion.");
      return;
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
      setShowDeleteModal(false);
      router.replace("auth/Login");

      Alert.alert("Account Deleted", "Your account and all associated data have been removed.");
    } catch (e) {
      console.error("Deletion Error:", e);
      Alert.alert("Error", "Verification failed. Please check your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.deleteIcon}
          onPress={() => setShowDeleteModal(true)}
        >
          <Ionicons name="trash-outline" size={24} color="#FF4444" />
        </TouchableOpacity>

        <View style={styles.imageWrapper}>
          <Image source={{ uri: DEFAULT_AVATAR }} style={styles.profileImage} />
          <View style={styles.activeBadge} />
        </View>

        <Text style={styles.userName}>{name || "Explorer"}</Text>
        <Text style={styles.userEmail}>{auth.currentUser?.email}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subHeading}>PERSONAL DETAILS</Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={20}
            color={Colors.PRIMARY}
            style={styles.inputIcon}
          />
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Full Name"
          />
        </View>

        <Text style={[styles.subHeading, { marginTop: 10 }]}>SECURITY</Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={Colors.PRIMARY}
            style={styles.inputIcon}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholder="New Password"
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={Colors.PRIMARY}
            style={styles.inputIcon}
          />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.WHITE} />
          ) : (
            <Text style={styles.primaryBtnText}>SAVE SETTINGS</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleLogout}>
          <Text style={styles.secondaryBtnText}>SIGN OUT</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Terminate Account</Text>
            <Text style={styles.modalSub}>
              This action is permanent and will delete all your saved trips.
              Enter password to proceed.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Confirm Password"
              secureTextEntry
              onChangeText={setCurrentPassword}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setShowDeleteModal(false);
                  setCurrentPassword("");
                }}
                disabled={loading}
              >
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteConfirmBtn, loading && { opacity: 0.7 }]}
                onPress={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.WHITE} size="small" />
                ) : (
                  <Text style={styles.deleteConfirmText}>DELETE</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.WHITE },
  header: {
    backgroundColor: Colors.PRIMARY,
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: "center",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  deleteIcon: { position: "absolute", top: 50, right: 30 },
  imageWrapper: {
    padding: 1,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.WHITE,
    marginBottom: 15,
  },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  activeBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#00FF00",
    borderWidth: 3,
    borderColor: Colors.PRIMARY,
  },
  userName: {
    fontSize: 26,
    fontFamily: "outfitBold",
    color: Colors.WHITE,
    letterSpacing: 1,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: "outfit",
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
  content: { paddingHorizontal: 30, paddingVertical: 30 },
  subHeading: {
    fontSize: 12,
    fontFamily: "outfitBold",
    color: Colors.PRIMARY,
    letterSpacing: 2,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderColor: "#E0E0E0",
    marginBottom: 15,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "outfit",
    color: Colors.PRIMARY,
  },
  primaryBtn: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
    elevation: 5,
  },
  primaryBtnText: {
    color: Colors.WHITE,
    fontSize: 14,
    fontFamily: "outfitBold",
    letterSpacing: 2,
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: Colors.PRIMARY,
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  secondaryBtnText: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontFamily: "outfitBold",
    letterSpacing: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 25,
  },
  modalContent: {
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
    padding: 30,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "outfitBold",
    color: "#000",
    marginBottom: 10,
  },
  modalSub: {
    fontSize: 14,
    fontFamily: "outfit",
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 25,
    fontFamily: "outfit",
  },
  modalActions: { flexDirection: "row", gap: 15 },
  cancelBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  cancelText: { fontFamily: "outfitBold", color: "#666" },
  deleteConfirmBtn: {
    flex: 1,
    backgroundColor: "#FF4444",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
  },
  deleteConfirmText: { color: Colors.WHITE, fontFamily: "outfitBold" },
});
