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

export default function ConcertInfo({ concertData }) {
  if (!concertData) return null;

  const openMaps = () => {
    const query = encodeURIComponent(`${concertData.venueName}, ${concertData.venueAddress}`);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    Linking.openURL(url);
  };

  const DetailItem = ({ icon, label, value, isLast = false, onPress = null }) => (
    <TouchableOpacity 
      disabled={!onPress} 
      onPress={onPress}
      style={[styles.detailItem, isLast && { borderBottomWidth: 0 }]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color={Colors.PRIMARY} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={2}>{value}</Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={20} color={Colors.GRAY} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.artistInfo}>
          <Text style={styles.headerTitle}>Concert Pass</Text>
        </View>
        <Text style={styles.artistName}>{concertData.artist}</Text>
      </View>

      <View style={styles.body}>
        <DetailItem 
          icon="calendar-outline" 
          label="Event Date" 
          value={concertData.concertDate} 
        />
        <DetailItem 
          icon="time-outline" 
          label="Timing" 
          value={`${concertData.concertStartTime} - ${concertData.concertEndTime}`} 
        />
        <DetailItem 
          icon="cash-outline" 
          label="Estimated Ticket Price" 
          value={`${concertData.ticketPrice.toLocaleString('en-IN')}`} 
        />
        <DetailItem 
          icon="location-outline" 
          label="Venue" 
          value={`${concertData.venueName}\n${concertData.venueAddress}`} 
          isLast={true}
          onPress={openMaps}
        />
      </View>

      {concertData.bookingURL && (
        <TouchableOpacity
          onPress={() => Linking.openURL(concertData.bookingURL)}
          style={styles.bookButton}
        >
          <Text style={styles.bookButtonText}>Secure Your Tickets</Text>
          <Ionicons name="ticket-outline" size={20} color={Colors.WHITE} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 20,
    backgroundColor: Colors.WHITE,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  header: {
    backgroundColor: Colors.PRIMARY,
    padding: 20,
    alignItems: "center",
  },
  artistInfo: {
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.8,
    marginBottom: 4,
  },
  headerTitle: {
    color: Colors.WHITE,
    fontFamily: "outfit",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginLeft: 6,
  },
  artistName: {
    color: Colors.WHITE,
    fontFamily: "outfitBold",
    fontSize: 24,
    textAlign: "center",
  },
  body: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  label: {
    fontFamily: "outfit",
    fontSize: 12,
    color: Colors.GRAY,
    marginBottom: 2,
  },
  value: {
    fontFamily: "outfitMedium",
    fontSize: 15,
    color: "#333",
  },
  bookButton: {
    margin: 16,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  bookButtonText: {
    color: Colors.WHITE,
    fontFamily: "outfitBold",
    fontSize: 16,
  },
});