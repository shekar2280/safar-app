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
        paddingTop: height * 0.05,
        backgroundColor: Colors.WHITE,
        flex: 1,
      }}
    >
      <Text
        style={{
          fontFamily: "outfitBold",
          fontSize: 34,
          color: "#000",
          marginBottom: height * 0.01,
        }}
      >
        Discover Ideas
      </Text>

      <FlatList
        data={DiscoverIdeasList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ marginVertical: height * 0.010 }}
            onPress={() => {
              if (item.tripCategory) {
                router.push({
                  pathname: item.route,
                  params: { tripCategory: item.tripCategory },
                });
              } else {
                router.push(item.route);
              }
            }}
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
