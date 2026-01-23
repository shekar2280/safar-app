import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  useRouter,
  useNavigation,
  useFocusEffect,
} from "expo-router";
import { Colors } from "../../constants/Colors";
import { Calendar } from "react-native-calendars";
import dayjs from "dayjs";
import { CreateTripContext } from "../../context/CreateTripContext";

const MAX_RANGE_DAYS = 5;
const { width, height } = Dimensions.get("window");

export default function SelectDates() {
  const navigation = useNavigation();
  const router = useRouter();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [calendarKey, setCalendarKey] = useState(0);
  const { tripData, setTripData } = useContext(CreateTripContext);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: " ",
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      setStartDate(null);
      setEndDate(null);
      setCalendarKey(prevKey => prevKey + 1);

      setTripData(prev => ({
        ...prev,
        startDate: null,
        endDate: null,
        totalDays: null,
      }));
    }, [])
  );

  const governmentHolidays = [
  "2025-01-26", // Republic Day
  "2025-08-15", // Independence Day
  "2025-10-02", // Gandhi Jayanti
  "2025-12-25", // Christmas
];


  const onDayPress = (day) => {
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
    const marked = {};
    if (startDate) {
      marked[startDate] = {
        selected: true,
        startingDay: true,
        color: "black",
        textColor: "white",
      };

      if (endDate) {
        let current = dayjs(startDate);
        const end = dayjs(endDate);

        while (current.isBefore(end) || current.isSame(end, "day")) {
          const dateString = current.format("YYYY-MM-DD");
          if (dateString !== startDate && dateString !== endDate) {
            marked[dateString] = {
              color: "black",
              textColor: "white",
            };
          }
          current = current.add(1, "day");
        }

        marked[endDate] = {
          selected: true,
          endingDay: true,
          color: "black",
          textColor: "white",
        };
      }

      governmentHolidays.forEach((holiday) => {
    if (!marked[holiday]) {
      marked[holiday] = { marked: true, dotColor: "red", textColor: "red" }; 
    } else {
      // If already selected in range, you can add a dot
      marked[holiday].marked = true;
      marked[holiday].dotColor = "red";
    }
  });
    }
    return marked;
  };

  const OnDatesSelection = () => {
    if (!startDate || !endDate) {
      Alert.alert("Incomplete Selection", "Please select both start and end dates.");
      return;
    }

    const totalDays = dayjs(endDate).diff(dayjs(startDate), "day") + 1;

    setTripData((prev) => ({
      ...prev,
      startDate,
      endDate,
      totalDays,
    }));

    router.push("/create-trip/select-budget");
  };

  return (
    <View
      style={{
        padding: width * 0.06,
        paddingTop: height * 0.12,
        backgroundColor: Colors.WHITE,
        flex: 1,
      }}
    >
      <Text
        style={{
          fontSize: width * 0.085,
          fontFamily: "outfitBold",
          marginTop: height * 0.02,
        }}
      >
        Travel Dates
      </Text>

      <View style={{ marginTop: height * 0.025 }}>
        <Calendar
          key={calendarKey}
          minDate={dayjs().format("YYYY-MM-DD")}
          onDayPress={onDayPress}
          markedDates={getMarkedDates()}
          markingType="period"
          theme={{
            textSectionTitleColor: Colors.GRAY,
            dayTextColor: "black",
            todayTextColor: Colors.PRIMARY,
            selectedDayBackgroundColor: Colors.PRIMARY,
            selectedDayTextColor: Colors.WHITE,
            dotColor: Colors.PRIMARY,
            arrowColor: Colors.PRIMARY,
            monthTextColor: Colors.PRIMARY,
            textMonthFontFamily: "outfitBold",
            textDayHeaderFontFamily: "outfitMedium",
            textDayFontFamily: "outfitRegular",
            textMonthFontSize: width * 0.045, // ~18
            textDayHeaderFontSize: width * 0.035, // ~14
            textDayFontSize: width * 0.04, // ~16
            textDisabledColor: Colors.GRAY,
          }}
          disableAllTouchEventsForDisabledDays
        />
        {startDate && endDate && (
          <Text
            style={{
              marginTop: height * 0.015,
              fontFamily: "outfitMedium",
              color: Colors.GRAY,
              fontSize: width * 0.04,
            }}
          >
            Selected: {startDate} to {endDate} (
            {dayjs(endDate).diff(dayjs(startDate), "day") + 1} days)
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={OnDatesSelection}
        style={{
          paddingVertical: height * 0.02,
          backgroundColor: Colors.PRIMARY,
          borderRadius: width * 0.04,
          marginTop: height * 0.06,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            color: Colors.WHITE,
            fontFamily: "outfitMedium",
            fontSize: width * 0.05,
          }}
        >
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}
