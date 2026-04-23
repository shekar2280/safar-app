import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
  ToastAndroid,
} from "react-native";
import { Image } from "expo-image";
import React, { useState, useEffect } from "react";
import { Colors } from "@/src/constants/colors";
import { LOGO } from "@/src/constants/images";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { LinearGradient } from "expo-linear-gradient";
import { syncUserWithBackend } from "@/src/lib/api";

const { height, width } = Dimensions.get("window");

function showToast(message: string) {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert("", message);
  }
}

function getGoogleSignin() {
  try {
    return require("@react-native-google-signin/google-signin").GoogleSignin;
  } catch {
    return null;
  }
}

export default function Login() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const GoogleSignin = getGoogleSignin();
    if (!GoogleSignin) return;
    GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });
  }, []);

  const handleStart = async () => {
    await AsyncStorage.setItem("seenLogin", "true");
    router.push("/auth/sign-in" as any);
  };

  const onContinueWithGoogle = async () => {
    const GoogleSignin = getGoogleSignin();
    if (!GoogleSignin) {
      showToast("Google Sign-In is currently unavailable in this version.");
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
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseToken = await userCredential.user.getIdToken();
      await AsyncStorage.setItem("seenLogin", "true");
      await syncUserWithBackend(firebaseToken);
      router.replace("/mytrip" as any);
    } catch (error: any) {
      const msg =
        error?.code === "auth/invalid-credential"
          ? "Invalid credentials"
          : error?.message ?? "Google Sign-In failed.";
      showToast(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ImageBackground
        source={{ uri: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1774696616/login2_rtocxo.jpg" }}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.85)"]}
          style={[styles.gradientOverlay, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}
        >
          <StatusBar style="dark" />
          <View style={styles.content}>
            <View style={styles.centerHeroSection}>
              <View style={styles.logoGlassFrame}>
                <Image
                  source={LOGO}
                  style={styles.logoImage}
                  contentFit="cover"
                />
              </View>
              <Text style={styles.brandTitle}>Safar</Text>
              <Text style={styles.brandSubtitle}>If You Never Go,</Text>
              <Text style={styles.brandSubtitle}>You Will Never Know</Text>
            </View>

            <View style={styles.bottomButtonsSection}>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={onContinueWithGoogle}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <ActivityIndicator size="small" color={Colors.WHITE} />
                  ) : (
                    <>
                      <Ionicons name="logo-google" size={20} color={Colors.WHITE} style={styles.buttonIcon} />
                      <Text style={styles.primaryButtonText}>Continue with Google</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={handleStart}>
                  <Text style={styles.secondaryButtonText}>Get Started</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  bgImage: { flex: 1, width: "100%", height: "100%" },
  gradientOverlay: {
    flex: 1,
    paddingHorizontal: width * 0.08,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  centerHeroSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: height * 0.05,
  },
  brandTitle: {
    fontFamily: "outfitBold",
    fontSize: width * 0.12,
    color: Colors.WHITE,
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    marginTop: 5,
  },
  brandSubtitle: {
    fontFamily: "outfit",
    fontSize: width * 0.045,
    color: Colors.SECONDARY,
    marginTop: 0,
    letterSpacing: 1,
  },
   logoGlassFrame: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 2.5,
    borderColor: Colors.GOLD,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    overflow: "hidden",
  },
  logoImage: {
    width: 190,
    height: 190,
  },
  bottomButtonsSection: {
    width: "100%",
    paddingBottom: 20,
  },
  buttonContainer: { gap: height * 0.02 },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: height * 0.065,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  buttonIcon: { marginRight: 10 },
  primaryButtonText: { fontFamily: "outfitMedium", fontSize: width * 0.045, color: Colors.WHITE },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: height * 0.065,
    borderRadius: 16,
    backgroundColor: Colors.WHITE,
    gap: 8,
  },
  secondaryButtonText: { fontFamily: "outfitMedium", fontSize: width * 0.045, color: Colors.PRIMARY },
});
