import { View, Text, StyleSheet, Dimensions, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS, 
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = -width * 0.2; 

export const SpendingItem = ({ item }) => {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      translateX.value = event.translationX + translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = Math.max(SWIPE_THRESHOLD * 1.5, event.translationX);
    })
    .onEnd((event) => {
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withSpring(SWIPE_THRESHOLD);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const actionStyle = useAnimatedStyle(() => {
    const opacity = translateX.value < SWIPE_THRESHOLD / 2 ? 1 : 0;
    return {
      opacity: withSpring(opacity),
    };
  });

  const confirmDelete = () => {
    Alert.alert("Delete Transaction", "Are you sure you want to delete this transaction?", [
      {text: "Cancel", style: "cancel"},
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "Transactions", item.id));
          } catch (error) {
            console.error("Failed to delete transaction:", error);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.spendingItemContainer}>
      <Animated.View style={[styles.deleteAction, actionStyle]}>
        <Text
          style={styles.deleteText}
          onPress={confirmDelete}
        >
          <Ionicons
              name="trash"
              size={30}
              color="#ee3434ff"
              style={{ marginLeft: 10 }}
            />
        </Text>
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.spendingItemContent, animatedStyle]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.spendingName}>{item.name}</Text>
            <Text style={styles.spendingDate}>{item.date}</Text>
          </View>
          <Text style={styles.spendingAmount}>- ₹{item.amount.toFixed(2)}</Text>

          {item.imageUri && (
            <Ionicons
              name="image"
              size={20}
              color="#888"
              style={{ marginLeft: 10 }}
            />
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  spendingItemContainer: {
    width: width, 
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  spendingItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
<<<<<<< HEAD
    paddingVertical: 15,
=======
>>>>>>> 80c823af35000ea9a48adf62105148c82768fdcb
    marginRight: 35,
    marginHorizontal: 10, 
    backgroundColor: "white",
    gap: 25,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  deleteAction: {
    position: "absolute",
    bottom: 0,
    top: 0,
    right: 0,
    width: width * 0.25, 
    backgroundColor: "#fcdee2ff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5, 
  },
  deleteText: {
    color: "white",
    fontWeight: "bold",
  },
  spendingName: {
    fontSize: width * 0.045,
    fontWeight: "600",
  },
  spendingDate: {
    fontSize: width * 0.035,
    color: "#888",
    marginTop: 2,
  },
  spendingAmount: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    color: "black",
  },
});
