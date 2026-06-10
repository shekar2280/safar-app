import { useState, useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useUser } from "@/src/context/UserContext";
import { useTrips } from "@/src/hooks/queries/useTrips";
import { useStaticItinerary } from "@/src/hooks/queries/useStaticItinerary";
import { useActiveTrip } from "@/src/context/ActiveTripContext";
import { useQueryClient } from "@tanstack/react-query";
import { tripQueryKeys } from "@/src/hooks/queries/useTrips";
import { apiPatch } from "@/src/lib/api";
import { fallbackImages } from "@/src/constants";
import { UserTrip } from "@/src/constants";

const { width } = Dimensions.get("window");

export const useTripDetails = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { data: userTrips = [] } = useTrips();
  const { trip, imageUrl } = useLocalSearchParams();
  const { toggleVisited, deactivateTrip } = useActiveTrip();
  const queryClient = useQueryClient();

  const [isAnimating, setIsAnimating] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [confirmActivateVisible, setConfirmActivateVisible] = useState(false);
  const [activeTripInContext, setActiveTripInContext] = useState<UserTrip | null>(null);

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

  const parsedTrip = useMemo(() => {
    try {
      return typeof trip === "string" ? JSON.parse(trip) : trip;
    } catch (e) {
      return {};
    }
  }, [trip]);

  const { data: staticData, isLoading: loadingStaticData } = useStaticItinerary(parsedTrip?.savedTripId);

  const tripDetails = useMemo(() => {
    const latestFromCache = (userTrips || []).find(t => t.id === parsedTrip?.id);
    const base = latestFromCache || parsedTrip || {};

    if (!staticData) return base;
    return {
      ...base,
      tripPlan: staticData.trip_plan,
      image_urls: (staticData.image_urls?.length > 0) ? staticData.image_urls : base.image_urls,
    };
  }, [parsedTrip, staticData, userTrips]);

  const transportData = useMemo(
    () => ({
      tripType: tripDetails?.travelerMode || "travel",
      departureIata: tripDetails?.departureIata || (tripDetails?.tripPlan as any)?.departureIata,
      destinationIata: tripDetails?.tripPlan?.destinationIata,
      bestTransport: tripDetails?.tripPlan?.bestTransport,
      weatherInsight: tripDetails?.concertData ? undefined : tripDetails?.tripPlan?.weatherInsight,
    }),
    [tripDetails]
  );

  useEffect(() => {
    const current = (userTrips || []).find(t => t.isActive);
    setActiveTripInContext(current || null);
  }, [userTrips]);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  const executeActivation = async () => {
    if (!tripDetails.id) return;
    setConfirmActivateVisible(false);
    try {
      setIsAnimating(true);
      await apiPatch(`/api/v1/trips/${tripDetails.id}/activate`, {});
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
      setTimeout(() => {
        setIsAnimating(false);
        router.push({
          pathname: "/activeTrips" as any,
          params: {
            tripId: tripDetails.id,
            totalDays: tripDetails.totalDays ?? 1
          },
        });
      }, 3000);
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
    if (!tripDetails.id) return;
    if (activeTripInContext && activeTripInContext.id !== tripDetails.id) {
      setConfirmActivateVisible(true);
      return;
    }
    executeActivation();
  };

  const images = useMemo(() => {
    const personalImages = tripDetails?.concertData?.image_urls;
    if (personalImages && Array.isArray(personalImages) && personalImages.length > 0) {
      return personalImages.map((img: string) => ({ uri: img }));
    }

    const legacyImg = (tripDetails as any)?.imageUrl;
    if (Array.isArray(legacyImg) && legacyImg.length > 0) return legacyImg.map((img: string) => ({ uri: img }));
    if (typeof legacyImg === "string" && legacyImg.trim().length > 0) return [{ uri: legacyImg }];

    const aiImages = tripDetails?.tripPlan?.imageUrl || (tripDetails as any)?.savedTrip?.image_urls;
    if (Array.isArray(aiImages) && aiImages.length > 0) {
      return aiImages.map((img: string) => ({ uri: img }));
    }

    if (imageUrl) return [{ uri: imageUrl as string }];

    const randomFallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    return [{ uri: randomFallback }];
  }, [tripDetails, imageUrl]);

  return {
    tripDetails,
    isAnimating,
    activeIndex,
    confirmActivateVisible,
    setConfirmActivateVisible,
    activeTripInContext,
    alertConfig,
    setAlertConfig,
    loadingStaticData,
    isInitializing: loadingStaticData && !tripDetails?.tripPlan,
    images,
    handleScroll,
    handleActivateTrip,
    executeActivation,
    deactivateTrip,
    toggleVisited,
  };
};
