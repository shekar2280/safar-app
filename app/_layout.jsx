import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { CreateTripContext } from "../context/CreateTripContext";
import { DiscoverTripProvider } from "../context/DiscoverTripContext";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ConcertTripProvider } from "../context/ConcertTripContext";
import { FestiveTripProvider } from "../context/FestiveTripContext";
import { SportsTripProvider } from "../context/SportsTripContext";
import { TrendingTripProvider } from "../context/TrendingTripContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config/FirebaseConfig";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    outfit: require("./../assets/fonts/Outfit-Regular.ttf"),
    outfitBold: require("./../assets/fonts/Outfit-Bold.ttf"),
    outfitMedium: require("./../assets/fonts/Outfit-Medium.ttf"),
  });

  const [tripData, setTripData] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      const seenLogin = await AsyncStorage.getItem("seenLogin");
      setShowLogin(!seenLogin);
    };

    checkStatus();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsSignedIn(!!user); // user exists = logged in
    });

    return unsubscribe;
  }, []);

  if (!fontsLoaded) return null;

  return (
    <CreateTripContext.Provider value={{ tripData, setTripData }}>
      <DiscoverTripProvider>
        <ConcertTripProvider>
          <FestiveTripProvider>
            <SportsTripProvider>
              <TrendingTripProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  {showLogin ? (
                  <Stack.Screen name="auth/Login" />
                ) : !isSignedIn ? (
                  <Stack.Screen name="auth/sign-in/index" />
                ) : (
                  <Stack.Screen name="(tabs)" />
                )}
                {/* <Stack.Screen name="(tabs)" /> */}
                </Stack>
              </TrendingTripProvider>
            </SportsTripProvider>
          </FestiveTripProvider>
        </ConcertTripProvider>
      </DiscoverTripProvider>
    </CreateTripContext.Provider>
  );
}
