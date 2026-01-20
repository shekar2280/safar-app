import {
  Dimensions,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as Constants from "expo-constants";
import { useLocalSearchParams } from "expo-router";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { auth, db } from "../../config/FirebaseConfig";

import { Colors } from "../../constants/Colors";
import { ActionButton } from "../../components/WalletDetails/ActionButton";
import { SpendingForm } from "../../components/WalletDetails/SpendingForm";
import { SpendingItem } from "../../components/WalletDetails/SpendingItem";
import { useUser } from "../../context/UserContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const ocrApiKey = Constants.default.expoConfig.extra.OCRSPACE_API_KEY;

const extractTotalFromPlain = (raw) => {
  const keys = ["TOTAL", "GRAND TOTAL", "AMOUNT DUE", "BALANCE DUE"];
  const lines = raw.split("\n");
  for (const line of lines) {
    const up = line.trim().toUpperCase();
    const hit = keys.some((k) => up.startsWith(k));
    if (!hit) continue;

    const match = line.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+\.\d{2})/);
    if (match) return parseFloat(match[0].replace(/,/g, "")).toFixed(2);
  }
  return null;
};

export default function SpendingsInput() {
  const { tripId } = useLocalSearchParams();
  const { userTrips } = useUser();
  const user = auth.currentUser;

  const [spendings, setSpendings] = useState([]);
  const [spendingName, setSpendingName] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");

  const [totalBudget, setTotalBudget] = useState(0);
  const [remBudget, setRemBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0); 

  const [newBudgetInput, setNewBudgetInput] = useState("");

  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const totalSpentVal = spendings.reduce((sum, item) => sum + item.amount, 0);
    setTotalSpent(totalSpentVal);
    setRemBudget(totalBudget - totalSpentVal);
  }, [spendings, totalBudget]);

  useEffect(() => {
    if (!tripId || !user) return;

    const currentTrip = userTrips?.find((t) => t.id === tripId);
    if (currentTrip) {
      setTotalBudget(currentTrip.totalBudget || 0);
    }

    const transactionsRef = collection(
      db,
      "UserTrips",
      user.uid,
      "trips",
      tripId,
      "transactions"
    );
    const q = query(transactionsRef, where("tripId", "==", tripId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreSpendings = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const dateObject = data.date?.toDate() || new Date();
          return {
            id: doc.id,
            ...data,
            timestamp: dateObject.getTime(),
            date: dateObject.toLocaleString(),
          };
        })
        .sort((a, b) => {
          return sortOrder === "desc" 
            ? b.timestamp - a.timestamp 
            : a.timestamp - b.timestamp;
        });

      setSpendings(firestoreSpendings);
    });

    return () => unsubscribe();
  }, [tripId, userTrips, sortOrder]);

  const handleSetBudget = async () => {
    if (!tripId) return;
    const newBudget = parseFloat(newBudgetInput);
    if (isNaN(newBudget) || newBudget <= 0)
      return alert("Enter a valid budget.");

    try {
      const tripDocRef = doc(db, "UserTrips", user.uid, "trips", tripId);
      await setDoc(tripDocRef, { totalBudget: newBudget }, { merge: true });
      setTotalBudget(newBudget);
      setNewBudgetInput("");
    } catch (error) {
      console.error(error);
    }
  };

  const pickImage = (type) => async () => {
    let result =
      type === "gallery"
        ? await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            base64: true,
          })
        : await ImagePicker.launchCameraAsync({
            mediaTypes: "images",
            allowsEditing: true,
            base64: true,
          });

    if (!result.canceled && result.assets[0]) {
      processImageAndPerformOCR(result.assets[0]);
    }
  };

  const processImageAndPerformOCR = async (asset) => {
    setIsProcessing(true);
    setExtractedText("Processing...");
    try {
      const manip = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1000 } }],
        { base64: true }
      );
      setImage(manip.uri);

      const formData = new FormData();
      formData.append("base64Image", `data:image/jpg;base64,${manip.base64}`);
      const res = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        headers: { apikey: ocrApiKey },
        body: formData,
      });
      const json = await res.json();
      const total = extractTotalFromPlain(
        json?.ParsedResults?.[0]?.ParsedText || ""
      );
      if (total) {
        setAmountInput(total);
        setExtractedText(`Found Total: ₹${total}`);
      } else {
        setExtractedText("Total not detected.");
      }
    } catch (err) {
      setExtractedText("Error reading bill.");
    } finally {
      setIsProcessing(false);
    }
  };

  const recordSpending = async () => {
    const amount = parseFloat(amountInput);
    if (!spendingName.trim() || isNaN(amount))
      return alert("Fill all details.");
    try {
      const ref = collection(
        db,
        "UserTrips",
        user.uid,
        "trips",
        tripId,
        "transactions"
      );
      await addDoc(ref, {
        tripId,
        userId: user.uid,
        name: spendingName.trim(),
        amount,
        date: serverTimestamp(),
        imageUri: image,
      });
      clearAll();
      setIsFormVisible(false);
    } catch (error) {
      console.error(error);
    }
  };

  const clearAll = () => {
    setImage(null);
    setExtractedText("");
    setSpendingName("");
    setAmountInput("");
    setIsProcessing(false);
  };

  const hideForm = () => {
    clearAll();
    setIsFormVisible(false);
  };

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={{ gap: 10 }}>
          {totalBudget <= 0 ? (
            <View style={styles.setupContainer}>
              <Text style={styles.setupHeader}>Set Your Initial Budget</Text>
              <TextInput
                placeholder="Enter Monthly/Total Budget"
                value={newBudgetInput}
                onChangeText={(text) =>
                  setNewBudgetInput(text.replace(/[^0-9.]/g, ""))
                }
                keyboardType="numeric"
                style={styles.input}
              />
              <ActionButton
                title="Start Tracking"
                onPress={handleSetBudget}
                disabled={!newBudgetInput.trim()}
                styleOverride={styles.setTotalButton}
              />
            </View>
          ) : (
            <View style={styles.budgetSummary}>
              <View style={styles.budgetMainInfo}>
                <View>
                  <Text style={styles.label}>Remaining Balance</Text>
                  <Text style={[styles.bigAmount, { color: remBudget < 0 ? "#FF5252" : "#FFFFFF" }]}>
                    ₹{remBudget.toLocaleString()}
                  </Text>
                </View>
                <MaterialCommunityIcons name="integrated-circuit-chip" size={40} color="rgba(255,255,255,0.3)" />
              </View>

              <View style={styles.statsRow}>
                <View>
                  <Text style={styles.statLabel}>Total Budget</Text>
                  <Text style={styles.statValue}>₹{totalBudget.toLocaleString()}</Text>
                </View>
                <View style={styles.statDivider} />
                <View>
                  <Text style={styles.statLabel}>Spent So Far</Text>
                  <Text style={styles.statValue}>₹{totalSpent.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.historySection}>
            <View style={styles.historyHeaderRow}>
                <Text style={styles.historyHeader}>
                Recent Spendings ({spendings.length})
                </Text>
                <TouchableOpacity 
                    onPress={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                    style={styles.sortButton}
                >
                    <Ionicons 
                        name={sortOrder === "desc" ? "arrow-down-circle" : "arrow-up-circle"} 
                        size={20} 
                        color={Colors.PRIMARY} 
                    />
                    <Text style={styles.sortText}>
                        {sortOrder === "desc" ? "Newest" : "Oldest"}
                    </Text>
                </TouchableOpacity>
            </View>
            
            {spendings.map((item) => (
              <SpendingItem key={item.id} item={item} tripId={tripId} />
            ))}
          </View>
        </View>
      </ScrollView>

      {isFormVisible && (
        <View style={styles.formOverlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={hideForm}
          />

          <View style={styles.floatingFormCard}>
            <SpendingForm
              spendingName={spendingName}
              amountInput={amountInput}
              image={image}
              extractedText={extractedText}
              isProcessing={isProcessing}
              setSpendingName={setSpendingName}
              setAmountInput={setAmountInput}
              hideForm={hideForm}
              pickImage={pickImage}
              clearAll={clearAll}
              recordSpending={recordSpending}
            />
          </View>
        </View>
      )}
      {!isFormVisible && totalBudget > 0 && (
        <View style={styles.fixedButtonContainer}>
          <ActionButton
            title="➕ Add Spending"
            onPress={() => setIsFormVisible(true)}
            styleOverride={styles.addSpendingButtonFixed}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  container: {
    backgroundColor: "#F8F9FA",
  },
  contentContainer: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.06,
    paddingBottom: height * 0.15,
    flexGrow: 1,
  },
  setupContainer: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: Colors.LIGHT_GRAY,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  setupHeader: {
    fontSize: width * 0.05,
    fontFamily: "outfitBold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    backgroundColor: Colors.WHITE,
    marginBottom: 10,
  },
  budgetSummary: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    marginBottom: 5,
  },
  budgetMainInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
  },
  label: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "outfit" },
  bigAmount: { fontSize: 30, fontFamily: "outfitBold", marginTop: 4 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    padding: 15,
    borderRadius: 16,
  },
  statLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    fontFamily: "outfit",
  },
  statValue: {
    color: "#FFF",
    fontSize: 15,
    fontFamily: "outfitBold",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 25,
    backgroundColor: "rgba(255, 253, 253, 0.2)",
  },
  historySection: {
    marginTop: 10,
  },
  historyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  historyHeader: {
    fontSize: width * 0.05,
    fontFamily: "outfitBold",
    color: Colors.BLACK,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  sortText: {
    fontSize: 12,
    fontFamily: "outfitMedium",
    color: Colors.PRIMARY,
    marginLeft: 5,
  },
  setTotalButton: {
    padding: 15,
    width: "100%",
  },
  formOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  floatingFormCard: {
    width: width * 0.9,
  },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  addSpendingButtonFixed: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 50,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
});
