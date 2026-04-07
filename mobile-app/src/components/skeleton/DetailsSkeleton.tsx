import React from "react";
import { View, StyleSheet, Dimensions, ScrollView } from "react-native";
import SkeletonBase from "./SkeletonBase";
import { Colors } from "@/src/constants/colors";

const { width, height } = Dimensions.get("window");
const SLIDESHOW_HEIGHT = height * 0.52;

export default function DetailsSkeleton() {
  return (
    <View style={styles.container}>
      {/* Hero Image Section */}
      <View style={styles.heroContainer}>
        <SkeletonBase height={SLIDESHOW_HEIGHT} radius={0} />
        
        {/* Back Button Skeleton */}
        <View style={styles.backBtn}>
          <SkeletonBase width={40} height={40} radius={20} />
        </View>

        {/* Hero Text Overlay Simulation */}
        <View style={styles.heroText}>
          <SkeletonBase width="70%" height={32} radius={6} />
          <View style={{ height: 10 }} />
          <SkeletonBase width="40%" height={18} radius={4} />
        </View>
      </View>

      {/* Content Sheet */}
      <View style={styles.contentSheet}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={{ padding: 20 }}>
            {/* Weather Widget Skeleton */}
            <SkeletonBase height={80} radius={16} />
            <View style={{ height: 30 }} />

            {/* Section 1: Hotels */}
            <SkeletonBase width={150} height={24} radius={4} />
            <View style={{ height: 15 }} />
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <SkeletonBase width={width * 0.6} height={180} radius={12} />
              <SkeletonBase width={width * 0.6} height={180} radius={12} />
            </View>

            <View style={{ height: 40 }} />

            {/* Section 2: Itinerary */}
            <SkeletonBase width={180} height={24} radius={4} />
            <View style={{ height: 15 }} />
            <SkeletonBase height={100} radius={12} />
            <View style={{ height: 15 }} />
            <SkeletonBase height={100} radius={12} />
            <View style={{ height: 15 }} />
            <SkeletonBase height={100} radius={12} />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  heroContainer: {
    height: SLIDESHOW_HEIGHT,
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  heroText: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
  },
  contentSheet: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    marginTop: -20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
  }
});
