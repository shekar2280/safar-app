import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, useThemeColors } from "@/src/constants/colors";
import { CITY_ALIASES } from "@/src/constants/discover";
import { useTheme } from "@/src/context/ThemeContext";
import { DestinationData, DestinationPickerProps, NominatimResult, AlertType } from "@/src/constants";
import SafarAlert from "@/src/components/ui/SafarAlert";
import * as Sentry from "@sentry/react-native";
import { useRouter } from "expo-router";

export default function DestinationPicker({
  onLocationSelect,
  placeholder = "Search destination...",
  value,
}: DestinationPickerProps & { value?: DestinationData | null }) {
  const colors = useThemeColors();
  const { isDark } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState(value?.name || "");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [selected, setSelected] = useState<DestinationData | null>(value || null);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownLayout, setDropdownLayout] = useState<{ x: number; y: number; width: number } | null>(null);
  const inputRef = useRef<View>(null);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (value) {
      if (value.coordinates && (value.coordinates.lat !== 0 || value.coordinates.lon !== 0)) {
        setQuery(value.name);
        setSelected(value);
      } else if (value.name) {
        setQuery(value.name);
        setLoading(true);
        fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value.name)}&format=json&addressdetails=1`,
          { headers: { "User-Agent": "safar-travel-app" } }
        )
          .then((res) => res.json())
          .then((data: NominatimResult[]) => {
            if (data && data.length > 0) {
              handleSelect(data[0]);
            }
            setLoading(false);
          })
          .catch((err) => {
            Sentry.captureException(err, { extra: { context: "DestinationPicker:initialHydrate" } });
            setLoading(false);
          });
      }
    } else {
      setQuery("");
      setSelected(null);
    }
  }, [value?.name]);

  useEffect(() => {
    if (query.length < 3 || selected) {
      if (!selected) setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=8`,
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
        .catch((err) => {
          Sentry.captureException(err, { extra: { context: "DestinationPicker:bgSearch" } });
          setLoading(false);
        });
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, selected]);

  const handleSelect = (item: NominatimResult) => {
    const addr = item.address;

    const isCountry = item.addresstype === "country" || item.type === "administrative" && !addr?.city && !addr?.town && !addr?.municipality && addr?.country && !addr?.state;

    if (isCountry) {
      const countryName = addr?.country || item.display_name.split(",")[0].trim();
      setQuery(countryName);
      setResults([]);
      setSelected(null);
      onLocationSelect(null);
      Keyboard.dismiss();
      router.push({
        pathname: "/discover-trip/trending",
        params: { country: countryName },
      } as any);
      return;
    }

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

    const finalName = CITY_ALIASES[cleanName.toLowerCase()] || cleanName;

    const locationInfo: DestinationData = {
      name: finalName,
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
    setIsFocused(false);
    Keyboard.dismiss();
    onLocationSelect(locationInfo);
  };

  const clearInput = () => {
    setQuery("");
    setResults([]);
    setSelected(null);
    setIsFocused(false);
    onLocationSelect(null);
  };

  const showDropdown = results.length > 0 && isFocused && !selected;

  const measureInput = () => {
    if (inputRef.current) {
      inputRef.current.measure((_x: number, _y: number, width: number, height: number, pageX: number, pageY: number) => {
        setDropdownLayout({ x: pageX, y: pageY + height + 6, width });
      });
    }
  };

  const getIconForType = (item: NominatimResult) => {
    const type = item.addresstype || item.type || "";
    if (type === "country") return "earth-outline";
    if (type === "state" || type === "province") return "map-outline";
    if (type === "city" || type === "town" || type === "municipality") return "business-outline";
    if (type === "tourism" || item.category === "tourism") return "camera-outline";
    return "location-outline";
  };

  return (
    <View style={styles.mainWrapper}>
      {/* Input Row */}
      <View
        ref={inputRef}
        style={[styles.inputCapsule, {
          backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.035)",
          borderColor: isFocused ? colors.GOLD : "transparent",
          borderWidth: isFocused ? 1 : 0,
        }]}
      >
        <View style={styles.labelSection}>
          <Text style={[styles.label, { color: colors.GOLD }]}>TO</Text>
        </View>
        <TextInput
          style={[styles.inputStyle, { color: colors.TEXT }]}
          placeholderTextColor={colors.MUTED_TEXT}
          selectionColor={colors.GOLD}
          placeholder={placeholder}
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setSelected(null);
            setIsFocused(true);
            onLocationSelect(null);
          }}
          onFocus={() => {
            setIsFocused(true);
            measureInput();
          }}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          autoCorrect={false}
        />
        <View style={styles.actionSection}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.GOLD} />
          ) : query.length > 0 ? (
            <TouchableOpacity onPress={clearInput} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={20} color={colors.MUTED_TEXT} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="search-outline" size={18} color={colors.MUTED_TEXT} />
          )}
        </View>
      </View>

      {/* Dropdown rendered in Modal to avoid FlatList-in-ScrollView error */}
      <Modal
        visible={showDropdown && !!dropdownLayout}
        transparent
        animationType="none"
        onRequestClose={() => setIsFocused(false)}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => setIsFocused(false)}
        />
        {dropdownLayout && (
          <View style={[
            styles.dropdown,
            {
              position: "absolute",
              top: dropdownLayout.y,
              left: dropdownLayout.x,
              width: dropdownLayout.width,
              backgroundColor: isDark ? "rgba(18,18,24,0.98)" : "rgba(255,255,255,0.98)",
              borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              shadowColor: colors.PRIMARY,
            }
          ]}>
            <FlatList
              data={results}
              keyExtractor={(item) => String(item.place_id)}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 300 }}
              renderItem={({ item, index }) => {
                const [mainName, ...rest] = item.display_name.split(",");
                const subLabel = rest.slice(0, 2).join(",").trim();
                const isCountry = item.addresstype === "country";
                const icon = getIconForType(item);
                return (
                  <>
                    {index > 0 && (
                      <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }]} />
                    )}
                    <TouchableOpacity
                      onPress={() => handleSelect(item)}
                      style={styles.suggestionItem}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.iconCircle, {
                        backgroundColor: isCountry
                          ? (isDark ? "rgba(255,191,0,0.12)" : "rgba(255,191,0,0.08)")
                          : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)")
                      }]}>
                        <Ionicons
                          name={icon as any}
                          size={15}
                          color={isCountry ? colors.GOLD : colors.MUTED_TEXT}
                        />
                      </View>
                      <View style={styles.textWrap}>
                        <Text style={[styles.mainText, { color: colors.TEXT }]} numberOfLines={1}>
                          {mainName.trim()}
                        </Text>
                        {subLabel ? (
                          <Text style={[styles.subText, { color: colors.MUTED_TEXT }]} numberOfLines={1}>
                            {subLabel}
                          </Text>
                        ) : null}
                      </View>
                      {isCountry && (
                        <View style={[styles.countryBadge, { backgroundColor: isDark ? "rgba(255,191,0,0.15)" : "rgba(255,191,0,0.1)" }]}>
                          <Text style={[styles.countryBadgeText, { color: colors.GOLD }]}>EXPLORE</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </>
                );
              }}
            />
          </View>
        )}
      </Modal>

      <SafarAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type="error"
        confirmText="OK"
        onConfirm={() => setAlertVisible(false)}
        onCancel={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { zIndex: 1000, width: "100%" },
  inputCapsule: {
    flexDirection: "row",
    alignItems: "center",
    height: 65,
    borderRadius: 22,
    paddingHorizontal: 20,
  },
  labelSection: { width: 40 },
  label: {
    fontFamily: "outfitBold",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  inputStyle: {
    flex: 1,
    fontFamily: "outfitBold",
    fontSize: 18,
    padding: 0,
    height: "100%",
    borderWidth: 0,
  },
  actionSection: { paddingLeft: 10 },
  clearBtn: { padding: 2 },
  dropdown: {
    position: "absolute",
    top: 72,
    left: 0,
    right: 0,
    zIndex: 9999,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 12,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1 },
  mainText: {
    fontFamily: "outfitBold",
    fontSize: 15,
  },
  subText: {
    fontFamily: "outfit",
    fontSize: 12,
    marginTop: 2,
  },
  countryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countryBadgeText: {
    fontFamily: "outfitBold",
    fontSize: 9,
    letterSpacing: 1,
  },
});
