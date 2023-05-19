import axios from "axios";
import * as AuthSession from "expo-auth-session";
import { encode as btoa } from "base-64";
import * as SecureStore from "expo-secure-store";

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

export const getSpotifyCredentials = async () => {
  try {
    const res = await axios.get(
      "http://192.168.1.104:5001/api/spotify-credentials"
    );

    const spotifyCredentials = res.data;
    return spotifyCredentials;
  } catch (err) {
    console.error(err);
  }
};

export const getAuthorizationCode = async () => {
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
      console.log("Authorization code received: ", result.params.code);
      return result.params.code;
    }
  } catch (err) {
    console.error(err);
  }
};

// In auth.js
export const sendTestPostRequest = async () => {
  try {
    const res = await axios.post(
      "http://192.168.1.104:5001/api/test",
      {
        test: "test data",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Test POST request sent: ", res.data);
  } catch (err) {
    console.error(err);
  }
};

export const sendAuthCodeToServer = async (authorizationCode) => {
  try {
    await axios.post("http://192.168.1.104:5001/api/store-authorization-code", {
      authorizationCode,
    });
    console.log("Sent the authorization code to the server.");
  } catch (err) {
    console.error("Failed to send authorization code to server:", err);
  }
};

export const setUserData = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error("Failed to set user data:", error);
  }
};

export const getUserData = async (key) => {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value;
  } catch (error) {
    console.error("Failed to get user data:", error);
  }
};
