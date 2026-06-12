import { useState, useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useUser } from "@/src/context/UserContext";
import { useTrips, useActivateTrip } from "@/src/hooks/queries/useTrips";
import { useActiveTrip } from "@/src/context/ActiveTripContext";
import { useQueryClient } from "@tanstack/react-query";
import { tripQueryKeys } from "@/src/hooks/queries/useTrips";
import { fallbackImages } from "@/src/constants";
import { UserTrip } from "@/src/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { ActiveTripCacheManager } from "@/src/utils/activeTripCache";

const { width } = Dimensions.get("window");

export const useTripDetails = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { data: userTrips = [], isLoading: loadingTrips } = useTrips();
  const activateTripMutation = useActivateTrip();
  const { tripId, trip, imageUrl } = useLocalSearchParams();
  const { toggleVisited, deactivateTrip } = useActiveTrip();
  const queryClient = useQueryClient();

  const [isAnimating, setIsAnimating] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [confirmActivateVisible, setConfirmActivateVisible] = useState(false);
  const [activeTripInContext, setActiveTripInContext] = useState<UserTrip | null>(null);
  const [isCacheExpired, setIsCacheExpired] = useState(false);
  const [cachedActiveTrip, setCachedActiveTrip] = useState<any | null>(null);

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

  const tripDetails = useMemo(() => {
    if (tripId) {
      const idStr = String(tripId);
      return (userTrips || []).find(t => String(t.id) === idStr) || {};
    }
    try {
      const parsed = typeof trip === "string" ? JSON.parse(trip) : trip;
      if (parsed?.id) {
        return (userTrips || []).find(t => String(t.id) === String(parsed.id)) || parsed;
      }
      return parsed || {};
    } catch (e) {
      return {};
    }
  }, [tripId, trip, userTrips]);

  const mergedTripDetails = useMemo(() => {
    const isActive = tripDetails?.isActive || (activeTripInContext && String(activeTripInContext.id) === String(tripDetails?.id));
    if (isActive && !tripDetails?.tripPlan && cachedActiveTrip?.tripPlan) {
      return { ...tripDetails, ...cachedActiveTrip };
    }
    return tripDetails;
  }, [tripDetails, cachedActiveTrip, activeTripInContext]);

  useEffect(() => {
    const loadCachedActive = async () => {
      const isActive = tripDetails?.isActive || (activeTripInContext && String(activeTripInContext.id) === String(tripDetails?.id));
      if (isActive && !tripDetails?.tripPlan) {
        const cached = await ActiveTripCacheManager.get();
        if (cached && String(cached.id) === String(tripDetails.id)) {
          setCachedActiveTrip(cached);
        }
      }
    };
    loadCachedActive();
  }, [tripDetails, activeTripInContext]);

  useEffect(() => {
    if (mergedTripDetails?.id && mergedTripDetails?.isActive && mergedTripDetails?.tripPlan) {
      ActiveTripCacheManager.save(mergedTripDetails);
    }
  }, [mergedTripDetails]);

  const transportData = useMemo(
    () => ({
      tripType: mergedTripDetails?.travelerMode || "travel",
      departureIata: mergedTripDetails?.departureIata || (mergedTripDetails?.tripPlan as any)?.departureIata,
      destinationIata: mergedTripDetails?.tripPlan?.destinationIata,
      bestTransport: mergedTripDetails?.tripPlan?.bestTransport,
      weatherInsight: mergedTripDetails?.concertData ? undefined : mergedTripDetails?.tripPlan?.weatherInsight,
    }),
    [mergedTripDetails]
  );

  useEffect(() => {
    const current = (userTrips || []).find(t => t.isActive);
    setActiveTripInContext(current || null);
  }, [userTrips]);

  useEffect(() => {
    if (mergedTripDetails?.id && mergedTripDetails?.tripPlan?.adjustedDurationReason) {
      const key = `shown-duration-adjustment-${mergedTripDetails.id}`;
      AsyncStorage.getItem(key).then(val => {
        if (!val) {
          setAlertConfig({
            visible: true,
            title: "Itinerary Optimized",
            message: mergedTripDetails.tripPlan.adjustedDurationReason,
            type: "info",
          });
          AsyncStorage.setItem(key, "true");
        }
      });
    }
  }, [mergedTripDetails]);

  useEffect(() => {
    const checkCacheExpiration = async () => {
      if (!mergedTripDetails?.id || !mergedTripDetails?.isActive) return;
      
      const netState = await NetInfo.fetch();
      const timestampKey = `@ACTIVE_TRIP_CACHED_AT_${mergedTripDetails.id}`;

      if (netState.isConnected) {
        await AsyncStorage.setItem(timestampKey, Date.now().toString());
        setIsCacheExpired(false);
      } else {
        const cachedAtStr = await AsyncStorage.getItem(timestampKey);
        if (cachedAtStr) {
          const cachedAt = parseInt(cachedAtStr);
          if (Date.now() - cachedAt > 7 * 24 * 60 * 60 * 1000) {
            setIsCacheExpired(true);
          } else {
            setIsCacheExpired(false);
          }
        } else {
          setIsCacheExpired(true);
        }
      }
    };

    checkCacheExpiration();
  }, [mergedTripDetails]);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex((prev) => (prev !== index ? index : prev));
  };

  const executeActivation = async () => {
    if (!mergedTripDetails.id) return;
    setConfirmActivateVisible(false);
    try {
      setIsAnimating(true);
      
      const timestampKey = `@ACTIVE_TRIP_CACHED_AT_${mergedTripDetails.id}`;
      await AsyncStorage.setItem(timestampKey, Date.now().toString());
      setIsCacheExpired(false);

      if (mergedTripDetails.tripPlan) {
        await ActiveTripCacheManager.save(mergedTripDetails);
      }

      activateTripMutation.mutate(mergedTripDetails.id);

      setTimeout(() => {
        setIsAnimating(false);
        router.push({
          pathname: "/activeTrips" as any,
          params: {
            tripId: mergedTripDetails.id,
            totalDays: mergedTripDetails.totalDays ?? 1
          },
        });
      }, 600);
    } catch {
      setIsAnimating(false);
      setAlertConfig({
        visible: true,
        title: "Activation Failed",
        message: "We encountered an error while initializing your journey. Please ensure you have a stable connection and try once more.",
        type: "error",
      });
    }
  };

  const handleActivateTrip = async () => {
    if (!mergedTripDetails.id) return;
    if (activeTripInContext && activeTripInContext.id !== mergedTripDetails.id) {
      setConfirmActivateVisible(true);
      return;
    }
    executeActivation();
  };

  const images = useMemo(() => {
    const personalImages = mergedTripDetails?.concertData?.image_urls;
    if (personalImages && Array.isArray(personalImages) && personalImages.length > 0) {
      return personalImages.map((img: string) => ({ uri: img }));
    }

    const legacyImg = (mergedTripDetails as any)?.imageUrl;
    if (Array.isArray(legacyImg) && legacyImg.length > 0) return legacyImg.map((img: string) => ({ uri: img }));
    if (typeof legacyImg === "string" && legacyImg.trim().length > 0) return [{ uri: legacyImg }];

    const aiImages = mergedTripDetails?.tripPlan?.imageUrl || (mergedTripDetails as any)?.savedTrip?.image_urls;
    if (Array.isArray(aiImages) && aiImages.length > 0) {
      return aiImages.map((img: string) => ({ uri: img }));
    }

    if (imageUrl) return [{ uri: imageUrl as string }];

    const randomFallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    return [{ uri: randomFallback }];
  }, [mergedTripDetails, imageUrl]);

  const isPlanMissing = useMemo(() => {
    if (!mergedTripDetails?.concertData && !mergedTripDetails?.tripPlan) return true;
    if (mergedTripDetails?.isActive && isCacheExpired) return true;
    return false;
  }, [mergedTripDetails, isCacheExpired]);

  return {
    tripDetails: mergedTripDetails,
    isAnimating,
    activeIndex,
    confirmActivateVisible,
    setConfirmActivateVisible,
    activeTripInContext,
    alertConfig,
    setAlertConfig,
    isInitializing: loadingTrips && !mergedTripDetails?.tripPlan,
    isPlanMissing,
    images,
    handleScroll,
    handleActivateTrip,
    executeActivation,
    deactivateTrip,
    toggleVisited,
  };
};
