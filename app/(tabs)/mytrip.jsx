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
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import UserTripList from "../../components/MyTrips/UserTripList";
import { CreateTripContext } from "../../context/CreateTripContext";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function Mytrip() {
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showBackOnline, setShowBackOnline] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const router = useRouter();
  const { setTripData } = useContext(CreateTripContext);
  const user = auth.currentUser;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        setIsOffline(true);
        setShowBackOnline(false);
      } else {
        if (isOffline) {
          setShowBackOnline(true);
          setIsOffline(false);

          Animated.sequence([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.delay(2000),
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start(() => setShowBackOnline(false));
        }
      }
    });

    return () => unsubscribe();
  }, [isOffline]);

  useEffect(() => {
    if (!user?.email) return;

    const q = query(
      collection(db, "UserTrips"),
      where("userEmail", "==", user.email),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      setLoading(true);

      const userTripsData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      const tripsWithDetails = await Promise.all(
        userTripsData.map(async (trip) => {
          try {
            // IMPORTANT: Keep the original createdAt from the UserTrip
            const originalTimestamp = trip.createdAt;

            if (!trip.savedTripId) {
              return { ...trip };
            }

            const savedTripRef = doc(db, "SavedTripData", trip.savedTripId);
            const savedTripSnap = await getDoc(savedTripRef);

            if (savedTripSnap.exists()) {
              const saved = savedTripSnap.data();

              return {
                ...saved, // Data from global cache
                ...trip, // OVERWRITE with user-specific data (IDs, original createdAt)
                createdAt: originalTimestamp, // Force original sort order
              };
            }
            return { ...trip };
          } catch (err) {
            return { ...trip };
          }
        })
      );

      // MANUALLY RE-SORT after merging to be 100% sure
      const sortedTrips = tripsWithDetails.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA; // Descending
      });

      await AsyncStorage.setItem(
        `userTrips_${user.email}`,
        JSON.stringify(sortedTrips)
      );
      setUserTrips(sortedTrips);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const loadCachedTrips = async () => {
      if (!user.email) return;
      const cachedData = await AsyncStorage.getItem(`userTrips_${user.email}`);
      if (cachedData) {
        setUserTrips(JSON.parse(cachedData));
      }
    };

    if (isOffline) {
      loadCachedTrips();
    }
  }, [isOffline, user]);

  return (
    <ScrollView
      style={{
        paddingTop: height * 0.09,
        backgroundColor: Colors.WHITE,
      }}
      contentContainerStyle={{
        padding: width * 0.06,
        paddingBottom: height * 0.15,
        flexGrow: 1,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontFamily: "outfitBold",
            fontSize: width * 0.07,
          }}
        >
          🎇 My Trips
        </Text>
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: height * 0.02,
            padding: 8,
            backgroundColor: "orange",
            borderRadius: 6,
            fontSize: "20",
          }}
        >
          <Ionicons
            name="cloud-offline-outline"
            size={20}
            color="white"
            style={{ marginRight: 6 }}
          ></Ionicons>
          <Text style={{ color: Colors.WHITE, fontFamily: "outfit" }}>
            You are offline
          </Text>
        </View>
      )}

      {showBackOnline && (
        <Animated.View
          style={{
            opacity: fadeAnim,
            position: "absolute",
            top: 50,
            alignSelf: "center",
            backgroundColor: "green",
            borderRadius: 6,
            paddingHorizontal: 10,
            paddingVertical: 6,
            flexDirection: "row",
            gap: 5,
          }}
        >
          <Ionicons name="cloud-outline" size={20} color="white"></Ionicons>
          <Text style={{ color: "white", fontFamily: "outfit" }}>
            Back Online
          </Text>
        </Animated.View>
      )}

      {loading && (
        <ActivityIndicator
          size="large"
          color={Colors.PRIMARY}
          style={{ marginTop: height * 0.05 }}
        />
      )}

      {!loading &&
        (userTrips?.length === 0 ? (
          <StartNewTripCard />
        ) : (
          <UserTripList userTrips={userTrips} />
        ))}
    </ScrollView>
  );
}
