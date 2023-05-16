import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

interface Styles {
  container: object;
  settingsContainer: object;
  musicButton: object;
  pressed: object;
}

const MusicScreen: React.FC = () => {
  const navigation = useNavigation();
  const [pressed, setPressed] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handlePressIn = (): void => {
    setPressed(true);
  };

  const handlePressOut = (): void => {
    setPressed(false);
    setIsPlaying(!isPlaying);
    // Add your music button logic here
  };

  const handleSettingsPress = (): void => {
    navigation.navigate("Settings");
  };

  return (
    <View style={styles.container}>
      <View style={styles.settingsContainer}>
        <TouchableOpacity onPress={handleSettingsPress}>
          <Ionicons name="settings" size={width * 0.08} color="#0f0" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.musicButton, pressed ? styles.pressed : {}]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={width * 0.12}
          color="#0f0"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles: Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsContainer: {
    position: "absolute",
    top: height * 0.05,
    right: width * 0.05,
  },
  musicButton: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: "#1a1a1a",
    borderWidth: 3,
    borderColor: "#0f0",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#0f0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pressed: {
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    backgroundColor: "#111",
    transform: [{ scale: 0.95 }],
  },
});

export default MusicScreen;
