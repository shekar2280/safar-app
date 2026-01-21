import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
} from "react-native";
import React, { useEffect, useState, useContext, useRef } from "react";
import { Colors } from "../../constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import StartNewTripCard from "../../components/MyTrips/StartNewTripCard";
import { useRouter } from "expo-router";
import { auth, db } from "../../config/FirebaseConfig";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import UserTripList from "../../components/MyTrips/UserTripList";
import { CreateTripContext } from "../../context/CreateTripContext";
import { useUser } from "../../context/UserContext";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function Mytrip() {
  const { userTrips, setUserTrips } = useUser(); 
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showBackOnline, setShowBackOnline] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const router = useRouter();
  const { setTripData } = useContext(CreateTripContext);
  const user = auth.currentUser;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected;
      if (offline) {
        setIsOffline(true);
        setShowBackOnline(false);
      } else if (isOffline) {
        setShowBackOnline(true);
        setIsOffline(false);
        triggerOnlineAnimation();
      }
    });
    return () => unsubscribe();
  }, [isOffline]);

  const triggerOnlineAnimation = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => setShowBackOnline(false));
  };

  useEffect(() => {
    if (!user?.uid || isOffline) return;

    const tripsRef = collection(db, "UserTrips", user.uid, "trips");
    const q = query(tripsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const baseTrips = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setUserTrips(baseTrips);

      await AsyncStorage.setItem(`trips_${user.uid}`, JSON.stringify(baseTrips));

      baseTrips.forEach(async (trip) => {
        if (!trip.savedTripId) return;
        try {
          const snap = await getDoc(doc(db, "SavedTripData", trip.savedTripId));
          if (snap.exists()) {
            setUserTrips((prev) =>
              prev.map((t) => (t.id === trip.id ? { ...t, ...snap.data() } : t))
            );
          }
        } catch (e) {
          console.log("Error fetching trip details", e);
        }
      });
    });

    return unsubscribe;
  }, [user, isOffline]);

  const handleDelete = (deletedTripId) => {
    setUserTrips((prev) => prev.filter((trip) => trip.id !== deletedTripId));
  };

  return (
    <ScrollView
      style={{ paddingTop: height * 0.03, backgroundColor: Colors.WHITE }}
      contentContainerStyle={{
        padding: width * 0.06,
        paddingBottom: height * 0.05,
        flexGrow: 1,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontFamily: "outfitBold", fontSize: width * 0.07 }}>My Trips</Text>
        <TouchableOpacity
          onPress={() => {
            setTripData({});
            router.push("/create-trip/select-departure");
          }}
        >
          <Ionicons name="add-circle" size={width * 0.11} color="black" />
        </TouchableOpacity>
      </View>

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={20} color="white" style={{ marginRight: 6 }} />
          <Text style={{ color: Colors.WHITE, fontFamily: "outfit" }}>You are offline</Text>
        </View>
      )}

      {showBackOnline && (
        <Animated.View style={[styles.onlineToast, { opacity: fadeAnim }]}>
          <Ionicons name="cloud-outline" size={20} color="white" />
          <Text style={{ color: "white", fontFamily: "outfit" }}>Back Online</Text>
        </Animated.View>
      )}

      {loading && (
        <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ marginTop: height * 0.05 }} />
      )}

      {!loading && (
        userTrips?.length === 0 ? (
          <StartNewTripCard />
        ) : (
          <UserTripList userTrips={userTrips} onDelete={handleDelete} />
        )
      )}
    </ScrollView>
  );
}

const styles = {
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: height * 0.02,
    padding: 8,
    backgroundColor: "orange",
    borderRadius: 6,
  },
  onlineToast: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    backgroundColor: "green",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    gap: 5,
    zIndex: 10,
  }
};