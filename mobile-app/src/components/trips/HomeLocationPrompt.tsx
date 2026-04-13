import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from "react-native";
import { Colors } from "@/src/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@/src/context/UserContext";
import { useLocation } from "@/src/context/LocationContext";
import { updateUserProfile } from "@/src/lib/api";
import { LocationData, NominatimResult } from "@/src/types/interfaces";

const { width } = Dimensions.get("window");

export default function HomeLocationPrompt() {
  const { userProfile, setUserProfile } = useUser();
  const { refreshGPS } = useLocation();
  const [loading, setLoading] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);

  if (userProfile?.homeLocation) return null;

  const formatLocationData = (data: NominatimResult, lat: number, lon: number): LocationData => {
    const address = data.address || {};
    let rawCity = address.city || address.town || address.village || address.state_district || "";
    let cleanCity = rawCity
      .replace(/City of /gi, "")
      .replace(/ City/gi, "")
      .replace(/ Greater/gi, "")
      .replace(/Greater /gi, "")
      .replace(/ District/gi, "")
      .replace(/ Ward/gi, "")
      .replace(/ Zone \d+/gi, "")
      .trim();

    const aliases: Record<string, string> = {
      "mumbai city": "Mumbai",
      bombay: "Mumbai",
      "new york city": "New York",
      "bengaluru city": "Bengaluru",
    };

    const finalCity = aliases[cleanCity.toLowerCase()] || cleanCity;
    const stateName = address.state || "";

    return {
      name: finalCity,
      label: `${finalCity}, ${stateName}`,
      fullAddress: data.display_name || "",
      country: address.country || "",
      countryCode: address.country_code || "",
      coordinates: { lat, lon },
    };
  };

  const handleGPSDetect = async () => {
    try {
      setLoading(true);
      const newData = await refreshGPS();
      if (newData) {
        const latitude = newData.coordinates.latitude || newData.coordinates.lat;
        const longitude = newData.coordinates.longitude || newData.coordinates.lon;
        
        if (latitude === undefined || longitude === undefined) return;

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
          { headers: { "User-Agent": "safar-travel-app", "Accept-Language": "en" } }
        );
        const data = await res.json();
        const formatted = formatLocationData(data, latitude, longitude);

        await saveLocation(formatted);
      }
    } catch (err) {
      console.log("HomeLocationPrompt GPS error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${text}&format=json&addressdetails=1`,
        { headers: { "User-Agent": "safar-travel-app" } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
    } catch (err) {
    }
  };

  const selectManualItem = async (item: NominatimResult) => {
    const formatted = formatLocationData(item, parseFloat(item.lat), parseFloat(item.lon));
    await saveLocation(formatted);
  };

  const saveLocation = async (data: LocationData) => {
    try {
      setLoading(true);
      await updateUserProfile({ home_location: data });
      setUserProfile((prev) => (prev ? { ...prev, homeLocation: data } : null));
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="location" size={24} color={Colors.SECONDARY} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Set Your Home Base</Text>
          <Text style={styles.subtitle}>
            Enter your city for better trip recommendations and localized travel ideas.
          </Text>

          {isManual ? (
            <View style={styles.searchSection}>
              <View style={styles.searchInputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Type your city..."
                  placeholderTextColor={Colors.GRAY}
                  autoFocus
                  value={query}
                  onChangeText={handleSearch}
                />
                <TouchableOpacity onPress={() => setIsManual(false)}>
                  <Text style={styles.cancelLink}>Cancel</Text>
                </TouchableOpacity>
              </View>

              {results.length > 0 && (
                <View style={styles.resultsList}>
                  {results.slice(0, 3).map((item) => (
                    <TouchableOpacity
                      key={item.place_id}
                      style={styles.resultItem}
                      onPress={() => selectManualItem(item)}
                    >
                      <Text style={styles.resultText} numberOfLines={1}>
                        {item.display_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.gpsBtn}
                onPress={handleGPSDetect}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="navigate" size={18} color="#fff" />
                    <Text style={styles.gpsBtnText}>Use GPS</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.manualBtn}
                onPress={() => setIsManual(true)}
              >
                <Text style={styles.manualBtnText}>Manually Select</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    marginTop: 10,
    marginBottom: 20,
  },
  card: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    gap: 15,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)", // Subtle Gold border
    shadowColor: Colors.SECONDARY,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.03)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: "outfitMedium",
    fontSize: 18,
    color: Colors.TEXT,
  },
  subtitle: {
    fontFamily: "outfit",
    fontSize: 13,
    color: Colors.MUTED_TEXT,
    marginTop: 4,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  gpsBtn: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },
  gpsBtnText: {
    color: "#fff",
    fontFamily: "outfitMedium",
    fontSize: 14,
  },
  manualBtn: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  manualBtnText: {
    color: Colors.TEXT,
    fontFamily: "outfit",
    fontSize: 14,
  },
  searchSection: {
    marginTop: 15,
  },
  searchInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.03)",
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontFamily: "outfit",
    fontSize: 14,
    color: Colors.TEXT,
  },
  cancelLink: {
    fontFamily: "outfit",
    fontSize: 14,
    color: Colors.MUTED_TEXT,
  },
  resultsList: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.02)",
  },
  resultText: {
    fontFamily: "outfit",
    fontSize: 13,
    color: Colors.TEXT,
  },
});
