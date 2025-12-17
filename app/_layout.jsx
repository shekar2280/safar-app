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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LOCAL_HOTEL_IMAGES } from "../constants/Options";
import { Asset } from "expo-asset";

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
      setIsSignedIn(!!user);
    });

    return unsubscribe;
  }, []);

  function cacheImages(images) {
    return images.map((image) => {
      if (typeof image === "string") {
        return Image.prefetch(image);
      } else {
        return Asset.fromModule(image).downloadAsync();
      }
    });
  }

  useEffect(() => {
    const loadAssets = async () => {
      await Promise.all(cacheImages(LOCAL_HOTEL_IMAGES));
    };
    loadAssets();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
                  </Stack>
                </TrendingTripProvider>
              </SportsTripProvider>
            </FestiveTripProvider>
          </ConcertTripProvider>
        </DiscoverTripProvider>
      </CreateTripContext.Provider>
    </GestureHandlerRootView>
  );
}
