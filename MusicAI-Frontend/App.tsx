import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as AuthSession from "expo-auth-session";
import axios from "axios";
import { encode as btoa } from "base-64";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    const redirectUrl = AuthSession.getRedirectUrl();
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

const getTokens = async () => {
  try {
    const authorizationCode = await getAuthorizationCode();
    const credentials = await getSpotifyCredentials();
    const credsB64 = btoa(
      `${credentials.clientId}:${credentials.clientSecret}`
    );
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credsB64}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=authorization_code&code=${authorizationCode}&redirect_uri=${credentials.redirectUri}`,
    });
    const responseJson = await response.json();
    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
    } = responseJson;

    const expirationTime = new Date().getTime() + expiresIn * 1000;
    await setUserData("accessToken", accessToken);
    await setUserData("refreshToken", refreshToken);
    await setUserData("expirationTime", expirationTime.toString());
  } catch (err) {
    console.error(err);
  }
};

const setUserData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error("Failed to set user data:", error);
  }
};

const getUserData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (error) {
    console.error("Failed to get user data:", error);
  }
};

export default function App() {
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [expirationTime, setExpirationTime] = useState("");

  useEffect(() => {
    (async () => {
      await getTokens();

      const accessToken = await getUserData("accessToken");
      const refreshToken = await getUserData("refreshToken");
      const expirationTime = await getUserData("expirationTime");

      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setExpirationTime(expirationTime);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <Text>Access Token: {accessToken}</Text>
      <Text>Refresh Token: {refreshToken}</Text>
      <Text>Expiration Time: {expirationTime}</Text>
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
