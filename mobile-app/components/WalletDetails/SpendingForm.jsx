import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { ActionButton } from "./ActionButton";
import { Colors } from "../../constants/Colors";

const { width } = Dimensions.get("window");

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
  const isRecordDisabled = isProcessing || !spendingName.trim() || isNaN(parseFloat(amountInput));

  return (
    <View style={styles.formCard}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Add New Expense</Text>
          <Text style={styles.subtitle}>Fill in the details below</Text>
        </View>
        <TouchableOpacity onPress={hideForm} style={styles.closeIconButton}>
          <Ionicons name="close" size={24} color={Colors.GRAY} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputSection}>
        <View style={styles.inputWrapper}>
          <Ionicons name="pencil-outline" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
          <TextInput
            placeholder="What did you spend on?"
            value={spendingName}
            onChangeText={setSpendingName}
            style={styles.textInput}
            placeholderTextColor={Colors.GRAY}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="cash-outline" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
          <TextInput
            placeholder="0.00"
            value={amountInput}
            onChangeText={(text) => setAmountInput(text.replace(/[^0-9.]/g, ""))}
            keyboardType="numeric"
            style={styles.textInput}
            placeholderTextColor={Colors.GRAY}
          />
          <Text style={styles.currencySuffix}>INR</Text>
        </View>
      </View>

      {/* OCR / Image Section */}
      {/* <View style={styles.scanSection}>
        <Text style={styles.sectionLabel}>Or scan your receipt</Text>
        <View style={styles.scanRow}>
          <TouchableOpacity style={styles.scanButton} onPress={pickImage("camera")}>
            <Ionicons name="camera" size={22} color={Colors.PRIMARY} />
            <Text style={styles.scanButtonText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.scanButton} onPress={pickImage("gallery")}>
            <Ionicons name="images" size={22} color={Colors.PRIMARY} />
            <Text style={styles.scanButtonText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="small" color={Colors.PRIMARY} />
            <Text style={styles.processingText}>{extractedText}</Text>
          </View>
        )}

        {image && !isProcessing && (
          <View style={styles.previewWrapper}>
            <Image source={{ uri: image }} contentFit="cover" style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageBtn} onPress={clearAll}>
              <Ionicons name="trash" size={18} color={Colors.WHITE} />
            </TouchableOpacity>
            {extractedText && (
              <View style={styles.ocrBadge}>
                <Text style={styles.ocrBadgeText}>Detected: ₹{amountInput}</Text>
              </View>
            )}
          </View>
        )}
      </View> */}
      
      <View style={styles.footerActions}>
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={clearAll}
        >
          <Ionicons name="refresh-outline" size={20} color={Colors.RED} />
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>

        <ActionButton
          title={
            <View style={styles.recordContent}>
              <Ionicons name="checkmark-circle" size={22} color={Colors.WHITE} />
              <Text style={styles.recordText}>Save</Text>
            </View>
          }
          onPress={recordSpending}
          disabled={isRecordDisabled}
          styleOverride={styles.recordButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 24,
    padding: 24,
    width: width * 0.9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "outfitBold",
    color: Colors.BLACK,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "outfit",
    color: Colors.GRAY,
    marginTop: 2,
  },
  closeIconButton: {
    padding: 4,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
  },
  inputSection: {
    gap: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "outfitMedium",
    color: Colors.BLACK,
  },
  currencySuffix: {
    fontFamily: "outfitBold",
    color: Colors.PRIMARY,
    fontSize: 12,
  },
  scanSection: {
    marginTop: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: "outfitMedium",
    color: Colors.GRAY,
    marginBottom: 10,
  },
  scanRow: {
    flexDirection: "row",
    gap: 12,
  },
  scanButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.WHITE,
    borderWidth: 1.5,
    borderColor: Colors.PRIMARY,
    borderRadius: 12,
    height: 48,
  },
  scanButtonText: {
    fontFamily: "outfitBold",
    color: Colors.PRIMARY,
    fontSize: 14,
  },
  previewWrapper: {
    marginTop: 15,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 120,
    borderRadius: 16,
  },
  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.RED,
    padding: 6,
    borderRadius: 20,
  },
  ocrBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ocrBadgeText: {
    color: Colors.WHITE,
    fontSize: 12,
    fontFamily: "outfitBold",
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 15,
    padding: 12,
    backgroundColor: "#F0F7FF",
    borderRadius: 12,
  },
  processingText: {
    color: Colors.PRIMARY,
    fontSize: 13,
    fontFamily: "outfitMedium",
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 24,
  },
  clearButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.RED,
  },
  clearText: {
    color: Colors.RED,
    fontFamily: "outfitBold",
    fontSize: 16,
  },
  recordButton: {
    flex: 2,
    height: 56,
    borderRadius: 16,
  },
  recordContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recordText: {
    color: Colors.WHITE,
    fontFamily: "outfitBold",
    fontSize: 16,
  },
});