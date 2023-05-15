import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as AuthSession from "expo-auth-session";
import axios from "axios";

const scopesArr = [
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-library-modify",
  "user-library-read",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-recently-played",
  "user-top-read",
];
const scopes = scopesArr.join(" ");

const getSpotifyCredentials = async () => {
  try {
    const res = await axios.get(
      "http://192.168.1.104:3000/api/spotify-credentials"
    );

    const spotifyCredentials = res.data;
    return spotifyCredentials;
  } catch (err) {
    console.error(err);
  }
};

const getAuthorizationCode = async () => {
  try {
    const credentials = await getSpotifyCredentials();
    console.log(credentials);
    const redirectUrl = AuthSession.getRedirectUrl();
    console.log(`Redirect URL: ${redirectUrl}`); // log the redirect URL
    const result = await AuthSession.startAsync({
      authUrl:
        "https://accounts.spotify.com/authorize" +
        "?response_type=code" +
        "&client_id=" +
        credentials.clientId +
        (scopes ? "&scope=" + encodeURIComponent(scopes) : "") +
        "&redirect_uri=" +
        encodeURIComponent(redirectUrl),
    });
    if (result.type === "success") {
      return result.params.code;
    }
  } catch (err) {
    console.error(err);
  }
};

export default function App() {
  useEffect(() => {
    (async () => {
      const code = await getAuthorizationCode();
      console.log(code);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
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
});
