import { useState, useMemo } from "react";
import { Linking } from "react-native";
import { useActiveTrip } from "@/src/context/ActiveTripContext";
import { auth } from "@/src/lib/firebase";
import { fallbackImages } from "@/src/constants";
import { PlaceItem, SightItem, ExperienceItem, JourneyItem, VisibilityState, LocalExperience } from "@/src/constants";
import { useLocationTracker } from "@/src/hooks/useLocationTracker";
import { getDistance } from "@/src/utils/geoUtils";

export const useDayPlanner = () => {
  const user = auth.currentUser;
  const { activeTrip, toggleVisited, toggleSkipped, finalizeTrip } = useActiveTrip();

  const {
    userLocation,
    showLocationAlert,
    isLocationBlocked,
    loading,
    refreshLocation,
    setShowLocationAlert,
  } = useLocationTracker();

  const [processingIndex, setProcessingIndex] = useState<number | null>(null);
  const [concluding, setConcluding] = useState(false);
  const [showConcludeAlert, setShowConcludeAlert] = useState(false);
  const isFinished = activeTrip?.isFinished || false;

  const effectiveLocation = userLocation;

  const randomFallback = useMemo(() => {
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  }, [activeTrip?.id]);

  const displayImage = useMemo(() => {
    const tripData = activeTrip as any;
    const personalImages = tripData?.concertData?.image_urls || tripData?.concertData?.imageUrl;
    if (Array.isArray(personalImages) && personalImages.length > 0) {
      return { uri: personalImages[0] };
    } else if (typeof personalImages === "string" && personalImages.trim().length > 0) {
      return { uri: personalImages };
    }

    const img = activeTrip?.imageUrl;
    if (Array.isArray(img) && img.length > 0) {
      return { uri: img[2] || img[0] };
    }
    if (typeof img === "string" && img.trim().length > 0) {
      return { uri: img };
    }
    return randomFallback;
  }, [activeTrip?.imageUrl, (activeTrip as any)?.concertData, randomFallback]);

  const sections = useMemo(() => {
    if (!activeTrip?.tripPlan) return { active: [] as JourneyItem[], completed: [] as JourneyItem[] };

    const { dailyItinerary, recommendations } = activeTrip.tripPlan;
    const completedIndices = activeTrip.visitedIndices || [];
    const skippedIndices = activeTrip.skipped_indices || [];

    const rawArray: any[] = Array.isArray(dailyItinerary)
      ? dailyItinerary
      : (dailyItinerary as any)?.places || [];

    const itineraryArray: PlaceItem[] = (rawArray.length > 0 && rawArray[0].places)
      ? rawArray.flatMap((day: any) => day.places || [])
      : rawArray;

    const allSights: SightItem[] = itineraryArray.map((p, idx) => ({
      ...p,
      isLocation: true,
      originalIndex: idx,
      isDone: completedIndices.includes(idx),
      isSkipped: skippedIndices.includes(idx),
      distance: (effectiveLocation && p.geoCoordinates)
        ? getDistance(
          effectiveLocation.latitude,
          effectiveLocation.longitude,
          p.geoCoordinates.latitude,
          p.geoCoordinates.longitude,
        )
        : null,
    }));

    const allExps: ExperienceItem[] = (recommendations?.localExperiences || []).map((e: LocalExperience, idx: number) => ({
      ...e,
      placeName: e.experienceName,
      isDone: false,
      isLocation: false,
    }));

    const sortedSights = [...allSights].sort(
      (a, b) => (a.distance ?? 999) - (b.distance ?? 999),
    );

    const mappedJourney: JourneyItem[] = sortedSights.map((sight, index) => ({
      ...sight,
      activity: allExps[index] || null,
    }));

    const completed = mappedJourney.filter((item) => item.isDone);
    
    let active: JourneyItem[];
    if (isFinished) {
      active = [];
    } else {
      const unvisited = mappedJourney.filter((item) => !item.isDone);
      const normal = unvisited.filter(item => !(item as any).isSkipped);
      const postponed = unvisited.filter(item => (item as any).isSkipped);
      active = [...normal, ...postponed];
    }

    return { active, completed };
  }, [effectiveLocation, activeTrip?.visitedIndices, activeTrip?.skipped_indices, activeTrip?.tripPlan, isFinished]);

  const visibilityMap = useMemo((): VisibilityState[] => {
    return sections.active.map((_, idx) => {
      if (idx === 0) return 'full';
      if (idx === 1) return 'teaser';
      return 'locked';
    });
  }, [sections.active]);

  const lockedCount = useMemo(
    () => sections.active.filter((_, idx) => visibilityMap[idx] === 'locked').length,
    [sections.active, visibilityMap]
  );

  const openNavigation = (placeName: string) => {
    const query = encodeURIComponent(`${placeName} ${activeTrip?.tripPlan?.tripName}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url);
  };

  const findNearbyFood = (placeName: string) => {
    const searchQuery = encodeURIComponent(`Best Restaurants near ${placeName} ${activeTrip?.tripPlan?.tripName || ""}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
    Linking.openURL(url);
  };

  const handleMarkAsDone = async (item: JourneyItem) => {
    if (user && activeTrip) {
      const idx = item.originalIndex;
      setProcessingIndex(idx);
      await toggleVisited(activeTrip.id, idx);
      refreshLocation(true);
      setProcessingIndex(null);
    }
  };

  const handleSkipPlace = async (item: JourneyItem) => {
    if (user && activeTrip) {
      const idx = item.originalIndex;
      setProcessingIndex(idx);
      await toggleSkipped(activeTrip.id, idx);
      refreshLocation(true);
      setProcessingIndex(null);
    }
  };

  const handleConfirmConclude = async () => {
    setShowConcludeAlert(false);
    if (!activeTrip) return;
    setConcluding(true);
    await finalizeTrip(activeTrip.id);
    setConcluding(false);
  };

  return {
    activeTrip,
    isFinished,
    loading,
    effectiveLocation,
    displayImage,
    sections,
    visibilityMap,
    lockedCount,
    processingIndex,
    concluding,
    showConcludeAlert,
    setShowConcludeAlert,
    showLocationAlert,
    setShowLocationAlert,
    isLocationBlocked,
    refreshLocation,
    openNavigation,
    findNearbyFood,
    handleMarkAsDone,
    handleSkipPlace,
    handleConfirmConclude,
  };
};
