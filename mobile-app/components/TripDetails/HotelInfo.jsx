import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Dimensions,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image"; 
import { Colors } from "../../constants/Colors";
import { LOCAL_HOTEL_IMAGES } from "../../constants/Options";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const COLLAGE_HEIGHT = 480;

const getOptimizedCloudinaryUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_400,h_500,c_fill/");
};

export default function HotelInfo({ cityName }) {
  const openHotelInMaps = (city) => {
    const query = encodeURIComponent(`Hotels in ${city}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;

    Linking.openURL(url).catch((err) => {
      console.error("Linking Error:", err);
      Alert.alert("Error", "Could not open maps.");
    });
  };

  const FloatingPhoto = ({ index, size, top, left, rotation, zIndex }) => {
    const [isImageLoading, setIsImageLoading] = useState(true);
    const imageUri = LOCAL_HOTEL_IMAGES[index % LOCAL_HOTEL_IMAGES.length];
    
    // Staggered entrance and drift loop
    const delay = index * 100;
    const driftDuration = 3000 + (index * 500);

    return (
      <MotiView 
        from={{ opacity: 0, scale: 0.85, translateY: 10 }}
        animate={{ opacity: 1, scale: 1, translateY: [0, -6, 0] }}
        transition={{
          opacity: { type: "timing", duration: 800, delay },
          scale: { type: "spring", delay },
          translateY: {
            type: "timing",
            duration: driftDuration,
            loop: true,
            delay: delay + 800, // Start drift after entrance
          }
        }}
        style={[styles.photoFrame, { 
          width: size.w, 
          height: size.h, 
          top: top, 
          left: left, 
          zIndex: zIndex,
          transform: [{ rotate: rotation }] 
        }]}
      >
         <Image
            source={{ uri: getOptimizedCloudinaryUrl(imageUri) }}
            style={styles.photoImage}
            onLoadEnd={() => setIsImageLoading(false)}
            contentFit="cover"
         />
         {isImageLoading && (
            <ActivityIndicator style={styles.loader} color={Colors.SECONDARY} />
         )}
         <View style={styles.whiteBorder} />
      </MotiView>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.overline}>STAY INSPIRATION</Text>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Boutique Vibes</Text>
          <View style={styles.goldDot} />
        </View>
      </View>

      <View style={styles.collageContainer}>
         {/* 1. Main big portrait (left-center) */}
         <FloatingPhoto 
            index={0} 
            size={{ w: width * 0.44, h: 260 }} 
            top={20} 
            left={0} 
            rotation="-2deg" 
            zIndex={2}
         />
         
         {/* 2. Smaller square (top-right) */}
         <FloatingPhoto 
            index={1} 
            size={{ w: width * 0.35, h: 140 }} 
            top={10} 
            left={width * 0.52} 
            rotation="3deg" 
            zIndex={1}
         />

         {/* 3. Medium landscape (right-center, overlapping) */}
         <FloatingPhoto 
            index={2} 
            size={{ w: width * 0.5, h: 160 }} 
            top={160} 
            left={width * 0.42} 
            rotation="-1deg" 
            zIndex={3}
         />

         {/* 4. Small square (bottom-left) */}
         <FloatingPhoto 
            index={3} 
            size={{ w: width * 0.3, h: 120 }} 
            top={300} 
            left={width * 0.04} 
            rotation="5deg" 
            zIndex={4}
         />

         {/* 5. Portrait (bottom-right) */}
         <FloatingPhoto 
            index={4} 
            size={{ w: width * 0.38, h: 180 }} 
            top={280} 
            left={width * 0.55} 
            rotation="-3deg" 
            zIndex={2}
         />
      </View>

      {/* 🚀 PROMINENT SEARCH CTA */}
      <View style={styles.ctaContainer}>
         <Text style={styles.ctaSubtitle}>
            We've curated the vibe. Now find the perfect match for your dates.
         </Text>
         <TouchableOpacity
            activeOpacity={0.9}
            style={styles.searchButton}
            onPress={() => openHotelInMaps(cityName)}
         >
            <LinearGradient
               colors={[Colors.PRIMARY, "#2C2C2C"]}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 0 }}
               style={styles.gradientBtn}
            >
               <Ionicons name="search-outline" size={20} color={Colors.WHITE} style={{ marginRight: 10 }} />
               <Text style={styles.searchButtonText}>Search Hotels in {cityName}</Text>
            </LinearGradient>
         </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 0 },
  header: {
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  overline: {
    fontFamily: "outfitMedium",
    fontSize: 10,
    color: Colors.MUTED_TEXT,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: -4,
  },
  sectionTitle: {
    fontSize: 28,
    fontFamily: "playfairBold",
    color: Colors.TEXT,
  },
  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.SECONDARY,
    marginLeft: 4,
    marginBottom: 6,
  },
  collageContainer: {
    height: COLLAGE_HEIGHT,
    width: "100%",
    position: "relative",
    marginVertical: 10,
  },
  photoFrame: {
    position: "absolute",
    backgroundColor: "white",
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 15,
  },
  whiteBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#EEE",
  },
  loader: { 
    position: "absolute", 
    alignSelf: "center", 
    top: "45%" 
  },
  ctaContainer: {
    marginTop: -10, // Pull up closer to the collage
    paddingHorizontal: 4,
    alignItems: "center",
  },
  ctaSubtitle: {
    fontFamily: "outfit",
    fontSize: 14,
    color: Colors.MUTED_TEXT,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  searchButton: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  gradientBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  searchButtonText: {
    color: Colors.WHITE,
    fontFamily: "outfitBold",
    fontSize: 16,
  },
});
