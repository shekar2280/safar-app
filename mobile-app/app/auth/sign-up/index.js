import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Colors } from "../../../constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../config/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const OnCreateAccount = () => {
    if (!email || !password || !fullName) {
      ToastAndroid.show("Please enter all details", ToastAndroid.LONG);
      return;
    }
    if (password.length < 8) {
      ToastAndroid.show(
        "Password must be at least 8 characters",
        ToastAndroid.LONG,
      );
      return;
    }

    setLoading(true);
    createUserWithEmailAndPassword(auth, email.trim(), password.trim())
      .then(async (userCredential) => {
        const user = userCredential.user;
        await AsyncStorage.setItem("seenLogin", "true");
        await setDoc(doc(db, "users", user.uid), {
          fullName: fullName.trim(),
          email: email.trim(),
          createdAt: new Date(),
          lastLogin: new Date(),
        });
        router.replace("(tabs)/mytrip");
      })
      .catch((error) => {
        setLoading(false);
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
      });
  };

  return (
    <ImageBackground
      source={{ uri: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774696616/login2_rtocxo.jpg" }}
      style={styles.screen}
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
        style={styles.gradient}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Safar and start your next adventure today.</Text>
          </View>

          <BlurView intensity={40} tint="dark" style={styles.glassCard}>
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.6)" />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  onChangeText={setFullName}
                  value={fullName}
                />
              </View>

              <View style={[styles.inputContainer, { marginTop: 15 }]}>
                <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.6)" />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  value={email}
                />
              </View>

              <View style={[styles.inputContainer, { marginTop: 15 }]}>
                <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.6)" />
                <TextInput
                  secureTextEntry
                  style={styles.input}
                  placeholder="Password (min. 8 chars)"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  onChangeText={setPassword}
                  value={password}
                />
              </View>

              <TouchableOpacity
                style={styles.createBtn}
                onPress={OnCreateAccount}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.PRIMARY} />
                ) : (
                  <Text style={styles.createText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </BlurView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace("auth/sign-in")}>
              <Text style={styles.signInLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: height * 0.08,
    paddingBottom: 40,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  header: {
    marginTop: 30,
    marginBottom: 40,
  },
  title: {
    fontFamily: "outfitBold",
    fontSize: 34,
    color: Colors.WHITE,
  },
  subtitle: {
    fontFamily: "outfit",
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    marginTop: 5,
  },
  glassCard: {
    borderRadius: 24,
    padding: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 60,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontFamily: "outfit",
    fontSize: 16,
    color: Colors.WHITE,
  },
  createBtn: {
    height: 60,
    backgroundColor: Colors.SECONDARY,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    shadowColor: Colors.SECONDARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createText: {
    fontFamily: "outfitBold",
    fontSize: 18,
    color: Colors.PRIMARY,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  footerText: {
    fontFamily: "outfit",
    fontSize: 15,
    color: "rgba(255,255,255,0.6)",
  },
  signInLink: {
    fontFamily: "outfitBold",
    fontSize: 15,
    color: Colors.SECONDARY,
  },
});

