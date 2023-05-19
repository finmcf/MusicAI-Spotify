import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import {
  getAuthorizationCode,
  sendAuthCodeToServer,
  sendTestPostRequest,
} from "./auth";

export default function LoginScreen({ navigation }) {
  // In LoginScreen
  const handleLogin = async () => {
    const authorizationCode = await getAuthorizationCode();
    await sendAuthCodeToServer(authorizationCode);
    navigation.navigate("Music");
  };

  const handleTestPostRequest = async () => {
    await sendTestPostRequest();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login with Spotify</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleTestPostRequest}
      >
        <Text style={styles.loginButtonText}>Test POST Request</Text>
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
