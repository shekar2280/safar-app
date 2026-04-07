import {
  Dimensions,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "@/src/lib/firebase";
import { Colors } from "@/src/constants/colors";
import { ActionButton } from "@/src/components/wallet/ActionButton";
import { SpendingForm } from "@/src/components/wallet/SpendingForm";
import { SpendingItem } from "@/src/components/wallet/SpendingItem";
import { useUser } from "@/src/context/UserContext";
import { useTrips } from "@/src/hooks/queries/useTrips";
import { useQueryClient } from "@tanstack/react-query";
import { tripQueryKeys } from "@/src/hooks/queries/useTrips";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { UserTrip } from "@/src/types/interfaces";
import { apiPatch } from "@/src/lib/api";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SafarAlert from "@/src/components/ui/SafarAlert";

const { width, height } = Dimensions.get("window");

const ocrApiKey = Constants.expoConfig?.extra?.OCRSPACE_API_KEY;

const extractTotalFromPlain = (raw: string) => {
  const lines = raw.split("\n").map((line) => line.trim());
  const keys = [
    "TOTAL",
    "GRAND TOTAL",
    "AMOUNT DUE",
    "TOTAL PAYABLE",
    "TOTAL AMOUNT",
  ];

  for (let i = lines.length - 1; i >= 0; i--) {
    const upperLine = lines[i].toUpperCase();
    const isHit = keys.some((k) => upperLine === k || upperLine.includes(k));

    if (isHit) {
      for (let j = i; j < lines.length && j <= i + 5; j++) {
        const lineText = lines[j];

        if (
          lineText.includes("/") ||
          (lineText.includes("-") && lineText.match(/\d{2,4}/))
        ) {
          continue;
        }
        const priceMatch = lineText.match(
          /(?:\$|₹|Rs)?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2}))/
        );

        if (priceMatch) {
          const cleanedValue = priceMatch[1].replace(/,/g, "");
          return parseFloat(cleanedValue).toFixed(2);
        }
      }
    }
  }
  return null;
};

export default function SpendingsInput() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { userProfile } = useUser();
  const { data: userTrips = [] } = useTrips();
  const queryClient = useQueryClient();
  const user = auth.currentUser;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(false);
  const [activeSpendings, setActiveSpendings] = useState<any[]>([]);
  const [spendingName, setSpendingName] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [totalBudget, setTotalBudget] = useState(0);
  const [newBudgetInput, setNewBudgetInput] = useState("");

  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasSeenSwipeTip, setHasSeenSwipeTip] = useState(true);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "info" | "error" | "confirm";
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    const checkSwipeTip = async () => {
      const seen = await AsyncStorage.getItem("seenSwipeTip");
      setHasSeenSwipeTip(!!seen);
    };
    checkSwipeTip();
  }, []);

  const dismissSwipeTip = async () => {
    await AsyncStorage.setItem("seenSwipeTip", "true");
    setHasSeenSwipeTip(true);
  };

  const currentTrip = useMemo(() => {
    return userTrips?.find((t: UserTrip) => t.id === tripId);
  }, [userTrips, tripId]);

  const isFinished = currentTrip?.isFinished || false;

  useEffect(() => {
    if (currentTrip) {
      setTotalBudget(currentTrip.totalBudget || 0);
    }
  }, [currentTrip]);

   const allSpendings = useMemo(() => {
    const archived = (currentTrip?.archivedSpendings || []).map(s => ({
      ...s,
      date: new Date(s.timestamp).toLocaleDateString([], { day: 'numeric', month: 'short' }) + ', ' + 
            new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    }));
    const combined = [...activeSpendings, ...archived];
    
    return combined.sort((a, b) => {
        return sortOrder === "desc"
          ? b.timestamp - a.timestamp
          : a.timestamp - b.timestamp;
    });
  }, [activeSpendings, currentTrip?.archivedSpendings, sortOrder]);

  const totalSpent = useMemo(() => {
    return allSpendings.reduce((sum, item) => sum + item.amount, 0);
  }, [allSpendings]);

  const remBudget = useMemo(() => totalBudget - totalSpent, [totalBudget, totalSpent]);

  useEffect(() => {
    if (!tripId || !user) return;

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
            date: dateObject.toLocaleDateString([], { day: 'numeric', month: 'short' }) + ', ' + 
                  dateObject.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            isArchived: false,
          };
        });

      setActiveSpendings(firestoreSpendings);
    });

    return () => unsubscribe();
  }, [tripId]);

  const handleSetBudget = async () => {
    if (isFinished) return;
    if (!tripId || !user) return;
    const newBudget = parseFloat(newBudgetInput);
    if (isNaN(newBudget) || newBudget <= 0) {
      return setAlertConfig({
        visible: true,
        title: "Check Amount",
        message: "Budget values must be positive numeric amounts. Please verify your entry and try again.",
        type: "error",
      });
    }

    try {
      setLoading(true);
      await apiPatch(`/api/trips/${tripId}/budget`, { total_budget: newBudget });
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
      setNewBudgetInput("");
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setAlertConfig({
        visible: true,
        title: "Connectivity Error",
        message: "We're having trouble syncing your budget with our servers. Please check your network connection and try again.",
        type: "error",
      });
    }
  };

  const pickImage = (type: "camera" | "gallery") => async () => {
    const result =
      type === "gallery"
        ? await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            base64: true,
          })
        : await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            base64: true,
          });

    if (!result.canceled && result.assets[0]) {
      processImageAndPerformOCR(result.assets[0]);
    }
  };

  const processImageAndPerformOCR = async (asset: any) => {
    setIsProcessing(true);
    setExtractedText("Scanning receipt...");

    try {
      const manip = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1200 } }],
        { format: ImageManipulator.SaveFormat.JPEG, compress: 0.8 }
      );
      setImage(manip.uri);

      if (!ocrApiKey) {
        setExtractedText("OCR API Key missing.");
        setIsProcessing(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", {
        uri: manip.uri,
        name: "receipt.jpg",
        type: "image/jpeg",
      } as any);
      formData.append("apikey", ocrApiKey);
      formData.append("language", "eng");
      formData.append("OCREngine", "2");

      const res = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.OCRExitCode === 1) {
        const fullText = json?.ParsedResults?.[0]?.ParsedText || "";
        const total = extractTotalFromPlain(fullText);
        if (total) {
          setAmountInput(total.toString());
          setAlertConfig({
            visible: true,
            title: "Scan Successful",
            message: `We've processed your receipt. A total of ₹${total} has been identified and pre-filled for you.`,
            type: "info",
          });
        } else {
          setAlertConfig({
             visible: true,
             title: "Total Not Found",
             message: "We couldn't clearly identify the final amount on this receipt. Please verify and enter the total manually.",
             type: "error",
          });
        }
      } else {
        console.error("OCR API ERROR MESSAGE:", json.ErrorMessage);
      }
    } catch (err) {
      console.error("NETWORK ERROR:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const recordSpending = async () => {
    if (!tripId || !user) return;
    const amount = parseFloat(amountInput);
    if (!spendingName.trim() || isNaN(amount))
      return Alert.alert("Error", "Fill all details.");
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
        contentContainerStyle={[styles.contentContainer, { paddingTop: Math.max(insets.top + 20, height * 0.05) }]}
        showsVerticalScrollIndicator={false}
      >
        {totalBudget <= 0 && (
          <View style={styles.header}>
            <Text style={styles.subtitle}>EXPENSE TRACKER • {currentTrip?.tripPlan?.tripName?.toUpperCase()}</Text>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Trip Wallet</Text>
              <View style={styles.goldDot} />
            </View>
          </View>
        )}

        <View style={{ gap: 20 }}>
          {totalBudget <= 0 ? (
            <BlurView intensity={80} tint="light" style={styles.setupContainer}>
              <MaterialCommunityIcons name="wallet-plus-outline" size={40} color={Colors.PRIMARY} />
              <Text style={styles.setupHeader}>Initialize Budget</Text>
              <Text style={styles.setupDesc}>Set a total budget for this journey to start tracking your savings.</Text>
              <TextInput
                placeholder="Enter Amount (₹)"
                value={newBudgetInput}
                onChangeText={(text) =>
                  setNewBudgetInput(text.replace(/[^0-9.]/g, ""))
                }
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor="#94A3B8"
              />
              <ActionButton
                title="Secure Budget"
                onPress={handleSetBudget}
                disabled={!newBudgetInput.trim() || loading}
                styleOverride={styles.setTotalButton}
              />
            </BlurView>
          ) : (
            <LinearGradient
              colors={isFinished ? ["#94A3B8", "#1E293B"] : ["#9A7E3D", "#000000ff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.budgetSummary}
            >
              <View style={styles.balanceHeader}>
                <View style={styles.balanceInfo}>
                  <Text style={styles.label}>AVAILABLE BALANCE</Text>
                  <Text
                    style={[
                      styles.bigAmount,
                      { color: isFinished ? "#F1F5F9" : (remBudget < 0 ? "#FF4B4B" : "#FFFFFF") },
                    ]}
                  >
                    ₹{remBudget.toLocaleString("en-IN")}
                  </Text>
                </View>
                <View style={[styles.statusIndicator, { backgroundColor: isFinished ? "#94A3B8" : (remBudget < 0 ? "#FF4B4B" : "#4ADE80") }]} />
              </View>

              <View style={styles.dividerFull} />

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>TOTAL BUDGET</Text>
                  <Text style={styles.statValue}>
                    ₹{totalBudget.toLocaleString("en-IN")}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>SPENDINGS</Text>
                  <Text style={styles.statValue}>
                    ₹{totalSpent.toLocaleString("en-IN")}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          )}

          <View style={styles.historySection}>
            <View style={styles.historyHeaderRow}>
              <Text style={styles.historyHeader}>
                Transaction Logs
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                }
                style={styles.sortButton}
              >
                <Ionicons
                  name={
                    sortOrder === "desc"
                      ? "swap-vertical-outline"
                      : "swap-vertical"
                  }
                  size={16}
                  color={Colors.PRIMARY}
                />
                <Text style={styles.sortText}>
                  {sortOrder === "desc" ? "LATEST" : "OLDEST"}
                </Text>
              </TouchableOpacity>
            </View>

            {allSpendings.length > 0 && !hasSeenSwipeTip && (
              <View style={styles.swipeTipBox}>
                <Ionicons name="information-circle" size={24} color={Colors.PRIMARY} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.swipeTipText}>
                    Tip: Drag a log to the left to delete a transaction.
                  </Text>
                </View>
                <TouchableOpacity onPress={dismissSwipeTip} style={styles.swipeTipBtn}>
                  <Text style={styles.swipeTipBtnText}>OK, GOT IT</Text>
                </TouchableOpacity>
              </View>
            )}

            {allSpendings.length === 0 ? (
               <View style={styles.emptyHistory}>
                 <Text style={styles.emptyHistoryText}>No transactions recorded yet.</Text>
               </View>
            ) : (
              allSpendings.map((item) => (
                <SpendingItem key={item.id} item={item} tripId={tripId!} isFinished={isFinished} />
              ))
            )}
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

      {!isFormVisible && !isFinished && (
        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity 
            style={styles.addSpendingButtonFixed}
            onPress={() => setIsFormVisible(true)}
          >
            <Ionicons name="add" size={28} color="white" />
            <Text style={styles.addBtnText}>RECORD EXPENSE</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View style={styles.globalLoader}>
           <ActivityIndicator size="large" color={Colors.PRIMARY} />
        </View>
      )}

      <SafarAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })}
        onCancel={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: "#FDFDFD" },
  container: { flex: 1 },
  contentContainer: {
    paddingHorizontal: width * 0.02,
    paddingBottom: height * 0.2,
  },
  header: {
    paddingBottom: 25,
  },
  subtitle: {
    fontFamily: "outfitMedium",
    fontSize: 10,
    color: "#94A3B8",
    letterSpacing: 2.5,
    marginBottom: 5,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: -4,
  },
  title: {
    fontFamily: "playfairBold",
    fontSize: 40,
    color: Colors.PRIMARY,
    lineHeight: 48,
  },
  goldDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.SECONDARY,
    marginLeft: 2,
    marginBottom: 8,
  },
  setupContainer: {
    padding: 30,
    borderRadius: 24,
    backgroundColor: "rgba(241, 245, 249, 0.5)",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  setupHeader: { 
    fontSize: 22, 
    fontFamily: "playfairBold", 
    color: Colors.PRIMARY,
    marginTop: 15 
  },
  setupDesc: {
    fontFamily: "outfit",
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 25,
    lineHeight: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#FFF",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    fontFamily: "outfitBold",
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
    color: Colors.PRIMARY,
    textAlign: "center",
  },
  budgetSummary: {
    borderRadius: 15,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  balanceInfo: { flex: 1 },
  label: { 
    color: Colors.GOLD, 
    fontSize: 12, 
    fontFamily: "outfitBold", 
    letterSpacing: 2 
  },
  bigAmount: { 
    fontSize: 38, 
    fontFamily: "outfitBold", 
    marginTop: 8,
    color: "#FFFFFF",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  dividerFull: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    width: "100%",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: { flex: 1, alignItems: "flex-start" },
  statLabel: { 
    color: Colors.GOLD, 
    fontSize: 9, 
    fontFamily: "outfitBold", 
    letterSpacing: 1.5 
  },
  statValue: { 
    color: Colors.WHITE, 
    fontSize: 18, 
    fontFamily: "outfitBold", 
    marginTop: 6 
  },
  statDivider: { 
    width: 1, 
    height: 25, 
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 15,
  },
  historySection: { marginTop: 10 },
  historyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  historyHeader: { fontSize: 14, fontFamily: "outfitBold", color: "#1E293B", letterSpacing: 1 },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  sortText: {
    fontSize: 10,
    fontFamily: "outfitBold",
    color: Colors.PRIMARY,
    marginLeft: 6,
  },
  setTotalButton: { width: "100%", height: 60, borderRadius: 16 },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
  },
  addSpendingButtonFixed: {
    backgroundColor: Colors.PRIMARY,
    flexDirection: "row",
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  addBtnText: { color: "#FFF", fontFamily: "outfitBold", fontSize: 14, letterSpacing: 1 },
  formOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 1000, justifyContent: "center", alignItems: "center" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15, 23, 42, 0.6)" },
  floatingFormCard: { width: width * 0.9 },
  emptyHistory: { paddingVertical: 40, alignItems: "center" },
  emptyHistoryText: { fontFamily: "outfit", color: "#94A3B8", fontSize: 14 },
  globalLoader: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.7)", justifyContent: "center", alignItems: "center", zIndex: 2000 },
  swipeTipBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(235, 245, 255, 0.9)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(14, 165, 233, 0.2)",
  },
  swipeTipText: {
    fontFamily: "outfitMedium",
    fontSize: 13,
    color: "#0F172A",
    lineHeight: 18,
  },
  swipeTipBtn: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  swipeTipBtnText: {
    color: "#FFF",
    fontFamily: "outfitBold",
    fontSize: 11,
  },
});
