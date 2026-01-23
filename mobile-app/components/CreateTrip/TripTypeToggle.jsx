import { View, Text, TouchableOpacity, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function TripTypeToggle({ selectedType, onSelectType }) {
  return (
    <View
      style={{
        flexDirection: "row",
        marginBottom: 15,
        borderWidth: 2,
        borderRadius: width * 0.025,
        overflow: "hidden",
      }}
    >
      <TouchableOpacity
        onPress={() => onSelectType("Oneway")}
        style={{
          flex: 1,
          backgroundColor: selectedType === "Oneway" ? "black" : "white",
          paddingVertical: 12,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: width * 0.045,
            fontFamily: "outfitBold",
            color: selectedType === "Oneway" ? "white" : "black",
          }}
        >
          One-way Trip
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onSelectType("Round")}
        style={{
          flex: 1,
          backgroundColor: selectedType === "Round" ? "black" : "white",
          paddingVertical: 12,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: width * 0.045,
            fontFamily: "outfitBold",
            color: selectedType === "Round" ? "white" : "black",
          }}
        >
          Round Trip
        </Text>
      </TouchableOpacity>
    </View>
  );
}