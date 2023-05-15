// CallbackScreen.tsx
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import axios from "axios";
import * as WebBrowser from "expo-web-browser";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function CallbackScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { url } = route.params;

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await WebBrowser.openAuthSessionAsync(
          url,
          "http://localhost:5173/callback"
        );
        if (result.type === "success") {
          const code = new URL(result.url).searchParams.get("code");
          const res = await axios.get(
            `http://localhost:5173/callback?code=${code}`
          );
          console.log("Profile:", res.data); // Here you have the user profile data. You can handle it as you need.
          navigation.navigate("Home"); // Navigate back to home screen after successful login
        }
      } catch (err) {
        console.error(err);
      }
    };

    handleRedirect();
  }, [url]);

  return (
    <View>
      <Text>Redirecting...</Text>
    </View>
  );
}
