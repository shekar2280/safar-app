import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React from "react";
import { Colors } from "../../constants/Colors";
import { useRouter } from "expo-router";
import { DiscoverIdeasList } from "../../constants/Options";
import DiscoverCard from "../../components/CreateTrip/DiscoverCard";
import GlobalLocationHeader from "../../components/GlobalLocationHeader";

const { width, height } = Dimensions.get("window");

export default function Discover() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <GlobalLocationHeader />
        <View style={styles.headerContent}>
          <Text style={styles.subtitle}>EXPLORE NEW HORIZONS</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Inspirations</Text>
            <View style={styles.goldDot} />
          </View>
        </View>
      </View>

      <FlatList
        data={DiscoverIdeasList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardWrapper}
            onPress={() => {
              if (item.tripCategory) {
                router.push({
                  pathname: item.route,
                  params: { tripCategory: item.tripCategory },
                });
              } else {
                router.push(item.route);
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
    backgroundColor: Colors.BACKGROUND,
  },
  header: {
    paddingHorizontal: width * 0.03,
    paddingTop: height * 0.05,
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
    paddingBottom: height * 0.16,
  },
});
