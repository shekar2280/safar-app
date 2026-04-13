import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Colors } from "@/src/constants/colors";
import Button from "@/src/components/common/Button";

import { JourneyItemProps } from "@/src/types/interfaces";

export const PlannerItem: React.FC<JourneyItemProps> = ({
  item,
  index,
  isCompleted = false,
  isFinished,
  isDark,
  colors,
  sections,
  processingIndex,
  onMarkAsDone,
  onOpenNavigation,
  onFindFood,
}) => {
  const isFirst = index === 0 && !isCompleted;
  const isLast =
    (isCompleted && index === sections.completed.length - 1) ||
    (!isCompleted &&
      index === sections.active.length - 1 &&
      sections.completed.length === 0);

  return (
    <View key={`journey-item-${item.originalIndex}`} style={styles.itemWrapper}>
      <View style={styles.timelineContainer}>
        <View
          style={[
            styles.timelineDot,
            { backgroundColor: colors.BACKGROUND, borderColor: colors.BORDER },
            isFirst && (isFinished ? styles.archivedDot : styles.activeDot),
            isCompleted && (isFinished ? styles.archivedDot : styles.doneDot),
          ]}
        >
          {isCompleted && (
            <Feather
              name="check"
              size={10}
              color={isDark ? colors.BLACK : colors.WHITE}
            />
          )}
        </View>
        {!isLast && (
          <View
            style={[
              styles.timelineLine,
              isCompleted
                ? isFinished
                  ? { backgroundColor: colors.GRAY }
                  : { backgroundColor: colors.GREEN }
                : [
                    styles.plannedLine,
                    {
                      borderColor: isDark
                        ? "rgba(255,255,255,0.4)"
                        : colors.BORDER,
                    },
                  ],
              isFirst && { marginTop: 4 },
            ]}
          />
        )}
      </View>

      <View style={styles.contentBody}>
        <View style={styles.headerRow}>
          <View
            style={[
              styles.headerTitleSubContainer,
              isCompleted && { opacity: 0.5 },
            ]}
          >
            <Text
              style={[
                styles.placeTitle,
                { color: colors.TEXT },
                isCompleted && styles.doneText,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.placeName}
            </Text>
          </View>

          {isCompleted && !isFinished && (
            <TouchableOpacity
              onPress={() => onMarkAsDone(item)}
              disabled={processingIndex === item.originalIndex}
              style={[
                styles.undoIconOnly,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.03)",
                },
              ]}
            >
              {processingIndex === item.originalIndex ? (
                <ActivityIndicator size="small" color={colors.PRIMARY} />
              ) : (
                <Ionicons
                  name="refresh-outline"
                  size={22}
                  color={colors.PRIMARY}
                />
              )}
            </TouchableOpacity>
          )}
          {!isCompleted && isFirst && !isFinished && (
            <View
              style={[
                styles.nowBadge,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.15)"
                    : "#F1F5F9",
                },
              ]}
            >
              <Text
                style={[
                  styles.nowText,
                  { color: isDark ? colors.TEXT : "#475569" },
                ]}
              >
                NEXT UP
              </Text>
            </View>
          )}
        </View>

        {!isCompleted && (
          <View style={styles.metaRow}>
            <Text
              style={[
                styles.distanceText,
                { color: colors.GREEN },
                isFinished && { color: colors.GRAY },
              ]}
            >
              {item.distance?.toFixed(1) || "0.0"} km away from your location
            </Text>
            <View style={styles.timingContainer}>
              <Text style={[styles.timingText, { color: colors.MUTED_TEXT }]}>
                Best time to visit:{" "}
                <Text
                  style={[
                    styles.timeText,
                    { color: colors.GOLD },
                    isFinished && { color: colors.MUTED_TEXT },
                  ]}
                >
                  {item.timeSlot || "Anytime"}
                </Text>
              </Text>
            </View>
            {item.vibe && (
              <View
                style={[
                  styles.vibeBadge,
                  {
                    backgroundColor: isDark
                      ? "rgba(212,175,55,0.1)"
                      : "rgba(235, 186, 73, 0.1)",
                  },
                  isFinished && {
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.vibeText,
                    { color: colors.GOLD },
                    isFinished && { color: colors.MUTED_TEXT },
                  ]}
                >
                  {item.vibe.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        )}

        {!isCompleted &&
          (item.placeDetails ||
            (item as any).description ||
            (item as any).details) && (
            <Text style={[styles.descriptionText, { color: colors.TEXT }]}>
              {item.placeDetails ||
                (item as any).description ||
                (item as any).details}
            </Text>
          )}

        {!isCompleted && !isFinished && (
          <View style={styles.actionContainer}>
            <Button
              title="Mark Visited"
              onPress={() => onMarkAsDone(item)}
              loading={processingIndex === item.originalIndex}
              style={{ flex: 1, paddingVertical: 12 }}
            />

            <View style={styles.iconActionPair}>
              <View style={styles.iconActionItem}>
                <Text style={[styles.iconLabel, { color: colors.GRAY }]}>MAP</Text>
                <TouchableOpacity
                  style={[
                    styles.iconBtn,
                    { backgroundColor: colors.SURFACE, borderColor: colors.BORDER },
                  ]}
                  onPress={() => onOpenNavigation(item.placeName)}
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={isFinished ? colors.GRAY : colors.PRIMARY}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.iconActionItem}>
                <Text style={[styles.iconLabel, { color: colors.GRAY }]}>
                  FOOD
                </Text>
                <TouchableOpacity
                  style={[
                    styles.iconBtn,
                    { backgroundColor: colors.SURFACE, borderColor: colors.BORDER },
                  ]}
                  onPress={() => onFindFood(item.placeName)}
                >
                  <Ionicons
                    name="restaurant-outline"
                    size={20}
                    color={colors.MUTED_TEXT}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemWrapper: { flexDirection: "row" },
  timelineContainer: { width: 32, alignItems: "center" },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#CBD5E1",
    zIndex: 2,
    marginTop: 8,
  },
  activeDot: {
    backgroundColor: Colors.PRIMARY,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: "white",
    marginTop: 5,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  doneDot: {
    backgroundColor: Colors.GREEN,
    borderColor: Colors.GREEN,
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 7,
  },
  archivedDot: {
    backgroundColor: "#CBD5E1",
    borderColor: "#CBD5E1",
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 7,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    position: "absolute",
    top: 24,
    bottom: -6,
    left: "50%",
    marginLeft: -1,
  },
  plannedLine: {
    backgroundColor: "transparent",
    borderStyle: "dashed",
    borderWidth: 1,
    borderRadius: 1,
  },
  contentBody: { flex: 1, paddingBottom: 40, marginLeft: 10, paddingRight: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  placeTitle: { fontFamily: "playfairBold", fontSize: 20 },
  doneText: { textDecorationLine: "line-through" },
  distanceText: {
    fontFamily: "outfitMedium",
    fontSize: 12,
    color: Colors.GREEN,
  },
  timingContainer: { marginTop: 4 },
  timingText: {
    fontFamily: "outfitMedium",
    fontSize: 12,
  },
  timeText: {
    fontFamily: "outfitBold",
    fontSize: 12,
    color: Colors.PRIMARY,
  },
  metaRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 8,
    gap: 8,
  },
  vibeBadge: {
    backgroundColor: "rgba(235, 186, 73, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  vibeText: {
    fontFamily: "outfitBold",
    fontSize: 9,
    color: Colors.SECONDARY,
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontFamily: "outfit",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  actionContainer: {
    flexDirection: "row",
    marginTop: 15,
    gap: 12,
    alignItems: "flex-end",
  },
  iconActionPair: {
    flexDirection: "row",
    gap: 12,
  },
  iconActionItem: {
    alignItems: "center",
    gap: 6,
  },
  iconLabel: {
    fontFamily: "outfitBold",
    fontSize: 8,
    letterSpacing: 0.5,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  nowBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  nowText: { fontFamily: "outfitBold", fontSize: 9 },
  undoIconOnly: {
    padding: 6,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    width: 38,
    height: 38,
  },
  headerTitleSubContainer: {
    flex: 1,
    marginRight: 10,
  },
});
