import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors, useThemeColors } from "@/src/constants/colors";
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

  const country = userProfile?.homeLocation?.country || "India";
  const currentCity = userProfile?.homeLocation?.name || "Your Location";

  const { data: places = [], isLoading: loading } = useTrendingPlaces(country);
  const { isConnected } = useNetInfo();

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
        <View>
          <Text style={[styles.subtitle, { color: colors.GOLD }]}>POPULAR NEAR {currentCity?.toUpperCase()}</Text>
          <Text style={[styles.title, { color: colors.TEXT }]}>Trending Trips</Text>
        </View>
        <View style={{ width: 40 }} />
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
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
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
