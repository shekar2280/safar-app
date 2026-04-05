import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/src/constants/colors";
import { useRouter } from "expo-router";
import { DiscoverIdeasList } from "@/src/constants/travel-data";
import DiscoverCard from "@/src/components/trip/DiscoverCard";
import HomeLocationPrompt from "@/src/components/trips/HomeLocationPrompt";
import GlobalLocationHeader from "@/src/components/common/GlobalLocationHeader";

const { width, height } = Dimensions.get("window");

export default function Discover() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.subtitle}>EXPLORE NEW HORIZONS</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Inspirations</Text>
            <View style={styles.goldDot} />
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: width * 0.03 }}>
        <HomeLocationPrompt />
      </View>

      <FlatList
        data={DiscoverIdeasList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardWrapper}
            onPress={() => {
              if (item.tripCategory) {
                router.push({
                  pathname: item.route as any,
                  params: { tripCategory: item.tripCategory },
                });
              } else {
                router.push(item.route as any);
              }
            }}
          >
            <DiscoverCard option={item} cardHeight={height * 0.16} />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.title}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
    paddingHorizontal: width * 0.01,
    paddingBottom: 15,
  },
  headerContent: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  subtitle: {
    fontFamily: "outfitMedium",
    fontSize: 11,
    color: Colors.MUTED_TEXT,
    letterSpacing: 3,
    marginBottom: 0,
    textTransform: "uppercase",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: -4,
  },
  title: {
    fontFamily: "playfairBold",
    fontSize: 40,
    color: Colors.TEXT,
    lineHeight: 48,
  },
  goldDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.SECONDARY,
    marginLeft: 2,
    marginBottom: 8,
  },
  cardWrapper: {
    marginVertical: 10,
  },
  listContent: {
    paddingHorizontal: width * 0.03,
    paddingBottom: 160,
  },
});
