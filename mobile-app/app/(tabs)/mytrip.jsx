import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState, useContext, useRef } from "react";
import { Colors } from "../../constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import StartNewTripCard from "../../components/MyTrips/StartNewTripCard";
import { useRouter } from "expo-router";
import UserTripList from "../../components/MyTrips/UserTripList";
import { CreateTripContext } from "../../context/CreateTripContext";
import { useUser } from "../../context/UserContext";
import NetInfo from "@react-native-community/netinfo";

const { width, height } = Dimensions.get("window");

export default function Mytrip() {
  const { userTrips, setUserTrips, loading } = useUser();
  const [isOffline, setIsOffline] = useState(false);
  const [showBackOnline, setShowBackOnline] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { setTripData } = useContext(CreateTripContext);

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
  };

  const handleDelete = (deletedId) => {
    setUserTrips((prev) => prev.filter((t) => t.id !== deletedId));
  };

  return (
    <ScrollView
      style={{ paddingTop: height * 0.03, backgroundColor: Colors.WHITE }}
      contentContainerStyle={{ padding: width * 0.05, flexGrow: 1 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>My Trips</Text>
        <TouchableOpacity
          onPress={() => {
            setTripData({});
            router.push("/create-trip/select-departure");
          }}
        >
          <Ionicons name="add-circle" size={width * 0.14} color="black" />
        </TouchableOpacity>
      </View>

      {isOffline && (
        <View style={[styles.banner, { backgroundColor: "orange" }]}>
          <Text style={styles.bannerText}>Offline Mode</Text>
        </View>
      )}
      {showBackOnline && (
        <Animated.View
          style={[
            styles.banner,
            { backgroundColor: "green", opacity: fadeAnim },
          ]}
        >
          <Text style={styles.bannerText}>Back Online</Text>
        </Animated.View>
      )}

      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.PRIMARY}
          style={{ marginTop: 50 }}
        />
      ) : userTrips?.length === 0 ? (
        <StartNewTripCard />
      ) : (
        <UserTripList userTrips={userTrips} onDelete={handleDelete} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontFamily: "outfitBold", fontSize: 34 },
  banner: {
    flexDirection: "row",
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
    justifyContent: "center",
  },
  bannerText: { color: "white", fontFamily: "outfit" },
});
