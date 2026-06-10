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

import { JourneyItemProps, VisibilityState } from "@/src/constants";

export const PlannerItem: React.FC<JourneyItemProps> = ({
  item,
  index,
  isCompleted = false,
  isFinished,
  isDark,
  colors,
  sections,
  processingIndex,
  visibilityState = 'full',
  onMarkAsDone,
  onSkip,
  onOpenNavigation,
  onFindFood,
}) => {
  const isFirst = index === 0 && !isCompleted;
  const isLast =
    (isCompleted && index === sections.completed.length - 1) ||
    (!isCompleted &&
      index === sections.active.length - 1 &&
      sections.completed.length === 0);

  const isTeaser = visibilityState === 'teaser';
  const isFull = visibilityState === 'full';

  const TeaserOverlay = () => (
    <View
      style={[
        styles.teaserOverlay,
        {
          backgroundColor: isDark
            ? "rgba(18,18,28,0.72)"
            : "rgba(248,248,252,0.75)",
        },
      ]}
      pointerEvents="none"
    >
      <Ionicons name="lock-closed-outline" size={14} color={colors.MUTED_TEXT} />
      <Text style={[styles.teaserLabel, { color: colors.MUTED_TEXT }]}>
        Details locked
      </Text>
    </View>
  );

  return (
    <View key={`journey-item-${item.originalIndex}`} style={styles.itemWrapper}>
      <View style={styles.timelineContainer}>
        <View
          style={[
            styles.timelineDot,
            { backgroundColor: colors.BACKGROUND, borderColor: colors.BORDER },
            isFirst && (isFinished ? styles.archivedDot : styles.activeDot),
            isCompleted && (isFinished ? styles.archivedDot : styles.doneDot),
            isTeaser && styles.teaserDot,
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
            ]}
          >
            <Text
              style={[
                styles.placeTitle,
                { color: colors.TEXT },
                isCompleted && styles.doneText,
                isTeaser && { color: colors.MUTED_TEXT },
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

          {!isCompleted && isFirst && !isFinished && isFull && (
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

          {item.isSkipped && !isCompleted && !isFinished && (
            <View
              style={[
                styles.nowBadge,
                {
                  backgroundColor: isDark
                    ? "rgba(148,163,184,0.15)"
                    : "#F1F5F9",
                },
              ]}
            >
              <Text style={[styles.nowText, { color: colors.MUTED_TEXT }]}>
                POSTPONED
              </Text>
            </View>
          )}

          {isTeaser && !item.isSkipped && (
            <View
              style={[
                styles.nowBadge,
                {
                  backgroundColor: colors.GOLD_MUTED,
                },
              ]}
            >
              <Text style={[styles.nowText, { color: colors.GOLD }]}>
                COMING UP
              </Text>
            </View>
          )}
        </View>

        {!isCompleted && (
          <View style={{ position: "relative" }}>
            <View style={styles.metaRow}>
              <Text
                style={[
                  styles.distanceText,
                  { color: colors.GREEN },
                  (isTeaser || item.isSkipped) && { color: colors.MUTED_TEXT },
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
                      isTeaser && { color: colors.MUTED_TEXT },
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
                      backgroundColor: colors.GOLD_MUTED,
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

            {(item.placeDetails ||
              (item as any).description ||
              (item as any).details) && (
                <Text style={[styles.descriptionText, { color: colors.TEXT }]}>
                  {item.placeDetails ||
                    (item as any).description ||
                    (item as any).details}
                </Text>
              )}

            {isTeaser && <TeaserOverlay />}
          </View>
        )}

        {!isCompleted && !isFinished && isFull && (
          <View style={styles.actionContainer}>
            <Button
              title="Mark Visited"
              onPress={() => onMarkAsDone(item)}
              loading={processingIndex === item.originalIndex}
              style={{ flex: 1, paddingVertical: 12 }}
            />

            <View style={styles.iconActionPair}>
              {onSkip && (
                <View style={styles.iconActionItem}>
                  <Text style={[styles.iconLabel, { color: colors.GRAY }]}>
                    {item.isSkipped ? "RESTORE" : "SKIP"}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.iconBtn,
                      { backgroundColor: 'transparent', borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#CBD5E1' },
                      item.isSkipped && { borderColor: colors.PRIMARY },
                    ]}
                    onPress={() => onSkip(item)}
                    disabled={processingIndex === item.originalIndex}
                  >
                    <Ionicons
                      name={item.isSkipped ? "refresh-outline" : "play-skip-forward-outline"}
                      size={20}
                      color={item.isSkipped ? colors.PRIMARY : colors.MUTED_TEXT}
                    />
                  </TouchableOpacity>
                </View>
              )}

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
                    color={colors.PRIMARY}
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
    backgroundColor: "#D4AF37",
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#111",
    marginTop: 5,
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
  teaserDot: {
    backgroundColor: "transparent",
    borderStyle: "dashed",
    opacity: 0.6,
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
  teaserOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    paddingVertical: 16,
  },
  teaserLabel: {
    fontFamily: "outfitMedium",
    fontSize: 12,
    letterSpacing: 0.3,
  },
});
