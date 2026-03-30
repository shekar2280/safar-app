import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigation, useRouter, useFocusEffect } from "expo-router";
import { Colors } from "@/src/constants/colors";
import { CreateTripContext } from "@/src/context/CreateTripContext";
import { Ionicons } from "@expo/vector-icons";
import LocationPicker from "@/src/components/trip/LocationPicker";
import DestinationPicker from "@/src/components/trip/DestinationPicker";
import TripTypeToggle from "@/src/components/trip/TripTypeToggle";
import { SelectBudgetOptions } from "@/src/constants/travel-data";
import { Calendar } from "react-native-calendars";
import dayjs from "dayjs";
import SafarAlert from "@/src/components/ui/SafarAlert";
import { LocationData, DestinationData, TravelerGroup, BudgetOption, TripType } from "@/src/types/interfaces";

const { width, height } = Dimensions.get("window");
const MAX_RANGE_DAYS = 5;

const getTravelerObject = (count: number): TravelerGroup => {
  if (count === 1) return { id: 1, title: "Just Me", desc: "A solo traveler on a personal journey", people: "1" };
  if (count === 2) return { id: 2, title: "Couple", desc: "Two people traveling together", people: "2" };
  if (count >= 3 && count <= 5) return { id: 3, title: "Family", desc: "A family trip with parents and kids", people: "3 to 5" };
  return { id: 4, title: "Friends", desc: "A fun trip with friends", people: "5+" };
};

export default function CreateTripIndex() {
  const navigation = useNavigation();
  const router = useRouter();
  const context = useContext(CreateTripContext);
  if (!context) return null;
  const { setTripData } = context;

  const [departure, setDeparture] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState<DestinationData | null>(null);
  const [tripType, setTripType] = useState<TripType>(TripType.Oneway);
  const [travelerCount, setTravelerCount] = useState(1);
  const [budget, setBudget] = useState<BudgetOption | null>(null);

  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "",
      headerTintColor: Colors.PRIMARY,
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      setTripData({});
    }, [])
  );

  const onDayPress = (day: any) => {
    const { dateString } = day;
    if (!startDate || (startDate && endDate)) {
      setStartDate(dateString);
      setEndDate(null);
    } else if (dayjs(dateString).isAfter(dayjs(startDate))) {
      const rangeLength = dayjs(dateString).diff(dayjs(startDate), "day") + 1;
      if (rangeLength > MAX_RANGE_DAYS) {
        Alert.alert("Range Limit", `You can select up to ${MAX_RANGE_DAYS} days.`);
        return;
      }
      setEndDate(dateString);
    } else {
      setStartDate(dateString);
      setEndDate(null);
    }
  };

  const getMarkedDates = () => {
    const marked: any = {};
    if (startDate) {
      marked[startDate] = { selected: true, startingDay: true, color: Colors.PRIMARY, textColor: "white" };
      if (endDate) {
        let current = dayjs(startDate);
        const end = dayjs(endDate);
        while (current.isBefore(end) || current.isSame(end, "day")) {
          const dateString = current.format("YYYY-MM-DD");
          if (dateString !== startDate && dateString !== endDate) {
            marked[dateString] = { color: Colors.PRIMARY, textColor: "white" };
          }
          current = current.add(1, "day");
        }
        marked[endDate] = { selected: true, endingDay: true, color: Colors.PRIMARY, textColor: "white" };
      }
    }
    return marked;
  };

  const handleGenerateTrip = () => {
    const missing: string[] = [];
    if (!departure) missing.push("Departure");
    if (!destination) missing.push("Destination");
    if (!startDate) missing.push("Start Date");
    if (!endDate) missing.push("End Date");
    if (!budget) missing.push("Budget");

    if (missing.length > 0) {
      setAlertMessage(`Please complete the following: ${missing.join(", ")}`);
      setAlertVisible(true);
      return;
    }

    const departureCode = departure?.countryCode?.toLowerCase();
    const destinationCode = destination?.countryCode?.toLowerCase();
    const isIntl = departureCode && destinationCode ? departureCode !== destinationCode : false;
    const totalDays = dayjs(endDate).diff(dayjs(startDate), "day") + 1;
    const travelerGroup = getTravelerObject(travelerCount);

    setTripData({
      departureInfo: departure,
      destinationInfo: destination,
      tripType: tripType,
      isInternational: isIntl,
      startDate: startDate,
      endDate: endDate,
      totalDays: totalDays,
      traveler: travelerGroup,
      budget: budget!.title,
    });
    router.push("/create-trip/generate-trip" as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>Plan Your Trip</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TripTypeToggle selectedType={tripType} onSelectType={setTripType} />

        <View style={styles.journeySection}>
            <LocationPicker
              placeholder="Leaving from..."
              onLocationChange={setDeparture}
            />
            <View style={styles.spacing} />
            <DestinationPicker
              placeholder="Going to..."
              onLocationSelect={setDestination}
            />
        </View>

        <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>DATES</Text>
            <TouchableOpacity 
                style={styles.actionBox} 
                activeOpacity={0.8}
                onPress={() => setCalendarVisible(true)}
            >
                <View style={styles.boxInner}>
                    <Text style={[styles.boxValue, !startDate && styles.placeholderText]}>
                        {startDate ? dayjs(startDate).format("DD MMM") : "Start"}
                    </Text>
                    <Ionicons name="arrow-forward-outline" size={14} color={Colors.GRAY} />
                    <Text style={[styles.boxValue, !endDate && styles.placeholderText]}>
                        {endDate ? dayjs(endDate).format("DD MMM") : "End"}
                    </Text>
                </View>
                <Ionicons name="calendar-outline" size={20} color={Colors.SECONDARY} />
            </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>GUESTS</Text>
            <View style={styles.stepperBox}>
                <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setTravelerCount((p) => Math.max(1, p - 1))}
                    activeOpacity={0.7}
                >
                    <Ionicons name="remove-outline" size={22} color={Colors.PRIMARY} />
                </TouchableOpacity>

                <View style={styles.stepperValueNode}>
                    <Text style={styles.stepperValue}>{travelerCount}</Text>
                    <Text style={styles.stepperSub}>{travelerCount === 1 ? "EXPLORER" : "EXPLORERS"}</Text>
                </View>

                <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setTravelerCount((p) => Math.min(20, p + 1))}
                    activeOpacity={0.7}
                >
                    <Ionicons name="add-outline" size={22} color={Colors.PRIMARY} />
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>BUDGET</Text>
            <View style={styles.budgetRow}>
                {SelectBudgetOptions.map((item) => {
                    const isSelected = budget?.id === item.id;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            activeOpacity={0.9}
                            style={[
                                styles.budgetPill,
                                isSelected && styles.budgetPillSelected
                            ]}
                            onPress={() => setBudget(item)}
                        >
                            <Text style={[styles.budgetPillText, isSelected && styles.budgetPillTextSelected]}>
                                {item.title}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.generateBtn} onPress={handleGenerateTrip}>
          <Text style={styles.generateBtnText}>CREATE TRIP</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isCalendarVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Dates</Text>
                    <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                        <Ionicons name="close" size={28} color={Colors.PRIMARY} />
                    </TouchableOpacity>
                </View>
                <Calendar
                    minDate={dayjs().format("YYYY-MM-DD")}
                    onDayPress={onDayPress}
                    markedDates={getMarkedDates()}
                    markingType="period"
                    theme={{
                        todayTextColor: Colors.SECONDARY,
                        selectedDayBackgroundColor: Colors.PRIMARY,
                        textDayHeaderFontFamily: "outfitBold",
                        textMonthFontFamily: "outfitBold",
                        textDayFontFamily: "outfit",
                    }}
                />
                <TouchableOpacity
                    style={styles.modalBtn}
                    onPress={() => setCalendarVisible(false)}
                >
                    <Text style={styles.modalBtnText}>CONFIRM DATES</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      <SafarAlert
        visible={alertVisible}
        title="Missing Details"
        message={alertMessage}
        type="error"
        confirmText="Got it"
        onConfirm={() => setAlertVisible(false)}
        onCancel={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BACKGROUND },
  mainTitle: {
    fontFamily: "outfitBold",
    fontSize: 34,
    color: Colors.PRIMARY,
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.08,
    marginBottom: 5,
  },
  scrollContent: { paddingHorizontal: width * 0.05, paddingBottom: 150 },
  journeySection: { marginTop: 25, marginBottom: 30 },
  spacing: { height: 15 },
  formSection: { marginBottom: 25 },
  sectionLabel: {
    fontFamily: "outfitBold",
    fontSize: 10,
    color: Colors.MUTED_TEXT,
    letterSpacing: 2.5,
    marginBottom: 12,
  },
  actionBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.035)",
    height: 65,
    borderRadius: 22,
    paddingHorizontal: 20,
  },
  boxInner: { flexDirection: "row", alignItems: "center", gap: 15 },
  boxValue: { fontFamily: "outfitBold", fontSize: 18, color: Colors.PRIMARY },
  placeholderText: { color: Colors.GRAY, fontFamily: "outfit" },
  stepperBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.035)",
    height: 75,
    borderRadius: 22,
    paddingHorizontal: 12,
  },
  stepperBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.WHITE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  stepperValueNode: { alignItems: "center" },
  stepperValue: { fontFamily: "outfitBold", fontSize: 26, color: Colors.PRIMARY, lineHeight: 30 },
  stepperSub: {
    fontFamily: "outfitBold",
    fontSize: 9,
    color: Colors.SECONDARY,
    letterSpacing: 1.5,
  },
  budgetRow: { flexDirection: "row", gap: 10 },
  budgetPill: {
    flex: 1,
    height: 55,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.035)",
    alignItems: "center",
    justifyContent: "center",
  },
  budgetPillSelected: { backgroundColor: Colors.PRIMARY },
  budgetPillText: { fontFamily: "outfitBold", fontSize: 14, color: Colors.MUTED_TEXT },
  budgetPillTextSelected: { color: Colors.WHITE },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: width * 0.05,
    paddingVertical: 30,
    backgroundColor: "rgba(247,243,240,0.98)",
  },
  generateBtn: {
    backgroundColor: Colors.PRIMARY,
    height: 65,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 6,
  },
  generateBtnText: {
    color: Colors.WHITE,
    fontFamily: "outfitBold",
    fontSize: 15,
    letterSpacing: 3,
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: Colors.SURFACE,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 25,
    paddingBottom: 50,
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontFamily: "outfitBold", fontSize: 22, color: Colors.PRIMARY },
  modalBtn: {
    backgroundColor: Colors.PRIMARY,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },
  modalBtnText: {
    color: Colors.WHITE,
    fontFamily: "outfitBold",
    fontSize: 16,
    letterSpacing: 1,
  },
});
