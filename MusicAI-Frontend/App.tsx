import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";

import * as AuthSession from "expo-auth-session";
import axios from "axios";
import { encode as btoa } from "base-64";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SpotifyWebAPI from "spotify-web-api-js";

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

const refreshTokens = async () => {
  try {
    const credentials = await getSpotifyCredentials();
    const credsB64 = btoa(
      `${credentials.clientId}:${credentials.clientSecret}`
    );
    const refreshToken = await getUserData("refreshToken");
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credsB64}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
    });
    const responseJson = await response.json();
    if (responseJson.error) {
      await getTokens();
    } else {
      const {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_in: expiresIn,
      } = responseJson;

      const expirationTime = new Date().getTime() + expiresIn * 1000;
      await setUserData("accessToken", newAccessToken);
      if (newRefreshToken) {
        await setUserData("refreshToken", newRefreshToken);
      }
      await setUserData("expirationTime", expirationTime.toString());
    }
  } catch (err) {
    console.error(err);
  }
};

export default function App() {
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [expirationTime, setExpirationTime] = useState("");
  const [accessTokenAvailable, setAccessTokenAvailable] = useState(false);
  const [spotifyApi, setSpotifyApi] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userPlaylists, setUserPlaylists] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  const handleLogin = async () => {
    const refreshToken = await getUserData("refreshToken");
    const tokenExpirationTime = await getUserData("expirationTime");

    if (!refreshToken || !tokenExpirationTime) {
      await getTokens();
    } else if (new Date().getTime() > tokenExpirationTime) {
      await refreshTokens();
    }

    const accessToken = await getUserData("accessToken");
    const newRefreshToken = await getUserData("refreshToken");
    const newExpirationTime = await getUserData("expirationTime");

    setAccessToken(accessToken);
    setRefreshToken(newRefreshToken);
    setExpirationTime(newExpirationTime);
    setAccessTokenAvailable(true);

    // Create a SpotifyWebAPI instance and set the access token
    var sp = new SpotifyWebAPI();
    sp.setAccessToken(accessToken);
    setSpotifyApi(sp);
  };

  useEffect(() => {
    // Refresh the token every 30 minutes
    const interval = setInterval(() => {
      refreshTokens();
    }, 1000 * 60 * 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if user data is already available
    (async () => {
      const accessToken = await getUserData("accessToken");
      const refreshToken = await getUserData("refreshToken");
      const expirationTime = await getUserData("expirationTime");

      if (accessToken && refreshToken && expirationTime) {
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setExpirationTime(expirationTime);
        setAccessTokenAvailable(true);

        // Create a SpotifyWebAPI instance and set the access token
        var sp = new SpotifyWebAPI();
        sp.setAccessToken(accessToken);
        setSpotifyApi(sp);
      }
    })();
  }, []);

  useEffect(() => {
    if (spotifyApi) {
      (async () => {
        const profile = await spotifyApi.getMe();
        setUserProfile(profile);

        const playlists = await spotifyApi.getUserPlaylists();
        setUserPlaylists(playlists);

        // Get the profile picture URL
        const profilePictureURL = profile.images[0]?.url; // Use optional chaining in case the images array is empty
        setProfilePicture(profilePictureURL);
      })();
    }
  }, [spotifyApi]);

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      {accessTokenAvailable ? (
        <View>
          <Text>Welcome {userProfile && userProfile.display_name}</Text>
          {profilePicture && (
            <Image
              source={{ uri: profilePicture }}
              style={styles.profilePicture}
            />
          )}
          <Text>Your playlists:</Text>
          {userPlaylists &&
            userPlaylists.items.map((playlist, index) => (
              <Text key={index}>{playlist.name}</Text>
            ))}
        </View>
      ) : (
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login with Spotify</Text>
        </TouchableOpacity>
      )}
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
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});
