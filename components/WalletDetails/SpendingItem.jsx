import {View,Text,StyleSheet,Dimensions,Alert,TouchableOpacity,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../../config/FirebaseConfig";

const { width } = Dimensions.get("window");
const SWIPE_LIMIT = -width * 0.2;

export const SpendingItem = ({ item, tripId }) => {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onUpdate((event) => {
      translateX.value = Math.max(SWIPE_LIMIT * 1.2, event.translationX);
    })
    .onEnd(() => {
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
    Alert.alert("Delete", "Remove this expense?", [
      { text: "Cancel", onPress: () => (translateX.value = withSpring(0)) },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const user = auth.currentUser;
          await deleteDoc(
            doc(
              db,
              "UserTrips",
              user.uid,
              "trips",
              tripId,
              "transactions",
              item.id
            )
          );
        },
      },
    ]);
  };

  return (
    <View style={styles.swipeBackground}>
      <View style={styles.deleteAction}>
        <TouchableOpacity onPress={deletePath} style={styles.deleteCircle}>
          <Ionicons name="trash" size={20} color="white" />
        </TouchableOpacity>
      </View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.content, animatedStyle]}>
          <View style={styles.iconCircle}>
            <Ionicons name="card-outline" size={20} color="#666" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </View>
          <Text style={styles.amount}>₹{item.amount}</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  swipeBackground: {
    backgroundColor: "#FFEBEE",
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d7d7d7",
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
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  name: { fontSize: 16, fontWeight: "600" },
  date: { fontSize: 12, color: "#888" },
  amount: { fontSize: 16, fontWeight: "bold" },
});
