import {
  Dimensions,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
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

const { width, height } = Dimensions.get("window");

const ocrApiKey = Constants.default.expoConfig.extra.OCRSPACE_API_KEY;

const extractTotalFromPlain = (raw) => {
  const keys = ["TOTAL", "GRAND TOTAL", "AMOUNT DUE", "BALANCE DUE"];
  const lines = raw.split("\n");
  for (const line of lines) {
    const up = line.trim().toUpperCase();
    const hit = keys.some((k) => up.startsWith(k));
    if (!hit) continue;

    // Regex to match currency format: $1,234.56 or 1234.56
    const match = line.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+\.\d{2})/);
    if (match) return parseFloat(match[0].replace(/,/g, "")).toFixed(2);
  }
  return null;
};

export default function SpendingsInput() {
  const { tripId } = useLocalSearchParams();
  const user = auth.currentUser;

  const [spendings, setSpendings] = useState([]);
  const [spendingName, setSpendingName] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);

  const [totalBudget, setTotalBudget] = useState(0);
  const [remBudget, setRemBudget] = useState(0);

  const [newBudgetInput, setNewBudgetInput] = useState("");

  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateRemainingBudget = (currentSpendings, budget) => {
    const totalSpent = currentSpendings.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const remaining = budget - totalSpent;
    return remaining;
  };

  useEffect(() => {
    const remaining = calculateRemainingBudget(spendings, totalBudget);
    setRemBudget(remaining);
  }, [spendings, totalBudget]);

  useEffect(() => {
    if (!tripId || !user) {
      return;
    }

    const fetchBudget = async () => {
      try {
        const tripDocRef = doc(db, "UserTrips", tripId);
        const tripSnapshots = await getDoc(tripDocRef);
        if (tripSnapshots.exists()) {
          const data = tripSnapshots.data();
          setTotalBudget(data.totalBudget || 0);
        }
      } catch (error) {
        console.error("Error fetching trip budget: ", error);
      }
    };

    fetchBudget();

    const transactionsCollectionRef = collection(db, "Transactions");
    const q = query(
      transactionsCollectionRef,
      where("tripId", "==", tripId)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const firestoreSpendings = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const dateObject = data.date?.toDate() || new Date();
          firestoreSpendings.push({
            id: doc.id, 
            name: data.name,
            amount: data.amount,
            timestamp: dateObject.getTime(),
            date: data.date?.toDate().toLocaleString() || new Date().toLocaleString(),
            imageUri: data.imageUri,
            synced: true, 
          });
        });

        firestoreSpendings.sort((a, b) => b.timestamp - a.timestamp);

        setSpendings(firestoreSpendings);
      },
      (error) => {
        console.error("Error fetching transactions in real-time:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [tripId, user]);

  const handleSetBudget = async () => {
    if (!tripId) return;

    const newBudget = parseFloat(newBudgetInput);
    if (isNaN(newBudget) || newBudget <= 0) {
      alert("Please enter a valid budget amount greater than zero.");
      return;
    }
    try {
      const tripDocRef = doc(db, "UserTrips", tripId);
      await setDoc(tripDocRef, { totalBudget: newBudget }, { merge: true });

      setTotalBudget(newBudget);
      setNewBudgetInput("");
    } catch (error) {
      console.error("Error setting budget:", error);
      alert("Failed to save budget. Please try again.");
    }
  };

  const getPermissions = async () => {
    const { status: galleryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (galleryStatus !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return false;
    }

    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
      return false;
    }
    return true;
  };

  const clearAll = () => {
    setImage(null);
    setExtractedText("");
    setSpendingName("");
    setAmountInput("");
    setIsProcessing(false);
  };

  const performOCR = async (file) => {
    if (!ocrApiKey) {
      throw new Error("OCRSPACE_API_KEY is missing from Expo config.");
    }

    const formData = new FormData();
    formData.append("base64Image", `data:image/jpg;base64,${file.base64}`);
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "true");
    formData.append("isTable", "true");

    const requestOptions = {
      method: "POST",
      headers: { apikey: ocrApiKey },
      body: formData,
    };

    const res = await fetch(
      "https://api.ocr.space/parse/image",
      requestOptions
    );
    const json = await res.json();

    if (json.IsErroredOnProcessing) {
      const apiError = json.ErrorMessage?.join(" ") || "Unknown API error.";
      throw new Error(apiError);
    }

    return json?.ParsedResults?.[0]?.ParsedText || "";
  };

  const processImageAndPerformOCR = async (asset) => {
    setIsProcessing(true);
    setExtractedText("Resizing image and performing OCR...");

    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1000 } }],
        {
          compress: 0.85,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (!manipulatedImage.base64) {
        throw new Error("Failed to generate Base64 data.");
      }

      const base64Data = manipulatedImage.base64;
      setImage(manipulatedImage.uri);

      const ocrResult = await performOCR({ base64: base64Data });
      const total = extractTotalFromPlain(ocrResult);

      if (total) {
        setExtractedText(`Successfully extracted total: ₹${total}`);
      } else {
        setExtractedText(
          `Total not found. Raw text start: ${ocrResult.substring(0, 50)}...`
        );
      }
      setAmountInput(total ? total : "");
    } catch (err) {
      console.error("Image processing failed:", err);
      setExtractedText(`Image processing error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const pickImage = (type) => async () => {
    if (!(await getPermissions())) return;

    let result;
    if (type === "gallery") {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        base64: false,
      });
    } else if (type === "camera") {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: true,
        base64: false,
      });
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await processImageAndPerformOCR(result.assets[0]);
    }
  };

  const recordSpending = async () => {
    const amount = parseFloat(amountInput);
    if (!spendingName.trim() || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid spending name and amount.");
      return;
    }

    try {
      const transactionsCollectionRef = collection(db, "Transactions");

      await addDoc(transactionsCollectionRef, {
        tripId: tripId,
        userId: user.uid,
        name: spendingName.trim(),
        amount: amount,
        date: serverTimestamp(), 
        imageUri: image,
      });

      clearAll();
      setIsFormVisible(false);
    } catch (error) {
      console.error("Error recording spending:", error);
      alert("Failed to record spending. Please try again.");
    }
  };

  const hideForm = () => {
    clearAll();
    setIsFormVisible(false);
  };


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={{ gap: 10 }}>
        <Text style={styles.header}>💰 Record Spending</Text>

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
          <>
            <View style={styles.budgetSummary}>
              <Text style={styles.budgetText}>
                Total Budget:
                <Text style={styles.budgetAmount}>
                  ₹{totalBudget.toFixed(2)}
                </Text>
              </Text>
              <Text style={styles.budgetText}>
                Remaining Budget:
                <Text
                  style={[
                    styles.budgetAmount,
                    { color: remBudget < 0 ? Colors.RED : Colors.PRIMARY },
                  ]}
                >
                  ₹{remBudget.toFixed(2)}
                </Text>
              </Text>
            </View>

            {!isFormVisible && (
              <ActionButton
                title="➕ Add Spending"
                onPress={() => setIsFormVisible(true)}
                styleOverride={styles.addSpendingButton}
              />
            )}

            {isFormVisible && (
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
            )}
          </>
        )}

        <View style={styles.historySection}>
          <Text style={styles.historyHeader}>
            Recent Spendings ({spendings.length})
          </Text>
          {spendings.length === 0 ? (
            <Text style={styles.noDataText}>
              {totalBudget > 0
                ? "No spendings recorded yet."
                : "Set your budget above to begin tracking."}
            </Text>
          ) : (
            spendings.map((item) => <SpendingItem key={item.id} item={item}  />)
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: height * 0.06,
    backgroundColor: Colors.WHITE,
  },
  contentContainer: {
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.1,
    flexGrow: 1,
  },
  header: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    color: Colors.DARK_GRAY,
  },
  setupContainer: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: Colors.LIGHT_GRAY,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  setupHeader: {
    fontSize: width * 0.055,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colors.DARK_GRAY,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    fontSize: width * 0.04,
    marginBottom: 10,
    width: "100%",
    backgroundColor: Colors.WHITE,
  },
  budgetSummary: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: Colors.LIGHT_GRAY,
    borderLeftWidth: 5,
    borderLeftColor: Colors.PRIMARY,
    borderRightWidth: 5,
    borderRightColor: Colors.PRIMARY,
    marginBottom: 10,
    flexDirection: "column",
  },
  budgetText: {
    fontSize: width * 0.045,
    marginBottom: 5,
    fontWeight: "500",
  },
  budgetAmount: {
    fontWeight: "bold",
    color: Colors.PRIMARY,
  },
  historySection: {
    marginTop: 15,
    marginBottom: 25,
  },
  historyHeader: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
    color: Colors.DARK_GRAY,
  },
  addSpendingButton: {
    paddingVertical: height * 0.02,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 10,
  },
  setTotalButton: {
    padding: height * 0.02,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 10,
  },
  noDataText: {
    textAlign: "center",
    color: Colors.MEDIUM_GRAY,
    marginTop: 20,
  },
});