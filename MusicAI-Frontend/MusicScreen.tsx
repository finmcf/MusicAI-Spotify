import React from "react";
import { StyleSheet, View, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

interface Styles {
  container: object;
  settingsContainer: object;
}

const MusicScreen: React.FC = () => {
  const navigation = useNavigation();

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
});

export default MusicScreen;
