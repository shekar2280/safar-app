import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import Autocomplete from "react-native-autocomplete-input";
import { CreateTripContext } from "../../context/CreateTripContext";

const { width, height } = Dimensions.get("window");

export default function SearchDestination() {
  const navigation = useNavigation();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [tripType, setTripType] = useState("Oneway"); 
  const { tripData, setTripData } = useContext(CreateTripContext);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "Destination",
    });
  }, []);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json`,
        {
          headers: {
            "User-Agent": "safar-travel-app (safar@app.com)",
            "Accept-Language": "en",
          },
        }
      )
        .then((res) => res.json())
        .then((data) => setResults(data))
        .catch((err) => console.error("Fetch error:", err));
    }, 500);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (item) => {
    const locationInfo = {
      name: item.display_name,
      coordinates: { lat: item.lat, lon: item.lon },
    };

    setTripData((prev) => ({
      ...prev,
      locationInfo,
      tripType,
    }));

    router.push("/create-trip/select-traveler");
  };

  return (
    <View
      style={{
        padding: width * 0.06,
        paddingTop: height * 0.12,
        backgroundColor: Colors.WHITE,
        flex: 1,
      }}
    >
      <Text
        style={{
          fontSize: width * 0.065,
          fontFamily: "outfitBold",
          marginBottom: height * 0.015,
        }}
      >
        Where are you going?
      </Text>
      <View
      style={{
        flexDirection: "row",
        marginBottom: height * 0.015,
        borderWidth: 2,
        borderRadius: width * 0.025,
        overflow: "hidden", 
      }}
    >
      <TouchableOpacity
        onPress={() => setTripType("Oneway")}
        style={{
          flex: 1,
          backgroundColor: tripType === "Oneway" ? "black" : "white",
          paddingVertical: 12,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: width * 0.045,
            fontFamily: "outfitBold",
            color: tripType === "Oneway" ? "white" : "black",
          }}
        >
          One-way Trip
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setTripType("Round")}
        style={{
          flex: 1,
          backgroundColor: tripType === "Round" ? "black" : "white",
          paddingVertical: 12,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: width * 0.045,
            fontFamily: "outfitBold",
            color: tripType === "Round" ? "white" : "black",
          }}
        >
          Round Trip
        </Text>
      </TouchableOpacity>
    </View>

      <Autocomplete
        data={results}
        defaultValue={query}
        onChangeText={setQuery}
        placeholder="Search your destination..."
        inputContainerStyle={{
          borderWidth: 2,
          borderRadius: width * 0.025,
          paddingHorizontal: width * 0.02,
        }}
        listContainerStyle={{
          backgroundColor: "white",
          elevation: 10,
          marginTop: height * 0.01,
        }}
        flatListProps={{
          keyExtractor: (item) => item.place_id,
          renderItem: ({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              style={{
                paddingVertical: height * 0.015,
                paddingHorizontal: width * 0.02,
                borderBottomColor: "#ccc",
                borderBottomWidth: 1,
              }}
            >
              <Text style={{ fontSize: width * 0.04 }}>
                {item.display_name}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
    </View>
  );
}
