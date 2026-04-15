import React from "react";
import { FlatList } from "react-native";
import UserTripCard from "./UserTripCard";
import { UserTripListProps } from "@/src/types";

export default function UserTripList({ userTrips, onDelete }: UserTripListProps) {
  return (
    <FlatList
      data={userTrips}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <UserTripCard trip={item} onDelete={onDelete} />
      )}
      scrollEnabled={false}
    />
  );
}
