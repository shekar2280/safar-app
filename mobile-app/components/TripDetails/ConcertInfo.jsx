import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Dimensions,
  StyleSheet,
  Platform,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function ConcertInfo({ concertDetails }) {
  if (!concertDetails) return null;

  const openMaps = () => {
    const query = encodeURIComponent(
      `${concertDetails?.concertData?.venueName}, ${concertDetails?.concertData?.venueAddress}`,
    );
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    Linking.openURL(url);
  };

  const rawPrice = concertDetails?.tripPlan?.concertDetails?.ticketPrice || 0;

  const formattedPrice =
    rawPrice > 0
      ? `₹${rawPrice.toLocaleString("en-IN")}`
      : "Check on Booking Site";

  const DetailItem = ({ icon, label, value, isLast = false, onPress = null }) => (
    <TouchableOpacity 
      disabled={!onPress} 
      onPress={onPress}
      style={[styles.detailItem, isLast && { borderBottomWidth: 0 }]}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={20} color={Colors.SECONDARY} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={2}>
          {value}
        </Text>
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={18} color={Colors.SECONDARY} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.overline}>EXCLUSIVE EVENT</Text>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Concert Pass</Text>
          <View style={styles.goldDot} />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.artistInfo}>
            <Text style={styles.artistLabel}>PERFORMING ARTIST</Text>
            <Text style={styles.artistName}>
              {concertDetails?.concertData?.artist}
            </Text>
          </View>
          <View style={styles.passBadge}>
            <Ionicons name="ticket" size={20} color={Colors.BLACK} />
          </View>
        </View>

        <View style={styles.body}>
          <DetailItem
            icon="calendar-outline"
            label="EVENT DATE"
            value={concertDetails?.concertData?.destinationInfo?.concertDate}
          />
          <DetailItem
            icon="time-outline"
            label="DOORS OPEN"
            value={concertDetails?.concertData?.destinationInfo?.concertTime}
          />
          <DetailItem
            icon="cash-outline"
            label="ESTIMATED PRICE"
            value={formattedPrice}
          />
          <DetailItem
            icon="location-outline"
            label="VENUE"
            value={`${concertDetails?.concertData?.destinationInfo?.venueName}\n${concertDetails?.concertData?.destinationInfo?.venueAddress}`}
            isLast={true}
            onPress={openMaps}
          />
        </View>

        {(concertDetails?.concertData?.destinationInfo?.bookingUrl ||
          concertDetails?.bookingUrl) && (
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                concertDetails?.concertData?.destinationInfo?.bookingUrl ||
                  concertDetails?.bookingUrl,
              )
            }
            style={styles.bookButton}
            activeOpacity={0.9}
          >
            <Text style={styles.bookButtonText}>Secure Your Tickets</Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={Colors.WHITE}
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 35, marginBottom: 20 },
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
  card: {
    borderRadius: 28,
    backgroundColor: Colors.SURFACE,
    overflow: "hidden",
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  cardHeader: {
    backgroundColor: Colors.PRIMARY,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  artistInfo: {
    flex: 1,
  },
  artistLabel: {
    color: "rgba(255,255,255,0.5)",
    fontFamily: "outfitMedium",
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 4,
  },
  artistName: {
    color: Colors.WHITE,
    fontFamily: "playfairBold",
    fontSize: 32,
  },
  passBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.SECONDARY,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.SECONDARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  body: {
    padding: 24,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FDF9F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  label: {
    fontFamily: "outfitMedium",
    fontSize: 10,
    color: Colors.MUTED_TEXT,
    letterSpacing: 1,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  value: {
    fontFamily: "outfitBold",
    fontSize: 15,
    color: Colors.TEXT,
    lineHeight: 20,
  },
  bookButton: {
    margin: 24,
    marginTop: 0,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  bookButtonText: {
    color: Colors.WHITE,
    fontFamily: "outfitBold",
    fontSize: 16,
  },
});
