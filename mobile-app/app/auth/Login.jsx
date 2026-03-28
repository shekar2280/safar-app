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
import React, { useState, useEffect } from "react";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../../config/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";

const { height, width } = Dimensions.get("window");

function showToast(message) {
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
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const GoogleSignin = getGoogleSignin();
    if (!GoogleSignin) return;
    GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });
  }, []);

  const handleStart = async () => {
    await AsyncStorage.setItem("seenLogin", "true");
    router.push("/auth/sign-in");
  };

  const onContinueWithGoogle = async () => {
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
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      await AsyncStorage.setItem("seenLogin", "true");
      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email ?? null,
          displayName: user.displayName ?? null,
          photoURL: user.photoURL ?? null,
          lastLogin: new Date(),
        },
        { merge: true },
      );
      router.replace("/mytrip");
    } catch (error) {
      const msg =
        error?.code === "auth/invalid-credential"
          ? "Invalid credentials"
          : "Google Sign-In failed.";
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
          style={styles.gradientOverlay}
        >
          <View style={styles.content}>
            <View style={styles.topSection}>
              <Text style={styles.brandTitle}>Safar</Text>
              <Text style={styles.brandSubtitle}>If You Never Go,</Text>
              <Text style={styles.brandSubtitle}>You Will Never Know</Text>
            </View>

            <View style={styles.bottomSection}>
              <Text style={styles.headline}>Explore the{`\n`}Unexplored</Text>
              <Text style={styles.description}>
                Experience travel like never before. Personalized itineraries, local gems, and seamless planning for your next big adventure.
              </Text>

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
  screen: {
    flex: 1,
  },
  bgImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: width * 0.08,
    paddingTop: height * 0.08,
    paddingBottom: height * 0.06,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  topSection: {
    alignItems: "center",
  },
  brandTitle: {
    fontFamily: "outfitBold",
    fontSize: width * 0.12,
    color: Colors.HIGHLIGHT,
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  brandSubtitle: {
    fontFamily: "outfit",
    fontSize: width * 0.045,
    color: Colors.SECONDARY,
    marginTop: -height * 0.01,
    letterSpacing: 1,
  },
  bottomSection: {
    width: "100%",
  },
  headline: {
    fontFamily: "outfitBold",
    fontSize: width * 0.11,
    color: Colors.WHITE,
    lineHeight: width * 0.12,
    marginBottom: height * 0.015,
  },
  description: {
    fontFamily: "outfit",
    fontSize: width * 0.042,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: width * 0.06,
    marginBottom: height * 0.04,
  },
  buttonContainer: {
    gap: height * 0.02,
  },
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
  buttonIcon: {
    marginRight: 10,
  },
  primaryButtonText: {
    fontFamily: "outfitMedium",
    fontSize: width * 0.045,
    color: Colors.WHITE,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: height * 0.065,
    borderRadius: 16,
    backgroundColor: Colors.WHITE,
    gap: 8,
  },
  secondaryButtonText: {
    fontFamily: "outfitMedium",
    fontSize: width * 0.045,
    color: Colors.PRIMARY,
  },
});

