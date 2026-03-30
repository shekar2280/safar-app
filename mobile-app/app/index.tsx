import { Text, View } from "react-native";
import Login from "./auth/Login";
import { auth } from "@/src/lib/firebase";
import { Redirect } from "expo-router";

export default function Index() {
  const user = auth.currentUser;

  return (
    <View style={{ flex: 1 }}>
      {user ? 
        <Redirect href={"/(tabs)/mytrip" as any} />
      : 
        <Login />
      }
    </View>
  );
}
