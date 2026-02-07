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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getAuth,
  signOut,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
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

export default function Profile() {
  const auth = getAuth();
  const router = useRouter();
  const { userProfile, setUserProfile } = useUser();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.fullName || "");
      setEmail(auth.currentUser?.email || "");
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
      await setDoc(
        doc(db, "users", user.uid),
        { fullName: name },
        { merge: true },
      );
      setUserProfile({ ...userProfile, fullName: name });
      await AsyncStorage.setItem(
        `profile_${user.uid}`,
        JSON.stringify(updatedProfile),
      );

      if (password) await updatePassword(user, password);

      Alert.alert("Success", "Profile updated");
      setPassword("");
      setConfirmPassword("");
    } catch (e) {
      Alert.alert("Update Failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem("seenLogin");
      router.replace("auth/Login");
    } catch (e) {
      Alert.alert("Logout Error", e.message);
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!currentPassword || !user) {
      Alert.alert("Error", "Password required");
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);

      const tripsQ = query(
        collection(db, "UserTrips"),
        where("userEmail", "==", user.email),
      );
      const snapshot = await getDocs(tripsQ);
      await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));

      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      await AsyncStorage.removeItem("seenLogin");
      router.replace("auth/Login");
    } catch (e) {
      Alert.alert("Error", "Check your password and try again.");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.topActions}>
          <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
            <Ionicons name="trash-outline" size={26} color="#c92c2c" />
          </TouchableOpacity>
        </View>

        <View style={styles.iconCircle}>
          <Ionicons name="person" size={30} color={Colors.WHITE} />
        </View>
        <Text style={styles.userName}>{name || "User"}</Text>
        <Text style={styles.userEmail}>{email}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            value={email}
            editable={false}
            style={[styles.input, styles.disabledInput]}
          />
        </View>

        <Text style={styles.sectionTitle}>Security</Text>

        <TextInput
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholder="New Password"
          secureTextEntry
        />
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          placeholder="Confirm New Password"
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.logOutBtn} onPress={handleLogout}>
          <Text style={styles.logOutBtnText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalSub}>
              Irreversible. Enter password to confirm.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={{ color: Colors.GRAY }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDelete}
                onPress={handleDeleteAccount}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Delete
                </Text>
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
    backgroundColor: "#7772ab",
    paddingTop: 40,
    paddingBottom: 15,
    alignItems: "center",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  topActions: {
    position: "absolute",
    top: 45,
    right: 20,
    flexDirection: "row",
    gap: 18,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  userName: { fontSize: 24, fontWeight: "bold", color: Colors.WHITE },
  userEmail: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  content: { padding: 25 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  inputGroup: { marginBottom: 5 },
  label: { fontSize: 13, color: Colors.GRAY, marginBottom: 4 },
  input: {
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#EEE",
    marginBottom: 10,
  },
  disabledInput: { color: "#999", backgroundColor: "#EBEBEB" },
  saveBtn: {
    backgroundColor: Colors.PRIMARY,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: { color: Colors.WHITE, fontSize: 16, fontWeight: "bold" },
  logOutBtn: {
    backgroundColor: "#ef5b5b",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
  },
  logOutBtnText: { color: Colors.WHITE, fontSize: 16, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 25,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "red",
  },
  modalSub: { color: "#666", marginBottom: 20 },
  modalActions: { flexDirection: "row", gap: 12 },
  modalCancel: {
    flex: 1,
    padding: 15,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
  },
  modalDelete: {
    flex: 1,
    padding: 15,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "red",
  },
});