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
import { ThemeProvider, useTheme } from "@/src/context/ThemeContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LOCAL_HOTEL_IMAGES, DiscoverIdeasList } from "@/src/constants";
import { Asset } from "expo-asset";
import { Image } from "react-native";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, asyncStoragePersister } from "@/src/lib/queryClient";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { TripData } from "@/src/constants";
import * as Sentry from '@sentry/react-native';
import { ErrorScreen } from "@/src/components/ErrorScreen";
import { OfflineBanner } from "@/src/components/OfflineBanner";

Sentry.init({
  dsn: 'https://1464c657ef53845c8420b0a659df59e6@o4511224422924288.ingest.de.sentry.io/4511224429150288',
  sendDefaultPii: true,
  enableLogs: !__DEV__,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
});

export default Sentry.wrap(function RootLayout() {
  const [fontsLoaded] = useFonts({
    inter: Inter_400Regular,
    interBold: Inter_700Bold,
    interMedium: Inter_500Medium,
    outfit: require("./../assets/fonts/Outfit-Regular.ttf"),
    outfitBold: require("./../assets/fonts/Outfit-Bold.ttf"),
    outfitMedium: require("./../assets/fonts/Outfit-Medium.ttf"),
    playfair: PlayfairDisplay_400Regular,
    playfairBold: PlayfairDisplay_700Bold,
  });

  const [tripData, setTripData] = useState<Partial<TripData>>({});
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
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
        const discoverImages = DiscoverIdeasList.map(item => item.image);
        await Promise.all([
          ...cacheImages(LOCAL_HOTEL_IMAGES),
          ...cacheImages(discoverImages)
        ]);
      } catch (e) {
      } finally {
        setAssetsLoaded(true);
      }
    };
    loadAssets();
  }, []);

  if (!fontsLoaded || !assetsLoaded || isSignedIn === null) return null;

  return (
    <Sentry.ErrorBoundary fallback={ErrorScreen}>
      <ThemeProvider>
        <ThemeAwareApp
          isSignedIn={isSignedIn}
          tripData={tripData}
          setTripData={setTripData}
        />
      </ThemeProvider>
    </Sentry.ErrorBoundary>
  );
});

function ThemeAwareApp({ isSignedIn, tripData, setTripData }: any) {
  const { theme } = useTheme();

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PersistQueryClientProvider 
          client={queryClient}
          persistOptions={{ persister: asyncStoragePersister }}
        >
          <StatusBar style={theme === "dark" ? "light" : "dark"} />
          <LocationProvider>
            <UserProvider>
              <CreateTripContext.Provider value={{ tripData, setTripData }}>
                <ConcertTripProvider>
                  <TripProvider>
                    <ActiveTripProvider>
                      <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        {!isSignedIn ? (
                          <Stack.Screen name="auth" />
                        ) : (
                          <Stack.Screen name="(tabs)" />
                        )}
                      </Stack>
                      <OfflineBanner />
                    </ActiveTripProvider>
                  </TripProvider>
                </ConcertTripProvider>
              </CreateTripContext.Provider>
            </UserProvider>
          </LocationProvider>
        </PersistQueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
