import React, { useMemo } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image, ImageBackground, Dimensions } from "react-native";
import { Colors, useThemeColors } from "@/src/constants/colors";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { WEATHER_CONFIG } from "@/src/constants";
import { useWeather } from "@/src/hooks/queries/useWeather";

const { width } = Dimensions.get("window");

import { WeatherWidgetProps } from "@/src/constants";

export default function WeatherWidget({ cityName }: WeatherWidgetProps) {
  const { data: weather, isLoading: loading } = useWeather(cityName);
  const colors = useThemeColors();
  const { isDark } = useTheme();

  const weatherCategory = useMemo(() => {
    if (!weather?.current?.weather?.[0]) return "SUNNY";
    const id = weather.current.weather[0].id;

    if (id >= 200 && id < 600) return "RAINY";
    if (id >= 600 && id < 700) return "WINTER";
    if (id >= 700 && id < 800) return "CLOUDY";
    if (id === 800) return "SUNNY";
    return "CLOUDY";
  }, [weather]);

  const config = WEATHER_CONFIG[weatherCategory as keyof typeof WEATHER_CONFIG];

  if (loading) {
    return null;
  }

  if (!weather || !weather.current || !weather.current.weather) return null;

  const { current, forecast } = weather;
  const condition = current.weather[0];
  const main = current.main;
  const wind = current.wind;

  const dailyForecast = forecast?.list ? [
    forecast.list[8],
    forecast.list[16],
    forecast.list[24]
  ].filter(Boolean) : [];

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 800 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.MUTED_TEXT }]}>LOCAL WEATHER</Text>
      </View>

      <ImageBackground
        source={{ uri: config.bg }}
        style={styles.cardBg}
        imageStyle={{ borderRadius: 20 }}
      >
        <View style={[styles.glassOverlay, { backgroundColor: isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.35)" }]}>
          <View style={styles.topRow}>
            <MotiView
              from={{ translateX: -20, opacity: 0 }}
              animate={{ translateX: 0, opacity: 1 }}
              transition={{ delay: 300 }}
              style={styles.mainWeather}
            >
              <Text style={styles.temp}>{Math.round(main.temp)}°</Text>
              <Text style={styles.conditionText}>
                {condition.description.toUpperCase()}
              </Text>
            </MotiView>

            <MotiView
              from={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 500 }}
            >
              <Image
                source={{ uri: `https://openweathermap.org/img/wn/${condition.icon}@4x.png` }}
                style={styles.mainIcon}
              />
            </MotiView>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Ionicons name="water" size={14} color="#FFF" />
              <Text style={styles.statValue}>{main.humidity}%</Text>
            </View>
            <View style={styles.statChip}>
              <Ionicons name="leaf" size={14} color="#FFF" />
              <Text style={styles.statValue}>{Math.round(wind.speed * 3.6)}km/h</Text>
            </View>
          </View>

          {dailyForecast.length > 0 && (
            <View style={styles.forecastContainer}>
              {dailyForecast.map((day: any, index: number) => (
                <MotiView
                  key={index}
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 600 + (index * 100) }}
                  style={styles.forecastItem}
                >
                  <Text style={styles.forecastDay}>
                    {new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
                  </Text>
                  <Text style={styles.forecastTemp}>{Math.round(day.main.temp)}°</Text>
                </MotiView>
              ))}
            </View>
          )}

          <View style={styles.attributionRow}>
            <Text style={styles.attributionText}>WEATHER POWERED BY OPENWEATHERMAP</Text>
          </View>
        </View>
      </ImageBackground>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  loadingContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    marginLeft: 0,
  },
  title: {
    fontFamily: "interMedium", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4
  },
  cardBg: {
    width: "100%",
    minHeight: 200,
    overflow: "hidden",
    borderRadius: 20,
  },
  glassOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 24,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  mainWeather: {
    gap: 2,
  },
  temp: {
    fontFamily: "outfitMedium",
    fontSize: 56,
    color: "#FFF",
    lineHeight: 62,
  },
  conditionText: {
    fontFamily: "outfit",
    fontSize: 12,
    color: "#FFF",
    letterSpacing: 1.5,
    opacity: 0.9,
  },
  mainIcon: {
    width: 80,
    height: 80,
    marginTop: -10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statValue: {
    fontFamily: "outfitMedium",
    fontSize: 12,
    color: "#FFF",
  },
  forecastContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  forecastItem: {
    alignItems: "center",
    gap: 2,
  },
  forecastDay: {
    fontFamily: "outfitBold",
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1,
  },
  forecastTemp: {
    fontFamily: "outfitBold",
    fontSize: 16,
    color: "#FFF",
  },
  attributionRow: {
    marginTop: 15,
    paddingTop: 8,
    alignItems: "center",
  },
  attributionText: {
    fontFamily: "interMedium",
    fontSize: 8,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1,
  },
});
