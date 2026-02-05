import { View, Text, TouchableOpacity, Alert, Dimensions, StyleSheet } from "react-native";
import React, { useMemo } from "react";
import moment from "moment";
import { Colors } from "../../constants/Colors";
import { useRouter } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../../config/FirebaseConfig";
import { concertImages, fallbackImages } from "../../constants/Options";
import { Image } from "expo-image";

const { width } = Dimensions.get("window");

export default function UserTripCard({ trip, onDelete }) {
  const router = useRouter();

  const tripData = trip?.tripData || trip?.discoverData || trip?.festiveData || trip?.concertData || trip?.trendingData || {};

  const tripName = trip?.concertData?.artist
    ? `${trip.concertData.artist} Concert`
    : trip?.savedTripId
        ? trip.savedTripId.split("-")[0].charAt(0).toUpperCase() + trip.savedTripId.split("-")[0].slice(1)
        : "My Trip";

  const randomFallback = useMemo(() => {
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  }, [trip?.id]);

  const concertFallback = useMemo(() => {
    return concertImages[Math.floor(Math.random() * concertImages.length)];
  }, [trip?.id]);

  const finalSource = useMemo(() => {
    if (trip?.concertData) {
      const concertImg = trip?.concertData?.artistImageUrl || trip?.concertData?.locationInfo?.imageUrl || trip?.imageUrl;
      return concertImg ? { uri: concertImg } : concertFallback;
    }

    const img = trip?.imageUrl;
     if (Array.isArray(img) && img.length > 0) {
      return { uri: img[0] };
    }
    if (typeof img === "string" && img.trim().length > 0) {
      return { uri: img };
    }
    return randomFallback;
  }, [trip, randomFallback, concertFallback]);

  const confirmDelete = () => {
    Alert.alert("Delete Trip", "Remove this journey?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            const user = auth.currentUser;
            await deleteDoc(doc(db, "UserTrips", user.uid, "trips", trip.id));
            onDelete?.(trip.id);
          } catch (error) { console.error(error); }
      }},
    ]);
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({
        pathname: "/trip-details",
        params: { trip: JSON.stringify(trip), imageUrl: typeof finalSource === 'object' ? finalSource.uri : finalSource },
      })}
    >
      <Image source={finalSource} style={styles.bannerImage} transition={400} />
      <View style={styles.overlay} />
      
      <View style={styles.content}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{tripName}</Text>
          <Text style={styles.dateText}>
            {moment(tripData.startDate).format("DD MMM YYYY")} • {trip?.traveler?.title|| "1"} 
          </Text>
        </View>

        <TouchableOpacity onPress={confirmDelete} style={styles.deleteBtn}>
          <MaterialIcons name="delete-outline" size={22} color="rgba(247, 13, 13, 0.73)" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 130, 
    borderRadius: 20,
    marginBottom: 15,
    overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 4,
  },
  bannerImage: { ...StyleSheet.absoluteFillObject },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)', 
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: { color: 'white', fontFamily: "outfitBold", fontSize: 20 },
  dateText: { color: 'rgba(255,255,255,0.8)', fontFamily: "outfit", fontSize: 14, marginTop: 2 },
  deleteBtn: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.63)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});