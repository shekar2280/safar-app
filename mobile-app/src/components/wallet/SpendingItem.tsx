import React from "react";
import { View, Text, StyleSheet, Dimensions, Alert, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SpendingItemProps } from "@/src/constants";
import SafarAlert from "@/src/components/ui/SafarAlert";
import { useThemeColors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { useActiveTrip } from "@/src/context/ActiveTripContext";

const { width } = Dimensions.get("window");
const SWIPE_LIMIT = -width * 0.2;

interface SpendingItemExtendedProps extends SpendingItemProps {
  currency: string;
}

export const SpendingItem = ({ item, tripId, isFinished, currency }: SpendingItemExtendedProps) => {
  const [deleteVisible, setDeleteVisible] = React.useState(false);
  const translateX = useSharedValue(0);
  const colors = useThemeColors();
  const { isDark } = useTheme();

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onUpdate((event) => {
      if (isFinished) return;
      translateX.value = Math.max(SWIPE_LIMIT * 1.2, event.translationX);
    })
    .onEnd(() => {
      if (isFinished) {
        translateX.value = withSpring(0);
        return;
      }
      if (translateX.value < SWIPE_LIMIT / 1.5) {
        translateX.value = withSpring(SWIPE_LIMIT);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deletePath = () => {
    setDeleteVisible(true);
  };

  const { removeSpending } = useActiveTrip();

  const handleDeleteConfirmed = async () => {
    try {
      await removeSpending(tripId, item.id);
      setDeleteVisible(false);
    } catch (error) {
       setDeleteVisible(false);
       translateX.value = withSpring(0);
       Alert.alert("Error", "Failed to delete expense");
    }
  };

  const handleCancelDelete = () => {
    setDeleteVisible(false);
    translateX.value = withSpring(0);
  };

  return (
    <View style={styles.swipeBackground}>
      <View style={styles.deleteAction}>
        <TouchableOpacity onPress={deletePath} style={styles.deleteCircle}>
          <Ionicons name="trash" size={20} color="white" />
        </TouchableOpacity>
      </View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.content, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }, animatedStyle]}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F0F0F0" }, isFinished && { opacity: 0.5 }]}>
            <Ionicons name="card-outline" size={20} color={isFinished ? colors.GRAY : colors.MUTED_TEXT} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.TEXT }, isFinished && { color: colors.GRAY }]}>{item.name}</Text>
            <Text style={[styles.date, { color: colors.MUTED_TEXT }]}>{item.date}</Text>
          </View>
          <Text style={[styles.amount, { color: colors.TEXT }, isFinished && { color: colors.GRAY }]}>{currency}{item.amount}</Text>
        </Animated.View>
      </GestureDetector>

      <SafarAlert
        visible={deleteVisible}
        title="Delete Transaction"
        message={`Are you sure you want to remove "${item.name}"? This action will permanently delete this record from your trip history.`}
        type="confirm"
        confirmText="Delete"
        cancelText="Keep"
        onConfirm={handleDeleteConfirmed}
        onCancel={handleCancelDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  swipeBackground: {
    backgroundColor: "#FFEBEE20",
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  deleteAction: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: width * 0.2,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF5252",
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  name: { fontSize: 16, fontFamily: "outfitBold" },
  date: { fontSize: 12, fontFamily: "outfit", marginTop: 2 },
  amount: { fontSize: 16, fontFamily: "outfitBold" },
});
