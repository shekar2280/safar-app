import { useState, useEffect, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { useUser } from "@/src/context/UserContext";
import { useTrips } from "@/src/hooks/queries/useTrips";
import { useActiveTrip } from "@/src/context/ActiveTripContext";
import { UserTrip, Spending } from "@/src/constants";
import { formatSpendingDate } from "@/src/utils/dateFormatter";
import NetInfo from "@react-native-community/netinfo";
import { Alert } from "react-native";

export const useWallet = () => {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { userProfile } = useUser();
  const { data: userTrips = [] } = useTrips();
  const { activeTrip, updateTripBudget, setActiveTrip, recordSpending: contextRecordSpending } = useActiveTrip();

  const [loading, setLoading] = useState(false);
  const [spendingName, setSpendingName] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [totalBudget, setTotalBudget] = useState(0);
  const [newBudgetInput, setNewBudgetInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasSeenSwipeTip, setHasSeenSwipeTip] = useState(true);
  const [currency, setCurrency] = useState("₹");

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
    const checkSwipeTip = async () => {
      if (!tripId) return;
      const seen = await AsyncStorage.getItem(`seenSwipeTip_${tripId}`);
      setHasSeenSwipeTip(!!seen);
      
      const savedCurrency = await AsyncStorage.getItem(`currency_${tripId}`);
      if (savedCurrency) setCurrency(savedCurrency);
    };
    checkSwipeTip();
  }, [tripId]);

  const dismissSwipeTip = async () => {
    if (!tripId) return;
    await AsyncStorage.setItem(`seenSwipeTip_${tripId}`, "true");
    setHasSeenSwipeTip(true);
  };

  useEffect(() => {
    if (!activeTrip && tripId && userTrips.length > 0) {
      const trip = userTrips.find((t: UserTrip) => t.id === tripId);
      if (trip) {
        setActiveTrip(trip);
      }
    }
  }, [activeTrip, tripId, userTrips]);

  const currentTrip = useMemo(() => {
    if (activeTrip?.id === tripId) return activeTrip;
    return userTrips?.find((t: UserTrip) => t.id === tripId);
  }, [userTrips, tripId, activeTrip]);

  const isFinished = currentTrip?.isFinished || false;

  useEffect(() => {
    if (currentTrip) {
      setTotalBudget(currentTrip.totalBudget || 0);
    }
  }, [currentTrip]);

  const allSpendings = useMemo(() => {
    const archived = (currentTrip?.archivedSpendings || []).map(s => ({
      ...s,
      date: s.date && !s.date.includes('T') ? s.date : formatSpendingDate(s.timestamp)
    }));

    return archived.sort((a, b) => {
      return sortOrder === "desc"
        ? b.timestamp - a.timestamp
        : a.timestamp - b.timestamp;
    });
  }, [currentTrip?.archivedSpendings, sortOrder]);

  const totalSpent = useMemo(() => {
    return allSpendings.reduce((sum, item) => sum + item.amount, 0);
  }, [allSpendings]);

  const remBudget = useMemo(() => totalBudget - totalSpent, [totalBudget, totalSpent]);

  const handleSetBudget = async () => {
    if (isFinished) return;
    if (!tripId || !userProfile) return;
    const newBudget = parseFloat(newBudgetInput);
    if (isNaN(newBudget) || newBudget <= 0) {
      return setAlertConfig({
        visible: true,
        title: "Check Amount",
        message: "Budget values must be positive numeric amounts. Please verify your entry and try again.",
        type: "error",
      });
    }

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected && totalBudget <= 0) {
      return setAlertConfig({
        visible: true,
        title: "Connection Required",
        message: "You need to be connected to a network to set your initial trip budget. Please connect and try again.",
        type: "info",
      });
    }

    try {
      setLoading(true);
      await AsyncStorage.setItem(`currency_${tripId}`, currency);
      await updateTripBudget(tripId, newBudget);
      setNewBudgetInput("");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setAlertConfig({
        visible: true,
        title: "Sync Pending",
        message: "Your budget has been saved locally, but we couldn't sync it with the server. It will sync automatically when you're back online.",
        type: "info",
      });
    }
  };

  const clearAll = () => {
    setSpendingName("");
    setAmountInput("");
  };

  const recordSpending = async () => {
    if (!tripId || !userProfile) return;
    const amount = parseFloat(amountInput);
    if (!spendingName.trim() || isNaN(amount))
      return Alert.alert("Error", "Fill all details.");
    try {
      setIsSaving(true);
      await contextRecordSpending(tripId, {
        name: spendingName.trim(),
        amount,
      });
      clearAll();
      setIsSaving(false);
      setIsFormVisible(false);
    } catch (error) {
      setIsSaving(false);
    }
  };

  const hideForm = () => {
    clearAll();
    setIsFormVisible(false);
  };

  return {
    tripId,
    userProfile,
    currentTrip,
    isFinished,
    loading,
    spendingName,
    setSpendingName,
    amountInput,
    setAmountInput,
    isFormVisible,
    setIsFormVisible,
    sortOrder,
    setSortOrder,
    totalBudget,
    newBudgetInput,
    setNewBudgetInput,
    isSaving,
    hasSeenSwipeTip,
    alertConfig,
    setAlertConfig,
    allSpendings,
    totalSpent,
    remBudget,
    currency,
    setCurrency,
    handleSetBudget,
    recordSpending,
    clearAll,
    hideForm,
    dismissSwipeTip,
  };
};
