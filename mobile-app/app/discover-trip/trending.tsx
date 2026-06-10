import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors, useThemeColors } from "@/src/constants/colors";
import { POPULAR_COUNTRIES_LIST } from "@/src/constants/discover";
import { useTheme } from "@/src/context/ThemeContext";
import DiscoverCard from "@/src/components/trip/DiscoverCard";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "@/src/context/UserContext";
import { useTrendingPlaces } from "@/src/hooks/queries/useTrendingPlaces";
import { useNetInfo } from "@react-native-community/netinfo";
import Button from "@/src/components/common/Button";

const { width, height } = Dimensions.get("window");

export default function TrendingTrips() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userProfile } = useUser();
  const colors = useThemeColors();
  const { isDark } = useTheme();
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const params = useLocalSearchParams();

  const paramCountry = params.country as string | undefined;
  const defaultCountry = paramCountry || "India";
  const defaultCity = paramCountry ? paramCountry : "Your Location";

  const [activeCountry, setActiveCountry] = useState(defaultCountry);
  const [activeCity, setActiveCity] = useState(defaultCity);
  const [searchInput, setSearchInput] = useState("");

  const isHomeCountry = activeCountry === "India";
  const displayCity = isHomeCountry ? defaultCity : activeCountry;

  const { data: places = [], isLoading: loading } = useTrendingPlaces(activeCountry);
  const { isConnected } = useNetInfo();

  const POPULAR_COUNTRIES = [
    { name: "India", label: "📍 Near Me" },
    ...POPULAR_COUNTRIES_LIST
  ];

  const uniqueCountries = POPULAR_COUNTRIES.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i);

  const handleSelect = (item: any) => {
    router.push({
      pathname: "/create-trip",
      params: {
        destName: item.name,
        destCountry: item.country,
        destPhoto: item.image,
        insight: item.insight,
        recommendedMonth: item.recommended_month || item.recommendedMonth,
        tripCategory: "TRENDING",
      },
    });
  };

  if (isConnected === false && places.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.BACKGROUND, paddingTop: insets.top }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View style={[styles.header, { borderBottomColor: colors.BORDER }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color={colors.TEXT} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.subtitle, { color: colors.GOLD }]}>OFFLINE MODE</Text>
            <Text style={[styles.title, { color: colors.TEXT }]}>Trending Trips</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="wifi-off" size={60} color={colors.MUTED_TEXT} />
          <Text style={[styles.errorTitle, { color: colors.TEXT }]}>Connection Required</Text>
          <Text style={[styles.errorDesc, { color: colors.MUTED_TEXT }]}>
            Trending destinations are tailored to your current country and require an internet connection to load.
          </Text>
          <Button
            title="GO BACK"
            onPress={() => router.back()}
            style={{ width: width * 0.6, marginTop: 20 }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={[styles.header, { borderBottomColor: colors.BORDER }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={colors.TEXT} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.subtitle, { color: colors.GOLD }]}>
            DISCOVER
          </Text>
          <Text
            style={[styles.title, { color: colors.TEXT }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {isHomeCountry ? `Popular near ${displayCity}` : `Trending in ${displayCity}`}
          </Text>
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }]}>
          <Ionicons name="search" size={18} color={colors.MUTED_TEXT} />
          <TextInput
            style={[styles.searchInput, { color: colors.TEXT }]}
            placeholder="Search any country..."
            placeholderTextColor={colors.MUTED_TEXT}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={() => {
              if (searchInput.trim().length > 2) {
                setActiveCountry(searchInput.trim());
              }
            }}
            returnKeyType="search"
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={() => setSearchInput("")}>
              <Ionicons name="close-circle" size={18} color={colors.MUTED_TEXT} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}
          style={styles.chipsContainer}
        >
          {uniqueCountries.map((c) => {
            const isActive = activeCountry.toLowerCase() === c.name.toLowerCase();
            return (
              <TouchableOpacity
                key={c.name}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? colors.GOLD : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"),
                    borderColor: isActive ? colors.GOLD : "transparent"
                  }
                ]}
                onPress={() => {
                  setActiveCountry(c.name);
                  setSearchInput("");
                }}
              >
                <Text style={[
                  styles.chipText,
                  { color: isActive ? "#000" : colors.TEXT, fontFamily: isActive ? "outfitBold" : "outfitMedium" }
                ]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
          <Text style={[styles.loadingText, { color: colors.MUTED_TEXT }]}>Finding trending spots...</Text>
        </View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          getItemLayout={(_data, index) => ({
            length: height * 0.20 + 14,
            offset: (height * 0.20 + 14) * index,
            index,
          })}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              style={styles.cardContainer}
            >
              <DiscoverCard
                option={item}
                cardHeight={height * 0.20}
                hideTag={true}
              />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 5,
  },
  subtitle: {
    fontFamily: "outfitMedium",
    fontSize: 10,
    letterSpacing: 2,
  },
  title: {
    fontFamily: "playfairBold",
    fontSize: 22,
  },
  searchSection: {
    paddingTop: 15,
    paddingBottom: 5,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    fontFamily: "outfit",
    fontSize: 15,
    marginLeft: 10,
    height: "100%",
  },
  chipsContainer: {
    maxHeight: 40,
  },
  chipsContent: {
    paddingHorizontal: 15,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chipText: {
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },
  loadingText: {
    fontFamily: "outfit",
    fontSize: 15,
  },
  errorTitle: {
    fontFamily: "playfairBold",
    fontSize: 24,
    marginTop: 10,
  },
  errorDesc: {
    fontFamily: "outfit",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 40,
    marginTop: 10,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 14,
  },
  cardContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
});
