import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { ActionButton } from "./ActionButton";
import { Colors } from "../../constants/Colors";

const { width, height } = Dimensions.get("window");

export const SpendingForm = ({
  spendingName,
  amountInput,
  image,
  extractedText,
  isProcessing,
  setSpendingName,
  setAmountInput,
  hideForm,
  pickImage,
  clearAll,
  recordSpending,
}) => {
  const isRecordDisabled =
    isProcessing || !spendingName.trim() || isNaN(parseFloat(amountInput));

  return (
    <View style={styles.formContainer}>
      <ActionButton
        title="❌ Close"
        onPress={hideForm}
        styleOverride={styles.closeSpendingButton}
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
      <View style={{ gap: 10, marginTop: 10 }}>
        <Text style={styles.subHeader}>Or, Scan Bill for Amount</Text>
        <View style={styles.buttonRow}>
          <ActionButton
            title={
              <View style={styles.iconButtonContent}>
                <Ionicons
                  name="images"
                  size={width * 0.05}
                  color={Colors.WHITE}
                />
                <Text style={styles.inlineButtonText}> Gallery</Text>
              </View>
            }
            onPress={pickImage("gallery")}
            disabled={isProcessing}
            styleOverride={styles.inlineActionButton}
          />
          <ActionButton
            title={
              <View style={styles.iconButtonContent}>
                <Ionicons
                  name="camera"
                  size={width * 0.05}
                  color={Colors.WHITE}
                />
                <Text style={styles.inlineButtonText}> Camera</Text>
              </View>
            }
            onPress={pickImage("camera")}
            disabled={isProcessing}
            styleOverride={styles.inlineActionButton}
          />
          <ActionButton
            title={
              <View style={styles.iconButtonContent}>
                <Ionicons
                  name="trash"
                  size={width * 0.05}
                  color={Colors.WHITE}
                />
                <Text style={styles.inlineButtonText}> Clear</Text>
              </View>
            }
            onPress={clearAll}
            disabled={isProcessing}
            styleOverride={{
              ...styles.inlineActionButton,
              backgroundColor: Colors.RED,
            }}
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
              name="checkmark-circle"
              size={width * 0.05}
              color="green"
            />
            <Text style={styles.recordSpendingButtonText}> Record Spending</Text>
          </>
        }
        onPress={recordSpending}
        disabled={isRecordDisabled}
        styleOverride={{ marginTop: 20, padding:15, flexDirection:"row" }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    padding: width * 0.03,
    borderRadius: 10,
    backgroundColor: Colors.LIGHT_GREY,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#545454ff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  closeSpendingButton: {
    paddingVertical: height * 0.02,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 10,
  },
  subHeader: {
    fontSize: width * 0.045,
    fontWeight: "500",
    color: Colors.DARK_GREY,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    fontSize: width * 0.04,
    marginBottom: 10,
    backgroundColor: Colors.WHITE,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  inlineActionButton: {
    flex: 1,
    paddingVertical: height * 0.015,
  },
  iconButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  inlineButtonText: {
    color: Colors.WHITE,
    fontWeight: "500",
    fontSize: width * 0.04,
  },
  processingView: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  ocrResult: {
    fontSize: width * 0.045,
    marginTop: 10,
    fontWeight: "bold",
    color: "green",
    textAlign: "center",
    padding: 5,
    backgroundColor: "#e8f5e9",
    borderRadius: 5,
  },
  recordSpendingButtonText: {
    color: Colors.WHITE,
    fontWeight: "500",
    fontSize: width * 0.04,
  },
});
