import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export const SpendingItem = ({ item }) => (
  <View style={styles.spendingItem}>
    <View style={{ flex: 1 }}>
      <Text style={styles.spendingName}>{item.name}</Text>
      <Text style={styles.spendingDate}>{item.date}</Text>
    </View>
    <Text style={styles.spendingAmount}>- ${item.amount.toFixed(2)}</Text>
    {/* {item.imageUri && (
      <Ionicons
        name="image"
        size={20}
        color="#888"
        style={{ marginLeft: 10 }}
      />
    )} */}
  </View>
);

const styles = StyleSheet.create({
  spendingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 15,
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
    color: "red",
  },
});