import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../../config/FirebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ActiveTripCard from "../../components/WalletDetails/ActiveTripCard";

const { width, height } = Dimensions.get("window");

export default function Wallet() {
  const user = auth.currentUser;
  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const boldFont = "outfitBold";
  const regularFont = "outfit";
  const mediumFont = "outfitMedium";

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    const tripsRef = collection(db, "UserTrips", user.uid, "trips");
    const q = query(
      tripsRef,
      where("userEmail", "==", user.email),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        setLoading(true);

        const userTripsData = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        const tripsWithDetails = await Promise.all(
          userTripsData.map(async (trip) => {
            if (!trip.savedTripId) {
              return trip;
            }
            const savedTripRef = doc(db, "SavedTripData", trip.savedTripId);
            const savedTripSnap = await getDoc(savedTripRef);

            if (savedTripSnap.exists()) {
              const saved = savedTripSnap.data();
              return {
                ...trip,
                ...saved,
                id: trip.id,
              };
            } else {
              console.warn("No SavedTripData found for", trip.savedTripId);
              return trip;
            }
          })
        );

        setActiveTrips(tripsWithDetails);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching active trips: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: width * 0.05,
          paddingTop: height * 0.08,
          paddingBottom: height * 0.1,
          flexGrow: 1,
          backgroundColor: Colors.WHITE,
        }}
      >
        <Text
          style={{
            fontSize: width * 0.08,
            fontFamily: boldFont,
            color: Colors.BLACK,
            marginBottom: height * 0.01,
          }}
        >
          Active Trips
        </Text>

        {loading && (
          <ActivityIndicator
            size="large"
            color={Colors.PRIMARY}
            style={{ marginTop: height * 0.05 }}
          />
        )}

        {!loading && activeTrips.length === 0 && (
          <View style={{ marginTop: height * 0.1, alignItems: "center" }}>
            <MaterialCommunityIcons
              name="bag-checked"
              size={width * 0.2}
              color={Colors.GRAY}
            />
            <Text
              style={{
                fontFamily: mediumFont,
                fontSize: width * 0.05,
                color: Colors.GRAY,
                marginTop: height * 0.02,
              }}
            >
              You have no active trips.
            </Text>
            <Text
              style={{
                fontFamily: regularFont,
                fontSize: width * 0.04,
                color: Colors.GRAY,
                marginTop: height * 0.01,
                textAlign: "center",
              }}
            >
              Activate a trip from the "My Trips" details page to manage its
              expenses here.
            </Text>
          </View>
        )}

        <View style={{ marginTop: height * 0.02 }}>
          {activeTrips.map((trip) => (
            <ActiveTripCard key={trip.id} trip={trip} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
