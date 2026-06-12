import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Dimensions,
  StyleSheet,
  Platform,
} from "react-native";
import { Colors, useThemeColors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import Button from "../common/Button";

const { width } = Dimensions.get("window");

interface DetailItemProps {
  icon: any;
  label: string;
  value?: string;
  isLast?: boolean;
  onPress?: (() => void) | null;
}

const DetailItem = ({ icon, label, value, isLast = false, onPress = null }: DetailItemProps) => {
  const colors = useThemeColors();
  const { isDark } = useTheme();

  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress ?? undefined}
      style={[
        styles.detailItem,
        { borderBottomColor: colors.BORDER },
        isLast && { borderBottomWidth: 0 },
      ]}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: isDark ? colors.GOLD_MUTED : colors.GOLD_LIGHT },
        ]}
      >
        <Ionicons name={icon} size={20} color={colors.GOLD} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: colors.MUTED_TEXT }]}>{label}</Text>
        <Text style={[styles.value, { color: colors.TEXT }]} numberOfLines={2}>{value}</Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={18} color={colors.GOLD} />}
    </TouchableOpacity>
  );
};

export default function ConcertInfo({ concertDetails }: { concertDetails?: any }) {
  const colors = useThemeColors();
  const { isDark } = useTheme();
  if (!concertDetails) return null;

  const data = concertDetails?.concert_data || concertDetails?.concertData || {};

  const openMaps = () => {
    const venue = data?.venueName || data?.destinationInfo?.venueName;
    const address = data?.venueAddress || data?.destinationInfo?.venueAddress;
    const query = encodeURIComponent(`${venue}, ${address}`);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    if (url) Linking.openURL(url);
  };

  const rawPrice =
    data?.priceRange?.min || concertDetails?.tripPlan?.concertDetails?.ticketPrice || 0;
  const formattedPrice =
    rawPrice > 0 ? `₹${rawPrice.toLocaleString("en-IN")}` : "Check on Booking Site";

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={[styles.overline, { color: colors.MUTED_TEXT }]}>EXCLUSIVE EVENT</Text>
        <View style={styles.titleRow}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT, flexShrink: 1 }]}>Concert Pass</Text>
          <View style={[styles.goldDot, { backgroundColor: colors.GOLD }]} />
        </View>
      </View>

      <View style={[styles.card, { borderColor: colors.BORDER, backgroundColor: colors.SURFACE }]}>
        <View style={styles.cardHeader}>
          <View style={styles.artistInfo}>
            <Text style={[styles.artistLabel, { color: "rgba(255,255,255,0.5)" }]}>PERFORMING ARTIST</Text>
            <Text
              style={[styles.artistName, { color: colors.WHITE }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {data?.artist}
            </Text>
          </View>
          <View style={[styles.passBadge, { backgroundColor: colors.GOLD, shadowColor: colors.GOLD }]}>
            <Ionicons name="ticket" size={20} color={isDark ? "#000" : Colors.BLACK} />
          </View>
        </View>

        <View style={styles.body}>
          <DetailItem
            icon="calendar-outline"
            label="EVENT DATE"
            value={data?.concertDate || data?.destinationInfo?.concertDate}
          />
          <DetailItem
            icon="time-outline"
            label="DOORS OPEN"
            value={data?.concertTime || data?.destinationInfo?.concertTime || "Evening"}
          />
          <DetailItem icon="cash-outline" label="ESTIMATED PRICE" value={formattedPrice} />
          <DetailItem
            icon="location-outline"
            label="VENUE"
            value={`${data?.venueName || data?.destinationInfo?.venueName}\n${data?.venueAddress || data?.destinationInfo?.venueAddress}`}
            isLast
            onPress={openMaps}
          />
        </View>

        {(data?.bookingUrl || data?.destinationInfo?.bookingUrl || concertDetails?.bookingUrl) && (
          <Button
            title="Secure Your Tickets"
            onPress={() =>
              Linking.openURL(
                data?.bookingUrl || data?.destinationInfo?.bookingUrl || concertDetails?.bookingUrl
              )
            }
            icon="arrow-forward"
            style={{ margin: 24, marginTop: 0 }}
          />
        )}
      </View>
      <View style={styles.attributionContainer}>
        <Text style={[styles.attributionText, { color: colors.MUTED_TEXT }]}>
          EVENT CONTENT BY TICKETMASTER
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: 10 },
  header: { paddingHorizontal: 4, marginBottom: 16 },
  overline: { fontFamily: "interMedium", fontSize: 10, color: Colors.MUTED_TEXT, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 },
  titleRow: { flexDirection: "row", alignItems: "baseline", marginTop: 0 },
  sectionTitle: { fontSize: 28, fontFamily: "playfairBold", color: Colors.TEXT },
  goldDot: { width: 6, height: 6, borderRadius: 3, marginLeft: 4, marginBottom: 6 },
  card: { borderRadius: 28, overflow: "hidden", elevation: 6, borderWidth: 1 },
  cardHeader: { backgroundColor: Colors.PRIMARY, padding: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  artistInfo: { flex: 1 },
  artistLabel: { fontFamily: "interMedium", fontSize: 10, letterSpacing: 2, marginBottom: 4 },
  artistName: { fontFamily: "playfairBold", fontSize: 28 },
  passBadge: { width: 52, height: 52, borderRadius: 26, justifyContent: "center", alignItems: "center", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  body: { padding: 24 },
  detailItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1 },
  iconContainer: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center", marginRight: 16 },
  label: { fontFamily: "outfitMedium", fontSize: 10, letterSpacing: 1, marginBottom: 2, textTransform: "uppercase" },
  value: { fontFamily: "outfitBold", fontSize: 15, lineHeight: 20 },
  bookButton: { margin: 24, marginTop: 0, paddingVertical: 16, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12 },
  bookButtonText: { fontFamily: "outfitBold", fontSize: 16 },
  attributionContainer: {
    marginTop: 15,
    alignItems: "center",
    opacity: 0.5,
  },
  attributionText: {
    fontFamily: "interMedium",
    fontSize: 8,
    letterSpacing: 1.5,
  },
});
