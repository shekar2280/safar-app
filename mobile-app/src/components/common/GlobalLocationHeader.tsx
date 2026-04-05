import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/colors";
import { useLocation } from "@/src/context/LocationContext";
import LocationPicker from "@/src/components/trip/LocationPicker";

const { height } = Dimensions.get("window");

export default function GlobalLocationHeader() {
  const insets = useSafeAreaInsets();
  const { currentLocation } = useLocation();
  const [modalVisible, setModalVisible] = useState(false);

  const cityName = currentLocation?.name || "Select Location";

  return (
    <View style={[styles.container, { paddingTop: insets.top + 5 }]}>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="location" size={26} color={Colors.SECONDARY} />
        <View style={styles.textContainer}>
          <View style={styles.row}>
            <Text style={styles.cityName} numberOfLines={1}>
              {cityName}
            </Text>
            <Ionicons name="chevron-down" size={12} color={Colors.GRAY} />
          </View>
          <Text style={styles.helperText}>Personalizing Safar for you</Text>
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { paddingTop: insets.top + 20 }]}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Where are you?</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color={Colors.TEXT} />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.pickerWrapper}>
                    <LocationPicker 
                        onLocationChange={(loc) => {
                            if (loc) {
                                setModalVisible(false);
                            }
                        }}
                    />
                </View>
                
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={16} color={Colors.GRAY} />
                    <Text style={styles.infoText}>
                        We use this to surface the best hidden gems and experiences near you.
                    </Text>
                </View>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    backgroundColor: "transparent",
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cityName: {
    fontFamily: "outfitBold",
    fontSize: 16,
    color: Colors.TEXT,
  },
  helperText: {
    fontFamily: "outfit",
    fontSize: 10,
    color: Colors.GRAY,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.WHITE,
    height: height * 0.8,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 25,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  modalTitle: {
    fontFamily: "playfairBold",
    fontSize: 28,
    color: Colors.TEXT,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    justifyContent: "center",
  },
  pickerWrapper: {
    flex: 1,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 16,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontFamily: "outfit",
    fontSize: 12,
    color: Colors.MUTED_TEXT,
    lineHeight: 18,
  },
});
