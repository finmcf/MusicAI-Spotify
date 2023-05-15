// HomeScreen.tsx
import React from "react";
import { Button, View } from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();

  const getAuthUrl = async () => {
    try {
      const res = await axios.get("http://localhost:5173/authorize");
      navigation.navigate("Callback", { url: res.data.url });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View>
      <Button title="Authorize with Spotify" onPress={getAuthUrl} />
    </View>
  );
}
