import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height, width } = Dimensions.get("window");

export default function Login() {
  const router = useRouter();

  const handleStart = async () => {
    await AsyncStorage.setItem("seenLogin", "true");
    router.push("/auth/sign-in");
  };

  return (
    <View style={styles.screen}>
      <Image
        source={{ uri: "https://res.cloudinary.com/dbjgmxt8h/image/upload/v1764932675/login_g095qw.jpg" }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.container}>
        <Text style={styles.title}>Sanchari</Text>
        <Text style={styles.subtitle}>
          Your Trip, Simplified. Plan, organize, and explore — all in one place. Start your next adventure with ease.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  image: {
    width: "100%",
    height: height * 0.65, 
  },
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: width * 0.06, 
    marginTop: -30,
  },
  title: {
    fontSize: width * 0.08, 
    fontFamily: "outfitBold",
    textAlign: "center",
    marginTop: height * 0.01,
  },
  subtitle: {
    fontFamily: "outfit",
    fontSize: width * 0.045,
    textAlign: "center",
    color: Colors.GRAY,
    marginTop: height * 0.015,
  },
  button: {
    paddingVertical: height * 0.02,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 99,
    marginTop: height * 0.06,
    width: "100%",
  },
  buttonText: {
    color: Colors.WHITE,
    textAlign: "center",
    fontFamily: "outfit",
    fontSize: width * 0.045,
  },
});
