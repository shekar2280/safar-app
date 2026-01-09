import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Autocomplete from "react-native-autocomplete-input";
import { Ionicons } from "@expo/vector-icons";

export default function DestinationPicker({
  onLocationSelect,
  placeholder = "Search destination...",
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1`,
        {
          headers: {
            "User-Agent": "safar-travel-app",
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
  const addr = item.address;
  let rawCity = addr?.city || addr?.town || addr?.municipality || addr?.village || addr?.suburb || item.display_name.split(',')[0];

  let cleanName = rawCity
    .replace(/City of /gi, '')    
    .replace(/ Greater/gi, '')   
    .replace(/Greater /gi, '')   
    .replace(/ District/gi, '')  
    .replace(/ Ward/gi, '')      
    .replace(/ Zone \d+/gi, '')  
    .trim();

  const cityAliases = {
    "london": "London",
    "mumbai city": "Mumbai",
    "bombay": "Mumbai",
    "new york city": "New York",
    "bengaluru urban": "Bengaluru",
  };

  const finalName = cityAliases[cleanName.toLowerCase()] || cleanName;

  const locationInfo = {
    name: item.display_name, 
    shortName: finalName, 
    coordinates: { lat: item.lat, lon: item.lon },
  };

  setQuery(item.display_name);
  setResults([]);
  onLocationSelect(locationInfo); 
};

  return (
    <View style={styles.mainWrapper}>
      <Autocomplete
        data={results}
        defaultValue={query}
        autoCorrect={false}
        onChangeText={setQuery}
        placeholder={placeholder}
        containerStyle={styles.autocompleteContainer}
        inputContainerStyle={styles.inputContainer}
        listContainerStyle={styles.listContainer}
        flatListProps={{
          keyExtractor: (item) => item.place_id.toString(),
          renderItem: ({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              style={styles.item}
            >
              <Ionicons name="location-outline" size={18} color="#777" />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemText} numberOfLines={1}>
                  {item.display_name}
                </Text>
              </View>
            </TouchableOpacity>
          ),
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    zIndex: 1000,
    elevation: 1000,
    marginVertical: 10,
    width: "100%",
    minHeight: 60,
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 10,
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 10,
    borderColor: "#eee",
    backgroundColor: "white",
    height: 55,
    justifyContent: "center",
  },
  listContainer: {
    backgroundColor: "white",
    elevation: 5,
    borderRadius: 10,
    marginTop: 3,
    borderWidth: 1,
    borderColor: "#eee",
    maxHeight: 200,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
  },
  itemText: { marginLeft: 10, fontSize: 14, color: "#333" },
});
