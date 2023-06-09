import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Text,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const MusicScreen: React.FC = () => {
  const [playlists, setPlaylists] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetch("http://192.168.1.104:5001/api/user-playlists")
      .then((response) => response.json())
      .then((data) => {
        console.log(data.items.map((playlist) => playlist.name)); // Log playlist names
        setPlaylists(data.items);
      });
  }, []);

  const handleSettingsPress = (): void => {
    navigation.navigate("Settings");
  };

  const PlaylistItem = ({ item }) => (
    <View style={styles.playlistItem}>
      {item.images[0] && (
        <Image
          source={{ uri: item.images[0].url }}
          style={styles.playlistImage}
        />
      )}
      <Text style={styles.playlistName}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.settingsContainer}>
        <TouchableOpacity onPress={handleSettingsPress}>
          <Ionicons name="settings" size={width * 0.08} color="#0f0" />
        </TouchableOpacity>
      </View>
      <FlatList
        style={styles.flatList}
        data={playlists}
        renderItem={PlaylistItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
  },
  settingsContainer: {
    marginTop: height * 0.05,
    alignSelf: "flex-start",
    marginLeft: width * 0.05,
  },
  flatList: {
    marginTop: height * 0.05,
    width: width * 0.8,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 10,
    marginBottom: 10,
    borderColor: "#0f0",
    borderWidth: 2,
    height: height * 0.15,
  },
  playlistImage: {
    width: height * 0.1,
    height: height * 0.1,
    marginRight: 10,
  },
  playlistName: {
    color: "#0f0",
    flex: 1, // This will make the text take up the remaining width
  },
});

export default MusicScreen;
