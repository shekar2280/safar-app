import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Modal,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Colors } from "../../constants/Colors";
import { Image } from "expo-image";
import {
  deleteUser,
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

export default function Profile() {
  const [profilePic, setProfilePic] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false); 

  const auth = getAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setEmail(user.email);

        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.fullName || "");
            if (data.profilePic) setProfilePic({ uri: data.profilePic });
          }
        } catch (error) {
          console.log("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (password && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          fullName: name,
          email: email,
        },
        { merge: true }
      );

      if (password) {
        await updatePassword(user, password);
      }

      Alert.alert("Success", "Profile updated!");
    } catch (error) {
      console.log("Error updating profile:", error);
      Alert.alert("Error", "Could not update profile");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await signOut(auth);
            await AsyncStorage.removeItem("seenLogin");
            router.replace("auth/Login");
          } catch (error) {
            console.log("Logout error:", error);
          }
        },
      },
    ]);
  };

  const deleteUserTrips = async (userEmail) => {
    const tripsRef = collection(db, "UserTrips");
    const q = query(tripsRef, where("userEmail", "==", userEmail));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
  };

  const handleDeleteAccount = async () => {
    if (!currentPassword) {
      Alert.alert("Error", "Please enter your password.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      await deleteUserTrips(user.email);
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);

      await AsyncStorage.removeItem("seenLogin");
      router.replace("auth/Login");

      Alert.alert("Account Deleted", "Your account has been successfully deleted.");
    } catch (error) {
      console.log("Delete error:", error);
      Alert.alert("Error", "Could not delete account. Please try again.");
    } finally {
      setShowDeleteModal(false);
      setCurrentPassword("");
    }
  };

  const handleChangeProfilePic = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Please allow access to your photos.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "Images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setProfilePic({ uri: imageUri });

      try {
        const storage = getStorage();
        const user = auth.currentUser;
        if (!user) return;

        const response = await fetch(imageUri);
        const blob = await response.blob();

        const storageRef = ref(storage, `profilePics/${user.uid}.jpg`);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        await setDoc(
          doc(db, "users", user.uid),
          { profilePic: downloadURL },
          { merge: true }
        );

        Alert.alert("Success", "Profile picture updated!");
      } catch (error) {
        console.log("Upload error:", error);
        Alert.alert("Error", "Failed to upload profile picture.");
      }
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.WHITE }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          backgroundColor: "#7772abff",
          height: height * 0.25,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
          overflow: "hidden",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {profilePic ? (
          <Image
            source={profilePic}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 3,
              borderColor: Colors.WHITE,
            }}
          />
        ) : (
          <LottieView
            source={require("../../assets/animations/travel.json")}
            autoPlay
            loop
            style={{ width: 180, height: 180 }}
          />
        )}
      </View>

      <View style={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "600",
            color: Colors.PRIMARY,
            textAlign: "center",
            marginVertical: 10,
          }}
        >
          {name || "Your Name"}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: Colors.GRAY,
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          {email}
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full Name"
          style={styles.input}
        />
        <TextInput
          value={email}
          editable={false}
          placeholder="Email"
          style={[styles.input, { backgroundColor: "#f5f5f5" }]}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="New Password"
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm Password"
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: "red" }]}
          onPress={() => setShowDeleteModal(true)}
        >
          <Text style={styles.logoutText}>Delete Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Account Deletion</Text>
            <Text style={styles.modalSubtitle}>
              Enter your password to permanently delete your account.
            </Text>

            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Password"
              secureTextEntry
              style={styles.input}
            />

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.GRAY }]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setCurrentPassword("");
                }}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "red" }]}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.modalBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: Colors.GRAY,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    fontSize: 15,
    width: "100%",
  },
  saveBtn: {
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  saveText: { color: Colors.WHITE, fontSize: 16, fontWeight: "600" },
  logoutBtn: {
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  logoutText: { color: Colors.WHITE, fontSize: 16, fontWeight: "600" },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.PRIMARY,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "red",
    textAlign: "center",
    marginBottom: 15,
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalBtnText: {
    color: Colors.WHITE,
    fontSize: 15,
    fontWeight: "600",
  },
};
