import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/colors";
import { useUser } from "@/src/context/UserContext";
import { updateUserProfile } from "@/src/lib/api";
import * as Location from "expo-location";
import SafarAlert from "@/src/components/ui/SafarAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { getAuth } from "firebase/auth";

export default function PersonalDetails() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = getAuth();
  const { userProfile, setUserProfile } = useUser();

  const [name, setName] = useState(userProfile?.fullName || "");
  const [homeLocation, setHomeLocation] = useState<any>(userProfile?.homeLocation || null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "info" | "error" | "confirm";
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.fullName || "");
      setHomeLocation(userProfile.homeLocation || null);
    }
  }, [userProfile]);

  const showAlert = (title: string, message: string, type: "error" | "info" = "info") => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const detectLocation = async () => {
    setDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showAlert("Permission Denied", "Location permission is required to detect your home city.", "error");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const city = address.city || address.name || "Unknown City";
        const locData = {
          name: city,
          label: `${city}${address.region ? ", " + address.region : ""}`,
          fullAddress: `${address.name ? address.name + ", " : ""}${address.city ? address.city + ", " : ""}${address.region ? address.region + ", " : ""}${address.country || ""}`,
          country: address.country || "",
          countryCode: address.isoCountryCode || "",
          coordinates: {
            lat: location.coords.latitude,
            lon: location.coords.longitude
          }
        };
        setHomeLocation(locData);
        showAlert("Location Detected", `Identified your home location as ${city}.`);
      }
    } catch (e: any) {
      showAlert("Detection Error", e.message || "Failed to detect location", "error");
    } finally {
      setDetecting(false);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (!name.trim()) return showAlert("Validation Error", "Name cannot be empty.", "error");

    setLoading(true);
    try {
      // 1. Update Firebase
      await setDoc(doc(db, "users", user.uid), { fullName: name }, { merge: true });
      
      // 2. Update Backend API
      const updatedUser = await updateUserProfile({
        full_name: name,
        home_location: homeLocation
      });

      // 3. Update local state
      const updatedProfile = { 
        ...userProfile!, 
        fullName: name, 
        homeLocation: homeLocation,
        ...updatedUser 
      };
      
      setUserProfile(updatedProfile);
      await AsyncStorage.setItem(`profile_${user.uid}`, JSON.stringify(updatedProfile));
      
      showAlert("Profile Updated", "Your personal details have been saved successfully.");
      setTimeout(() => router.back(), 1500);
    } catch (e: any) {
      showAlert("Update Failed", e.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "PERSONAL DETAILS",
          headerTitleStyle: { fontFamily: "playfairBold", fontSize: 18, color: Colors.PRIMARY },
          headerTransparent: true,
          headerTintColor: Colors.PRIMARY,
        }}
      />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 70 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerInfo}>
            <Text style={styles.sectionTitle}>Identity Info</Text>
            <Text style={styles.sectionDesc}>Update your public profile and home city for personalized trip suggestions.</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={Colors.GRAY}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>EMAIL ADDRESS (READ-ONLY)</Text>
                <View style={[styles.inputWrapper, { backgroundColor: Colors.LIGHT_GRAY, borderColor: "transparent" }]}>
                    <Ionicons name="mail-outline" size={20} color={Colors.GRAY} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, { color: Colors.GRAY }]}
                        value={auth.currentUser?.email || ""}
                        editable={false}
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>HOME LOCATION</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="home-outline" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={homeLocation?.label || ""}
                  editable={false}
                  placeholder="Not set"
                  placeholderTextColor={Colors.GRAY}
                />
                <TouchableOpacity style={styles.detectBtn} onPress={detectLocation} disabled={detecting}>
                  {detecting ? (
                    <ActivityIndicator size="small" color={Colors.PRIMARY} />
                  ) : (
                    <Ionicons name="locate" size={20} color={Colors.PRIMARY} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.WHITE} />
            ) : (
              <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <SafarAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })}
        onCancel={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.WHITE },
  scrollContent: { padding: 25, paddingBottom: 50 },
  headerInfo: { marginBottom: 30 },
  sectionTitle: {
    fontFamily: "playfairBold",
    fontSize: 24,
    color: Colors.PRIMARY,
    marginBottom: 8,
  },
  sectionDesc: {
    fontFamily: "outfit",
    fontSize: 14,
    color: Colors.MUTED_TEXT,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontFamily: "outfitBold",
    fontSize: 10,
    color: Colors.SECONDARY,
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.025)",
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontFamily: "outfitMedium",
    fontSize: 16,
    color: Colors.PRIMARY,
  },
  detectBtn: {
    padding: 10,
    marginLeft: 5,
  },
  saveBtn: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveBtnText: {
    fontFamily: "outfitBold",
    fontSize: 14,
    color: Colors.WHITE,
    letterSpacing: 2,
  },
});
