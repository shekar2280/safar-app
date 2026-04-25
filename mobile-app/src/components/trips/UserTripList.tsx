import React from "react";
import { FlatList, StyleSheet, Dimensions } from "react-native";
import UserTripCard from "./UserTripCard";
import { UserTripListProps } from "@/src/types";

const { width } = Dimensions.get("window");

export default function UserTripList({ 
  userTrips, 
  onDelete, 
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
  return (
    <FlatList
      data={userTrips}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <UserTripCard trip={item} onDelete={onDelete} />
      )}
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
