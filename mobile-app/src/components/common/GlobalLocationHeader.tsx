import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/theme";
import { useLocation } from "@/src/context/LocationContext";
import LocationPicker from "@/src/components/trip/LocationPicker";

const { height, width } = Dimensions.get("window");

export default function GlobalLocationHeader() {
  const insets = useSafeAreaInsets();
  const { currentLocation, loading, gpsEnabled, refreshGPS } = useLocation();
  const [modalVisible, setModalVisible] = useState(false);

  const cityName = currentLocation?.name || "Select Location";
  const isLive = !!currentLocation?.isLiveGPS;

  const renderStatusBadge = () => {
    if (loading) {
      return (
        <View style={styles.badge}>
          <ActivityIndicator size="small" color={Colors.GOLD} style={{ transform: [{ scale: 0.7 }] }} />
          <Text style={[styles.badgeText, { color: Colors.GOLD }]}>LOCATING...</Text>
        </View>
      );
    }

    if (!gpsEnabled && !currentLocation) {
      return (
        <TouchableOpacity style={[styles.badge, styles.warningBadge]} onPress={refreshGPS}>
          <Ionicons name="alert-circle" size={12} color={Colors.RED} />
          <Text style={[styles.badgeText, { color: Colors.RED }]}>TURN ON LOCATION</Text>
        </TouchableOpacity>
      );
    }

    if (currentLocation) {
      return (
        <View style={[styles.badge, isLive ? styles.liveBadge : styles.manualBadge]}>
          <View style={[styles.dot, { backgroundColor: isLive ? "#4ADE80" : "#94A3B8" }]} />
          <Text style={[styles.badgeText, { color: isLive ? "#4ADE80" : "#94A3B8" }]}>
            {isLive ? "USING LIVE GPS" : "MANUAL LOCATION ACTIVE"}
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="location" size={24} color={Colors.GOLD} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.row}>
            <Text style={styles.cityName} numberOfLines={1}>
              {cityName}
            </Text>
            <Ionicons name="chevron-down" size={12} color={Colors.GRAY} />
          </View>
          {renderStatusBadge()}
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
              <View>
                <Text style={styles.modalSubtitle}>CURRENT SETTINGS</Text>
                <Text style={styles.modalTitle}>Where are you?</Text>
              </View>
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
              <MaterialCommunityIcons name="shield-check-outline" size={20} color={Colors.SECONDARY} />
              <Text style={styles.infoText}>
                We use this to surface the best hidden gems and personalized experiences near your current base.
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
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 12,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cityName: {
    fontFamily: "outfitBold",
    fontSize: 16,
    color: Colors.TEXT,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  badgeText: {
    fontFamily: "outfitBold",
    fontSize: 9,
    letterSpacing: 1.2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  warningBadge: {
    paddingVertical: 2,
  },
  liveBadge: {},
  manualBadge: {},
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.WHITE,
    height: height * 0.85,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
  },
  modalSubtitle: {
    fontFamily: "outfitBold",
    fontSize: 10,
    color: Colors.GOLD,
    letterSpacing: 2,
    marginBottom: 4,
  },
  modalTitle: {
    fontFamily: "playfairBold",
    fontSize: 26,
    lineHeight: 32,
    color: Colors.TEXT,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  pickerWrapper: {
    flex: 1,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F8F8F8",
    padding: 16,
    borderRadius: 20,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontFamily: "outfit",
    fontSize: 13,
    color: Colors.MUTED_TEXT,
    lineHeight: 20,
  },
});
