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
import { Colors } from "@/src/constants/colors";
import { FestiveTripIdeas } from "@/src/constants/travel-data";
import DiscoverCard from "@/src/components/trip/DiscoverCard";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function FestiveTrips() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleSelect = (item: any) => {
    router.push({
      pathname: "/create-trip",
      params: {
        destName: item.title,
        destCountry: item.country,
        destCountryCode: item.countryCode,
        destPhoto: typeof item.image === "string" ? item.image : undefined,
        festival: item.festival,
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={Colors.PRIMARY} />
        </TouchableOpacity>
        <View>
          <Text style={styles.subtitle}>CULTURAL CELEBRATIONS</Text>
          <Text style={styles.title}>Festive Getaways</Text>
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
              cardHeight={height * 0.22} 
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
    backgroundColor: Colors.WHITE,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
  },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontFamily: "outfitMedium",
    fontSize: 10,
    color: Colors.SECONDARY,
    letterSpacing: 2.5,
  },
  title: {
    fontFamily: "playfairBold",
    fontSize: 28,
    color: Colors.PRIMARY,
    marginTop: -2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cardContainer: {
    marginVertical: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
});
