import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors, useThemeColors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { FestiveTripIdeas } from "@/src/constants";
import DiscoverCard from "@/src/components/trip/DiscoverCard";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function FestiveTrips() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();
  const { isDark } = useTheme();

  const handleSelect = (item: any) => {
    router.push({
      pathname: "/create-trip",
      params: {
        destName: item.title,
        destCountry: item.country,
        destCountryCode: item.countryCode,
        destPhoto: typeof item.image === "string" ? item.image : undefined,
        festival: item.festival,
        auspiciousDay: item.auspiciousDay,
        insight: item.insight,
        tripCategory: "FESTIVE",
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC" }]}>
          <Ionicons name="chevron-back" size={28} color={colors.TEXT} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.subtitle, { color: colors.GOLD }]}>CULTURAL CELEBRATIONS</Text>
          <Text style={[styles.title, { color: colors.TEXT }]}>Festive Getaways</Text>
        </View>
      </View>

      <FlatList
        data={FestiveTripIdeas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleSelect(item)}
            style={styles.cardContainer}
          >
            <DiscoverCard
              option={{
                ...item,
                title: item.name,
                desc: item.festival,
              } as any}
              cardHeight={height * 0.20}
              hideTag={true}
            />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 15,
  },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontFamily: "outfitMedium",
    fontSize: 10,
    letterSpacing: 2.5,
  },
  title: {
    fontFamily: "playfairBold",
    fontSize: 28,
    marginTop: -2,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 40,
  },
  cardContainer: {
    marginVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
});
