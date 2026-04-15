import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ErrorScreenProps {
  error: any;
  componentStack: string | null;
  eventId: string | null;
  resetError: () => void;
}

export const ErrorScreen = ({ error, resetError }: ErrorScreenProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#FF6B6B" />
        </View>
        
        <Text style={styles.title}>Oops! Something went wrong</Text>
        <Text style={styles.message}>
          We've encountered an unexpected error. Our team has been notified.
        </Text>

        <View style={styles.errorBox}>
          <Text style={styles.errorText} numberOfLines={3}>
            {error.message}
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={resetError}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
        
        <Text style={styles.footer}>
          If the problem persists, please contact support.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  errorBox: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  errorText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontFamily: "monospace",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    marginTop: 24,
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
  },
});
