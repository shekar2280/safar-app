import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "../../../constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../config/FirebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "../../../context/UserContext";

const { width, height } = Dimensions.get("window");

export default function SignIn() {
  const navigation = useNavigation();
  const router = useRouter();
  const { loadUser } = useUser();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log("No such user document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  const OnSignIn = () => {
    if (!email || !password) {
      ToastAndroid.show("Please enter Email and Password", ToastAndroid.LONG);
      return;
    }
    setLoading(true);

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        await loadUser(user);
        await AsyncStorage.setItem("seenLogin", "true");

        const userData = await fetchUserData(user.uid);

        await setDoc(
          doc(db, "users", user.uid),
          {
            lastLogin: new Date(),
          },
          { merge: true }
        );

        router.replace("/mytrip");
      })
      .catch((error) => {
        setLoading(false);
        if (error.code === "auth/invalid-credential") {
          ToastAndroid.show("Invalid Credentials", ToastAndroid.LONG);
        }
      });
  };

  return (
    <View style={styles.screen}>
      <TouchableOpacity onPress={() => router.replace("auth/Login")}>
        <Ionicons name="arrow-back" size={width * 0.06} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>Let's Sign You In</Text>
      <Text style={styles.subtitle}>Welcome Back</Text>

      <View style={{ marginTop: height * 0.06 }}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Email"
          onChangeText={(value) => setEmail(value)}
        />
      </View>

      <View style={{ marginTop: height * 0.025 }}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          secureTextEntry={true}
          style={styles.input}
          placeholder="Enter Password"
          onChangeText={(value) => setPassword(value)}
        />
      </View>

      <TouchableOpacity
        style={styles.signInButton}
        onPress={OnSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.WHITE} />
        ) : (
          <Text style={styles.signInText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace("auth/sign-up")}
        style={styles.createAccountButton}
      >
        <Text style={styles.createAccountText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: width * 0.06,
    backgroundColor: Colors.WHITE,
    flex: 1,
    paddingTop: height * 0.12,
  },
  title: {
    fontFamily: "outfitBold",
    fontSize: width * 0.08,
    marginTop: height * 0.03,
  },
  subtitle: {
    fontFamily: "outfit",
    fontSize: width * 0.075,
    color: Colors.GRAY,
    marginTop: height * 0.012,
  },
  label: {
    fontFamily: "outfit",
    fontSize: width * 0.045,
    marginBottom: height * 0.005,
  },
  input: {
    padding: height * 0.02,
    borderWidth: 1,
    borderRadius: width * 0.04,
    borderColor: Colors.GRAY,
    fontFamily: "outfit",
    fontSize: width * 0.045,
  },
  signInButton: {
    paddingVertical: height * 0.025,
    backgroundColor: Colors.PRIMARY,
    borderRadius: width * 0.04,
    marginTop: height * 0.06,
  },
  signInText: {
    color: Colors.WHITE,
    textAlign: "center",
    fontSize: width * 0.045,
    fontFamily: "outfit",
  },
  createAccountButton: {
    paddingVertical: height * 0.025,
    backgroundColor: Colors.WHITE,
    borderRadius: width * 0.04,
    marginTop: height * 0.02,
    borderWidth: 1,
    borderColor: Colors.GRAY,
  },
  createAccountText: {
    color: Colors.PRIMARY,
    textAlign: "center",
    fontSize: width * 0.045,
    fontFamily: "outfit",
  },
});
