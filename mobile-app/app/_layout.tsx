import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular,
} from "@expo-google-fonts/playfair-display";
import { CreateTripContext } from "@/src/context/CreateTripContext";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ConcertTripProvider } from "@/src/context/ConcertTripContext";
import { TripProvider } from "@/src/context/CommonTripContext";
import { UserProvider } from "@/src/context/UserContext";
import { ActiveTripProvider } from "@/src/context/ActiveTripContext";
import { LocationProvider } from "@/src/context/LocationContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LOCAL_HOTEL_IMAGES } from "@/src/constants/travel-data";
import { Asset } from "expo-asset";
import { Image } from "react-native";
import { TripData } from "@/src/types/interfaces";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    outfit: require("./../assets/fonts/Outfit-Regular.ttf"),
    outfitBold: require("./../assets/fonts/Outfit-Bold.ttf"),
    outfitMedium: require("./../assets/fonts/Outfit-Medium.ttf"),
    playfair: PlayfairDisplay_400Regular,
    playfairBold: PlayfairDisplay_700Bold,
  });

  const [tripData, setTripData] = useState<Partial<TripData>>({});
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      await AsyncStorage.getItem("seenLogin");
    };
    checkStatus();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsSignedIn(!!user);
    });

    return unsubscribe;
  }, []);

  function cacheImages(images: any[]) {
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
      try {
        await Promise.all(cacheImages(LOCAL_HOTEL_IMAGES));
      } catch (e) {
        console.warn("Error caching images", e);
      } finally {
        setAssetsLoaded(true);
      }
    };
    loadAssets();
  }, []);

  if (!fontsLoaded || !assetsLoaded) return null;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <UserProvider>
          <CreateTripContext.Provider value={{ tripData, setTripData }}>
          <ConcertTripProvider>
            <TripProvider>
              <ActiveTripProvider>
                <LocationProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    {!isSignedIn ? (
                      <Stack.Screen name="auth" />
                    ) : (
                      <Stack.Screen name="(tabs)" />
                    )}
                  </Stack>
                </LocationProvider>
              </ActiveTripProvider>
            </TripProvider>
          </ConcertTripProvider>
        </CreateTripContext.Provider>
      </UserProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
