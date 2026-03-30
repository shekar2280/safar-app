import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Colors } from "../../constants/Colors";
import {
  Ionicons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function PlannedTrip({
  itineraryDetails,
  cityName,
  isActive,
  onActivate,
  onNavigateToActive,
}) {
  // 🔒 PREMIUM LOCKED VIEW
  if (!isActive) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.overline}>PERSONAL GUIDE</Text>
          <View style={styles.titleRow}>
            <Text style={styles.sectionTitle}>Locked Feature</Text>
            <View style={styles.goldDot} />
          </View>
        </View>

        <TouchableOpacity 
          activeOpacity={0.95} 
          onPress={onActivate}
          style={styles.premiumLockCard}
        >
          <LinearGradient
            colors={[Colors.PRIMARY, "#2C2C2C"]}
            style={styles.gradientBg}
          >
            <View style={styles.lockIconContainer}>
               <Ionicons name="sparkles" size={32} color={Colors.SECONDARY} />
               <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={14} color={Colors.BLACK} />
               </View>
            </View>

            <Text style={styles.lockTitle}>Unlock Your Personal Guide</Text>
            <Text style={styles.lockSubtitle}>
              Activate your trip to reveal your curated itinerary, hidden local gems, and AI-powered travel tools.
            </Text>

            <View style={styles.unlockButton}>
              <Text style={styles.unlockButtonText}>Reveal My Itinerary</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.BLACK} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // 🔓 PREMIUM UNLOCKED/ACTIVE VIEW (Gate only, no list)
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.overline}>PERSONAL GUIDE</Text>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Smart Itinerary</Text>
          <View style={styles.goldDot} />
        </View>
      </View>

      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={onNavigateToActive}
        style={styles.successCard}
      >
        <LinearGradient
          colors={[Colors.SECONDARY, "#D4AF37"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.successGradient}
        >
          <View style={styles.successIconBadge}>
             <Ionicons name="compass" size={24} color={Colors.WHITE} />
          </View>
          <View style={{ flex: 1, paddingRight: 10 }}>
             <Text style={styles.successTitle}>Itinerary is Ready</Text>
             <Text style={styles.successSubtitle}>Access your real-time journey & smart tools.</Text>
          </View>
          <View style={styles.goActiveBtn}>
             <Text style={styles.goActiveBtnText}>GO LIVE</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 0, marginBottom: 10 },
  header: {
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  overline: {
    fontFamily: "outfitMedium",
    fontSize: 10,
    color: Colors.MUTED_TEXT,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: -4,
  },
  sectionTitle: {
    fontSize: 28,
    fontFamily: "playfairBold",
    color: Colors.TEXT,
  },
  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.SECONDARY,
    marginLeft: 4,
    marginBottom: 6,
  },
  premiumLockCard: {
    borderRadius: 32,
    overflow: "hidden",
    elevation: 8,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  gradientBg: {
    padding: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  lockIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  lockBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.SECONDARY,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.PRIMARY,
  },
  lockTitle: {
    fontFamily: "playfairBold",
    fontSize: 24,
    color: Colors.WHITE,
    textAlign: "center",
    marginBottom: 12,
  },
  lockSubtitle: {
    fontFamily: "outfit",
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  unlockButton: {
    backgroundColor: Colors.SECONDARY,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  unlockButtonText: {
    fontFamily: "outfitBold",
    fontSize: 16,
    color: Colors.BLACK,
  },
  successCard: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 24,
    elevation: 4,
    shadowColor: Colors.SECONDARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  successGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  successIconBadge: {
    backgroundColor: "rgba(255,255,255,0.4)",
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  successTitle: {
    fontFamily: "outfitBold",
    fontSize: 15,
    color: Colors.BLACK,
  },
  successSubtitle: {
    fontFamily: "outfit",
    fontSize: 11,
    color: "rgba(0,0,0,0.6)",
    marginTop: 1,
  },
  goActiveBtn: {
    backgroundColor: Colors.BLACK,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  goActiveBtnText: {
    fontFamily: "outfitBold",
    fontSize: 10,
    color: Colors.WHITE,
    letterSpacing: 1,
  },
});
