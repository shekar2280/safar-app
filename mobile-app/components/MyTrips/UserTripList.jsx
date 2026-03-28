import {
  View,
  StyleSheet,
} from "react-native";
import React from "react";
import { Spacing } from "../../constants/Theme";
import UserTripCard from "./UserTripCard";

export default function UserTripList({ userTrips, onDelete }) {
  const trips = userTrips || [];
  if (trips.length === 0) return null;

  return (
    <View style={styles.container}>
      {trips.map((trip) => (
        <UserTripCard key={trip.id} trip={trip} onDelete={onDelete} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing.lg },
});
