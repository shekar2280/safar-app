import {
  Dimensions,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as Constants from "expo-constants";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

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

const ActionButton = ({ title, onPress, disabled, styleOverride = {} }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.primaryActionButton,
      { opacity: disabled ? 0.5 : 1 },
      styleOverride,
      { backgroundColor: Colors.PRIMARY },
    ]}
  >
    <Text style={styles.actionButtonText}>{title}</Text>
  </TouchableOpacity>
);

const SpendingItem = ({ item }) => (
  <View style={styles.spendingItem}>
    <View style={{ flex: 1 }}>
      <Text style={styles.spendingName}>{item.name}</Text>
      <Text style={styles.spendingDate}>{item.date}</Text>
    </View>
    <Text style={styles.spendingAmount}>- ${item.amount.toFixed(2)}</Text>
    {item.imageUri && (
      <Ionicons
        name="image"
        size={20}
        color="#888"
        style={{ marginLeft: 10 }}
      />
    )}
  </View>
);

export default function SpendingsInput() {
  const [spendings, setSpendings] = useState([]);
  const [spendingName, setSpendingName] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);

  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

      setExtractedText(total || "not found");
      setAmountInput(total ? total : "");
    } catch (err) {
      console.error("Image processing failed:", err);
      setExtractedText(`Image processing error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
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

  const recordSpending = () => {
    const amount = parseFloat(amountInput);
    if (!spendingName.trim() || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid spending name and amount.");
      return;
    }

    const newSpending = {
      id: Date.now().toString(),
      name: spendingName.trim(),
      amount: amount,
      date: new Date().toLocaleDateString(),
      imageUri: image,
    };

    setSpendings([newSpending, ...spendings]);
    clearAll();
    setIsFormVisible(false);
  };

  const hideForm = () => {
    clearAll();
    setIsFormVisible(false);
  };

  const renderSpendingInputs = () => (
    <View style={styles.formContainer}>
      <ActionButton
        title="❌ Close"
        onPress={hideForm}
        styleOverride={{ marginBottom: 15 }}
      />

      <TextInput
        placeholder="Enter spending name (e.g., Coffee)"
        value={spendingName}
        onChangeText={setSpendingName}
        style={styles.input}
      />

      <TextInput
        placeholder="Enter bill amount manually"
        value={amountInput}
        onChangeText={(text) => setAmountInput(text.replace(/[^0-9.]/g, ""))}
        keyboardType="numeric"
        style={styles.input}
      />

      <View style={{ gap: 10 }}>
        <Text style={styles.subHeader}>Or, Scan Bill for Amount</Text>
        <View style={styles.buttonRow}>
          <ActionButton
            title={
              <>
                <Ionicons
                  name="images"
                  size={width * 0.05}
                  color={Colors.WHITE}
                />
                <Text> Gallery</Text>
              </>
            }
            onPress={pickImage("gallery")}
            disabled={isProcessing}
            styleOverride={styles.inlineActionButton}
          />
          <ActionButton
            title={
              <>
                <Ionicons
                  name="camera"
                  size={width * 0.05}
                  color={Colors.WHITE}
                />
                <Text> Camera</Text>
              </>
            }
            onPress={pickImage("camera")}
            disabled={isProcessing}
            styleOverride={styles.inlineActionButton}
          />
          <ActionButton
            title={
              <>
                <Ionicons
                  name="trash"
                  size={width * 0.05}
                  color={Colors.WHITE}
                />
                <Text> Clear</Text>
              </>
            }
            onPress={clearAll}
            disabled={isProcessing}
            styleOverride={styles.inlineActionButton}
          />
        </View>

        {isProcessing && (
          <View style={styles.processingView}>
            <ActivityIndicator size="small" color={Colors.BLUE} />
            <Text style={{ marginLeft: 10 }}>{extractedText}</Text>
          </View>
        )}

        {image && !isProcessing && (
          <>
            <Image
              source={{ uri: image }}
              contentFit="contain"
              style={styles.imagePreview}
            />
            <Text style={styles.ocrResult}>
              Extracted Total: {extractedText || "N/A"}
            </Text>
          </>
        )}
      </View>

      <ActionButton
        title={
          <>
            <Ionicons
              name="checkmark"
              size={width * 0.05}
              color={Colors.WHITE}
            />
            <Text> Record Spending</Text>
          </>
        }
        onPress={recordSpending}
        disabled={
          isProcessing || !spendingName.trim() || isNaN(parseFloat(amountInput))
        }
        styleOverride={{ marginTop: 15 }}
      />
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={{ gap: 10 }}>
        <Text style={styles.header}>💰 Record Spending</Text>

        {!isFormVisible && (
          <ActionButton
            title="➕ Add Spending"
            onPress={() => setIsFormVisible(true)}
            styleOverride={styles.addSpendingButton}
          />
        )}

        {isFormVisible && renderSpendingInputs()}

        <View style={styles.historySection}>
          <Text style={styles.historyHeader}>
            Recent Spendings ({spendings.length})
          </Text>
          {spendings.length === 0 ? (
            <Text style={styles.noDataText}>No spendings recorded yet.</Text>
          ) : (
            spendings.map((item) => <SpendingItem key={item.id} item={item} />)
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
    fontSize: width * 0.07,
    fontWeight: "bold",
  },
  subHeader: {
    fontSize: width * 0.045,
    fontWeight: "500",
  },
  historySection: {
    marginTop: 15,
  },
  historyHeader: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    fontSize: width * 0.04,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  actionButtonText: {
    textAlign: "center",
    color: Colors.WHITE,
    fontFamily: "outfitMedium",
    fontSize: width * 0.04,
  },
  primaryActionButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: width * 0.04,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: height * 0.02,
  },
  inlineActionButton: {
    flex: 1,
    paddingVertical: height * 0.02,
  },
  addSpendingButton: {
    paddingVertical: height * 0.02,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 10,
  },
  formContainer: {
    padding: width * 0.03,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  processingView: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f0f0ff",
    borderRadius: 8,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    marginTop: 10,
  },
  ocrResult: {
    fontSize: width * 0.045,
    marginTop: 10,
    fontWeight: "bold",
    color: "green",
  },
  spendingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  spendingName: {
    fontSize: width * 0.045,
    fontWeight: "600",
  },
  spendingDate: {
    fontSize: width * 0.035,
    color: "#888",
    marginTop: 2,
  },
  spendingAmount: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    color: "red",
  },
  noDataText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
});
