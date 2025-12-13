import { Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Colors } from "../../constants/Colors"; 

const { width } = Dimensions.get("window");

export const ActionButton = ({ title, onPress, disabled, styleOverride = {} }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.primaryActionButton,
      { opacity: disabled ? 0.5 : 1 },
      styleOverride,
      { backgroundColor: Colors.PRIMARY },
    ]}
  >
    {typeof title === 'string' ? (
      <Text style={styles.actionButtonText}>{title}</Text>
    ) : (
      title 
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  primaryActionButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: width * 0.04,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    textAlign: "center",
    color: Colors.WHITE,
    fontFamily: "outfitMedium",
    fontSize: width * 0.04,
  },
});