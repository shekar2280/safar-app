import React, { useState, useCallback, useRef } from "react";
import { FlatList, StyleSheet, Dimensions, ViewToken } from "react-native";
import UserTripCard from "./UserTripCard";
import { UserTripListProps } from "@/src/constants";

const { width } = Dimensions.get("window");

export default function UserTripList({
  userTrips,
  onDelete,
  isPaused,
  ListHeaderComponent,
  ListEmptyComponent,
  contentContainerStyle,
  refreshing,
  onRefresh
}: UserTripListProps & {
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  contentContainerStyle?: any;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const visibleIds = new Set(viewableItems.map(v => String(v.item.id)));
    setVisibleItems(visibleIds);
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 40 }).current;

  const renderItem = useCallback(({ item }: { item: any }) => (
    <UserTripCard
      trip={item}
      onDelete={onDelete}
      isPaused={isPaused}
      isVisible={visibleItems.size === 0 ? true : visibleItems.has(String(item.id))}
    />
  ), [onDelete, isPaused, visibleItems]);

  return (
    <FlatList
      data={userTrips}
      keyExtractor={(item) => item.id}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={[styles.listContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: width * 0.03,
    paddingBottom: 160,
  }
});
