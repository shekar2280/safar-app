import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ImageBackground,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Colors } from "@/src/constants/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { signInWithEmailAndPassword, signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { syncUserWithBackend } from "@/src/lib/api";

const { height } = Dimensions.get("window");

function showToast(message: string) {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert("", message);
  }
}

function getGoogleSignin() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("@react-native-google-signin/google-signin").GoogleSignin;
  } catch {
    return null;
  }
}

export default function SignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const GoogleSignin = getGoogleSignin();
    if (!GoogleSignin) return;
    GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });
  }, []);

  const onGoogleSignIn = async () => {
    const GoogleSignin = getGoogleSignin();
    if (!GoogleSignin) {
      showToast("Google Sign-In requires a dev build. Rebuild the app (expo prebuild + run:android).");
      return;
    }
    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      if (!signInResult?.data?.user) {
        setGoogleLoading(false);
        return;
      }
      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) {
        showToast("Google Sign-In was cancelled or failed.");
        return;
      }
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      const firebaseToken = await result.user.getIdToken();
      await AsyncStorage.setItem("seenLogin", "true");
      await syncUserWithBackend(firebaseToken);
      router.replace("/mytrip" as any);
    } catch (error: any) {
      const msg = error?.code === "auth/invalid-credential" ? "Invalid credentials" : "Google Sign-In failed.";
      showToast(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const OnSignIn = () => {
    if (!email || !password) {
      showToast("Please enter Email and Password");
      return;
    }

    setLoading(true);
    signInWithEmailAndPassword(auth, email.trim(), password.trim())
      .then(async (userCredential) => {
        const idToken = await userCredential.user.getIdToken();
        await AsyncStorage.setItem("seenLogin", "true");
        await syncUserWithBackend(idToken);
        router.replace("/mytrip" as any);
      })
      .catch((error) => {
        setLoading(false);
        const msg =
          error.code === "auth/invalid-credential"
            ? "Invalid Credentials"
            : "Login Failed";
        showToast(msg);
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey with Safar.</Text>
          </View>

          <BlurView intensity={40} tint="dark" style={styles.glassCard}>
            <View style={styles.form}>
              <View style={styles.inputContainer}>
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
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  onChangeText={setPassword}
                  value={password}
                />
              </View>

              <TouchableOpacity
                style={styles.signInButton}
                onPress={OnSignIn}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.PRIMARY} />
                ) : (
                  <Text style={styles.signInText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={onGoogleSignIn}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator size="small" color={Colors.WHITE} />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={20} color={Colors.WHITE} />
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </BlurView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.replace("auth/sign-up" as any)}>
              <Text style={styles.signUpLink}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  gradient: { ...StyleSheet.absoluteFillObject },
  container: { flex: 1 },
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
  header: { marginTop: 30, marginBottom: 40 },
  title: { fontFamily: "outfitBold", fontSize: 34, color: Colors.WHITE },
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
  form: { width: "100%" },
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
  signInButton: {
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
  signInText: { fontFamily: "outfitBold", fontSize: 18, color: Colors.PRIMARY },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 25 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.15)" },
  dividerText: {
    fontFamily: "outfit",
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    marginHorizontal: 15,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    gap: 12,
  },
  googleButtonText: { fontFamily: "outfitMedium", fontSize: 16, color: Colors.WHITE },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  footerText: { fontFamily: "outfit", fontSize: 15, color: "rgba(255,255,255,0.6)" },
  signUpLink: { fontFamily: "outfitBold", fontSize: 15, color: Colors.SECONDARY },
});
