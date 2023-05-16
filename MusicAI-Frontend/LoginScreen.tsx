import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { getTokens, getUserData } from "./auth"; // Assuming auth.js file contains your auth functions

export default function LoginScreen({ navigation }) {
  const handleLogin = async () => {
    await getTokens();
    navigation.navigate("Music");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login with Spotify</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  loginButton: {
    backgroundColor: "#1DB954",
    padding: 10,
    borderRadius: 25,
    width: 200,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
