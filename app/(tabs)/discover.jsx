import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useRouter } from "expo-router";
import { DiscoverIdeasList } from "../../constants/Options";
import DiscoverCard from "../../components/CreateTrip/DiscoverCard";

const { width, height } = Dimensions.get("window");

export default function Discover() {
  const router = useRouter();

  return (
    <View
      style={{
        padding: width * 0.06,
        paddingTop: height * 0.065,
        backgroundColor: Colors.WHITE,
        flex: 1,
      }}
    >
      <Text
        style={{
          fontSize: width * 0.08,
          fontFamily: "ui-sans-serif",
          fontWeight: "bold",
          marginBottom: height * 0.02,
        }}
      >
        Discover Ideas
      </Text>

      <FlatList
        data={DiscoverIdeasList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ marginVertical: height * 0.012 }}
            onPress={() =>
              router.push({
                pathname: "/discover-trip/trip-manager/select-destination",
                params: { tripCategory: item.tripCategory },
              })
            }
          >
            <DiscoverCard option={item} cardHeight={height * 0.18} />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.title}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
