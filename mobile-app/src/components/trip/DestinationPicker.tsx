import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import Autocomplete from "react-native-autocomplete-input";
const AutocompleteInput = Autocomplete as any;
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/colors";
import { DestinationData, DestinationPickerProps, NominatimResult } from "@/src/types/interfaces";

export default function DestinationPicker({
  onLocationSelect,
  placeholder = "Search destination...",
}: DestinationPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [selected, setSelected] = useState<DestinationData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 3 || selected) {
      if (!selected) setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1`,
        {
          headers: {
            "User-Agent": "safar-travel-app",
            "Accept-Language": "en",
          },
        }
      )
        .then((res) => res.json())
        .then((data: NominatimResult[]) => {
          setResults(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, selected]);

  const handleSelect = (item: NominatimResult) => {
    const addr = item.address;
    let rawCity =
      addr?.city ||
      addr?.town ||
      addr?.municipality ||
      addr?.village ||
      addr?.suburb ||
      item.display_name.split(",")[0];

    const countryCode = addr?.country_code || "";
    const countryName = addr?.country || "";

    let cleanName = rawCity
      .replace(/City of /gi, "")
      .replace(/ Greater/gi, "")
      .replace(/Greater /gi, "")
      .replace(/ District/gi, "")
      .replace(/ Ward/gi, "")
      .replace(/ Zone \d+/gi, "")
      .trim();

    const cityAliases: Record<string, string> = {
      "london": "London",
      "mumbai city": "Mumbai",
      "bombay": "Mumbai",
      "new york city": "New York",
      "bengaluru urban": "Bengaluru",
    };

    const finalName = cityAliases[cleanName.toLowerCase()] || cleanName;

    const locationInfo: DestinationData = {
      name: item.display_name,
      shortName: finalName,
      country: countryName,
      countryCode,
      coordinates: {
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      },
    };

    setQuery(finalName);
    setResults([]);
    setSelected(locationInfo);
    onLocationSelect(locationInfo);
  };

  const clearInput = () => {
    setQuery("");
    setResults([]);
    setSelected(null);
    onLocationSelect(null);
  };

  return (
    <View style={styles.mainWrapper}>
      <AutocompleteInput
        data={results}
        defaultValue={query}
        autoCorrect={false}
        onChangeText={(text: string) => {
          setQuery(text);
          setSelected(null);
          onLocationSelect(null);
        }}
        placeholder={placeholder}
        containerStyle={styles.autocompleteContainer}
        inputContainerStyle={{ borderWidth: 0 }}
        listStyle={{ borderWidth: 0 }}
        renderTextInput={(props: any) => (
          <View style={styles.inputCapsule}>
            <View style={styles.labelSection}>
              <Text style={styles.label}>TO</Text>
            </View>
            <TextInput
              {...props}
              style={styles.inputStyle}
              placeholderTextColor={Colors.GRAY}
              selectionColor={Colors.SECONDARY}
            />
            <View style={styles.actionSection}>
              {loading ? (
                <ActivityIndicator size="small" color={Colors.SECONDARY} />
              ) : query.length > 0 ? (
                <TouchableOpacity onPress={clearInput}>
                  <Ionicons name="close-circle" size={20} color={Colors.MUTED_TEXT} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}
        listContainerStyle={styles.suggestionList}
        flatListProps={{
          scrollEnabled: false,
          nestedScrollEnabled: true,
          keyExtractor: (item: NominatimResult) => String(item.place_id),
          renderItem: ({ item }: { item: NominatimResult }) => {
            const [mainName, ...rest] = item.display_name.split(",");
            return (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={styles.suggestionItem}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="map" size={14} color={Colors.SECONDARY} />
                </View>
                <View style={styles.textWrap}>
                  <Text style={styles.mainText} numberOfLines={1}>{mainName.trim()}</Text>
                  <Text style={styles.subText} numberOfLines={1}>{rest.join(",").trim()}</Text>
                </View>
              </TouchableOpacity>
            );
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { zIndex: 1000, width: "100%", height: 75 },
  autocompleteContainer: { width: "100%", position: "absolute", zIndex: 10, borderWidth: 0 },
  inputCapsule: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.035)",
    height: 65,
    borderRadius: 22,
    paddingHorizontal: 20,
  },
  labelSection: { width: 40 },
  label: {
    fontFamily: "outfitBold",
    fontSize: 10,
    color: Colors.SECONDARY,
    letterSpacing: 1.5,
  },
  inputStyle: {
    flex: 1,
    fontFamily: "outfitBold",
    fontSize: 18,
    color: Colors.PRIMARY,
    padding: 0,
    height: "100%",
    borderWidth: 0,
  },
  actionSection: { paddingLeft: 10 },
  suggestionList: {
    backgroundColor: Colors.WHITE,
    borderRadius: 24,
    marginTop: 10,
    maxHeight: 280,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.WHITE,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.03)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textWrap: { flex: 1 },
  mainText: {
    fontFamily: "outfitBold",
    fontSize: 15,
    color: Colors.PRIMARY,
  },
  subText: {
    fontFamily: "outfit",
    fontSize: 12,
    color: Colors.MUTED_TEXT,
    marginTop: 1,
  },
});
