import React from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export const OfflineBanner = () => {
  const { isConnected } = useNetInfo();
  const { theme } = useTheme();
  
  const [toastVisible] = React.useState(new Animated.Value(0));
  const [showToast, setShowToast] = React.useState(false);
  const [status, setStatus] = React.useState<'offline' | 'online'>('offline');
  const prevConnected = React.useRef<boolean | null>(null);

  React.useEffect(() => {
    if (prevConnected.current === false && isConnected === true) {
      setStatus('online');
      setShowToast(true);
      Animated.timing(toastVisible, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(toastVisible, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => setShowToast(false));
      }, 4000);

      prevConnected.current = isConnected;
      return () => clearTimeout(timer);
    }

    if (isConnected === false) {
      setStatus('offline');
      setShowToast(true);
      Animated.timing(toastVisible, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(toastVisible, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => setShowToast(false));
      }, 5000);

      prevConnected.current = isConnected;
      return () => clearTimeout(timer);
    }

    prevConnected.current = isConnected;
  }, [isConnected]);

  if (!showToast) return null;

  const isOffline = status === 'offline';

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          opacity: toastVisible,
          backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          transform: [
            { scale: toastVisible.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }) 
            },
          ],
        },
      ]}
    >
      <Ionicons 
        name={isOffline ? "cloud-offline" : "cloud-done"} 
        size={40} 
        color={isOffline ? "#ef4444" : "#10b981"} 
        style={{ marginBottom: 12 }}
      />
      <Text style={[
        styles.toastTitle,
        { color: theme === 'dark' ? '#f9fafb' : '#111827' }
      ]}>
        {isOffline ? "You're Offline" : "Back Online"}
      </Text>
      {isOffline && (
        <Text style={[
          styles.toastSubtext,
          { color: theme === 'dark' ? '#9ca3af' : '#6b7280' }
        ]}>
          Some features may be limited until you reconnect.
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: height / 2 - 100,
    left: width * 0.1,
    width: width * 0.8,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  toastTitle: {
    fontSize: 20,
    fontFamily: 'outfitBold',
    marginBottom: 8,
  },
  toastSubtext: {
    fontSize: 14,
    fontFamily: 'outfit',
    textAlign: 'center',
    lineHeight: 20,
  },
});
