import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/src/constants/colors";
import { LocationStatusProps } from "@/src/constants";
import { MotiView, AnimatePresence } from "moti";

export const LocationStatus: React.FC<LocationStatusProps> = ({
  effectiveLocation,
  isFinished,
  onRefresh,
}) => {
  const colors = useThemeColors();

  const getStatusColor = () => {
    if (isFinished) return colors.GRAY;
    if (effectiveLocation) return colors.GREEN;
    return colors.GOLD;
  };

  const statusColor = getStatusColor();

  return (
    <MotiView
      from={{ opacity: 0, translateY: -20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 500 }}
    >
      <TouchableOpacity
        style={[
          styles.locationStatus,
          { 
            backgroundColor: colors.SURFACE,
            borderColor: colors.BORDER,
            borderWidth: 1,
            shadowColor: colors.BLACK,
          },
          isFinished && styles.archivedLocationBar,
        ]}
        onPress={() => !isFinished && onRefresh()}
        activeOpacity={0.7}
        disabled={isFinished}
      >
        <View style={styles.leftSection}>
          <View style={styles.indicatorContainer}>
            {!isFinished ? (
              <>
                <MotiView
                  from={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{
                    type: "timing",
                    duration: 1500,
                    loop: true,
                    repeatReverse: false,
                  }}
                  style={[styles.pulseCircle, { backgroundColor: statusColor }]}
                />
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              </>
            ) : (
              <Ionicons name="archive" size={14} color={statusColor} />
            )}
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.locationStatusText, { color: colors.TEXT }]}>
              {isFinished
                ? "Journey History"
                : effectiveLocation
                ? "Using Live GPS"
                : "Searching Location..."}
            </Text>
            <Text style={[styles.subText, { color: colors.MUTED_TEXT }]}>
              {isFinished
                ? "Coordinates Finalized"
                : effectiveLocation
                ? "Distances updating in real-time"
                : "Waiting for GPS signal"}
            </Text>
          </View>
        </View>

        {!isFinished && (
          <View style={[styles.refreshBtn, { backgroundColor: colors.GOLD_MUTED }]}>
            <Text style={[styles.editText, { color: colors.GOLD }]}>REFRESH</Text>
          </View>
        )}
      </TouchableOpacity>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  locationStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: -25,
    marginBottom: 15,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    zIndex: 100,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  indicatorContainer: {
    width: 12,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pulseCircle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  mainIcon: {
    marginRight: 10,
    opacity: 0.8,
  },
  textContainer: {
    flex: 1,
  },
  locationStatusText: {
    fontFamily: "outfitBold",
    fontSize: 13,
  },
  subText: {
    fontFamily: "outfit",
    fontSize: 10,
    marginTop: 1,
  },
  refreshBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editText: {
    fontFamily: "outfitBold",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  archivedLocationBar: {
    opacity: 0.8,
  },
});
