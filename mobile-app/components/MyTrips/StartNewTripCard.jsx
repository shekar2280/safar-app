import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/Colors';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get("window");

export default function StartNewTripCard() {
  const router = useRouter();

  return (
    <View
      style={{
        padding: width * 0.06,
        marginTop: height * 0.06,
        alignItems: 'center',
        gap: height * 0.025,
      }}
    >
      <LottieView
        source={require('../../assets/animations/notrips.json')}
        autoPlay
        loop
        style={{
          width: width * 0.98,
          height: height * 0.35,
        }}
      />

      <Text
        style={{
          fontSize: width * 0.06,
          fontFamily: 'outfitMedium',
          textAlign: 'center',
        }}
      >
        No Trips Planned Yet
      </Text>

      <Text
        style={{
          fontSize: width * 0.045, 
          fontFamily: 'outfit',
          textAlign: 'center',
          color: Colors.GRAY,
          marginHorizontal: width * 0.05,
        }}
      >
        Time to plan a new travel experience! Get started below.
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/create-trip/select-departure")}
        style={{
          paddingVertical: height * 0.018,
          paddingHorizontal: width * 0.08,
          backgroundColor: Colors.PRIMARY,
          borderRadius: width * 0.04,
        }}
      >
        <Text
          style={{
            color: Colors.WHITE,
            textAlign: 'center',
            fontFamily: 'outfitMedium',
            fontSize: width * 0.042, 
          }}
        >
          Start a new trip
        </Text>
      </TouchableOpacity>
    </View>
  );
}
