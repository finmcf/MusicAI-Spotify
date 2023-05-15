import React, { useEffect, useState } from "react";
import { Text, View, Image, Button } from "react-native";
import axios from "axios";
import * as Crypto from "expo-crypto";
import {
  makeRedirectUri,
  useAuthRequest,
  ResponseType,
} from "expo-auth-session";

const clientId = "ffd2b6481cb84901932381a5ba9e8554";
const scopesArr = ["user-read-private", "user-read-email"];
const scopes = scopesArr.join(" ");

let redirectUri = makeRedirectUri({ useProxy: true });
console.log("Redirect URI: ", redirectUri);

export default function App() {
  const [profile, setProfile] = useState(null);
  const [verifier, setVerifier] = useState("");
  const [challenge, setChallenge] = useState("");

  const discovery = {
    authorizationEndpoint: "https://accounts.spotify.com/authorize",
    tokenEndpoint: "https://accounts.spotify.com/api/token",
  };

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: clientId,
      scopes: scopesArr,
      codeChallengeMethod: "S256",
      codeChallenge: challenge,
      responseType: ResponseType.Code,
      redirectUri,
    },
    discovery
  );

  useEffect(() => {
    (async () => {
      const codeVerifier = await generateCodeVerifier();
      console.log("Generated verifier: ", codeVerifier);
      setVerifier(codeVerifier);
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      console.log("Generated challenge: ", codeChallenge);
      setChallenge(codeChallenge);
    })();
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      console.log("Received success response: ", response);
      getAccessToken(code);
    } else if (response?.type === "error") {
      console.log("Received error response: ", response);
    }
  }, [response]);

  async function getAccessToken(code) {
    try {
      console.log("Attempting to get access token with code: ", code);
      const response = await axios.post(discovery.tokenEndpoint, {
        client_id: clientId,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code: code,
        code_verifier: verifier,
      });

      if (response.data.access_token) {
        console.log("Received access token: ", response.data.access_token);
        fetchProfile(response.data.access_token);
      } else {
        console.log("No access token received. Response: ", response.data);
      }
    } catch (error) {
      console.log("Error getting access token: ", error);
    }
  }

  async function fetchProfile(token) {
    try {
      console.log("Fetching profile with token: ", token);
      const response = await axios.get("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Received profile: ", response.data);
      setProfile(response.data);
    } catch (error) {
      console.log("Error fetching profile: ", error);
    }
  }

  const generateCodeVerifier = async () => {
    const randomBytes = await Crypto.getRandomBytesAsync(64);
    return randomBytes.join("");
  };

  const generateCodeChallenge = async (verifier: string) => {
    const hashedVerifier = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      verifier,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );
    return hashedVerifier
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  };

  if (profile) {
    console.log("Rendering profile view");
    return (
      <View>
        <Text>Logged in as {profile.display_name}</Text>
        <Image
          source={{ uri: profile.images[0].url }}
          style={{ width: 200, height: 200 }}
        />
        <Text>User ID: {profile.id}</Text>
        <Text>Email: {profile.email}</Text>
        <Text>Spotify URI: {profile.uri}</Text>
        <Text>Link: {profile.href}</Text>
        <Text>Profile Image: {profile.images[0].url}</Text>
      </View>
    );
  }

  console.log("Rendering login view");
  return (
    <View>
      <Button
        title="Login with Spotify"
        onPress={() => {
          console.log("Login button pressed");
          console.log("Login button pressed, request:", request);

          promptAsync();
        }}
      />
    </View>
  );
}
