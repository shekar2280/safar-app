import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "../../../constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../config/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function SignUp() {
  const navigation = useNavigation();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  const OnCreateAccount = () => {
    if (!email || !password || !fullName) {
      ToastAndroid.show("Please enter all details", ToastAndroid.LONG);
      return;
    }

    if (password.length < 8) {
      ToastAndroid.show(
        "Password must be at least 8 characters",
        ToastAndroid.LONG
      );
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;

        await AsyncStorage.setItem("seenLogin", "true");

        await setDoc(doc(db, "users", user.uid), {
          fullName: fullName,
          email: email,
          createdAt: new Date(),
          lastLogin: new Date(),
        });

        router.replace("(tabs)/mytrip");
      })
      .catch((error) => {
        if (error.code === "auth/email-already-in-use") {
          ToastAndroid.show("Email already in use", ToastAndroid.LONG);
        } else if (error.code === "auth/weak-password") {
          ToastAndroid.show(
            "Password should be at least 6 characters",
            ToastAndroid.LONG
          );
        } else {
          ToastAndroid.show("Something went wrong", ToastAndroid.LONG);
        }
        console.log(error.code, error.message);
      });
  };

  return (
    <View style={styles.screen}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={width * 0.06} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>Create New Account</Text>

      <View style={{ marginTop: height * 0.05 }}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Full Name"
          onChangeText={(value) => setFullName(value)}
        />
      </View>

      <View style={{ marginTop: height * 0.025 }}>
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

      <TouchableOpacity style={styles.createBtn} onPress={OnCreateAccount} disabled={loading}>
        <Text style={styles.createText}>{loading ? "Creating..." : "Create Account"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace("auth/sign-in")}
        style={styles.signInBtn}
      >
        <Text style={styles.signInText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: width * 0.06,
    paddingTop: height * 0.12,
    backgroundColor: Colors.WHITE,
    flex: 1,
  },
  title: {
    fontFamily: "outfitBold",
    fontSize: width * 0.08,
    marginTop: height * 0.03,
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
  createBtn: {
    paddingVertical: height * 0.025,
    backgroundColor: Colors.PRIMARY,
    borderRadius: width * 0.04,
    marginTop: height * 0.06,
  },
  createText: {
    color: Colors.WHITE,
    textAlign: "center",
    fontSize: width * 0.045,
    fontFamily: "outfit",
  },
  signInBtn: {
    paddingVertical: height * 0.025,
    backgroundColor: Colors.WHITE,
    borderRadius: width * 0.04,
    marginTop: height * 0.02,
    borderWidth: 1,
    borderColor: Colors.GRAY,
  },
  signInText: {
    color: Colors.PRIMARY,
    textAlign: "center",
    fontSize: width * 0.045,
    fontFamily: "outfit",
  },
});
