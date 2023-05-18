import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./LoginScreen";
import SettingsScreen from "./SettingsScreen";
import MusicScreen from "./MusicScreen";
import PlayerScreen from "./PlayerScreen"; // Import your PlayerScreen

import { refreshTokens, getUserData } from "./auth"; // import your functions

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    const refreshTokenPeriodically = async () => {
      const refreshToken = await getUserData("refreshToken");
      if (refreshToken) {
        await refreshTokens();
      }
    };

    // Refresh token every 30 minutes
    const intervalId = setInterval(refreshTokenPeriodically, 30 * 60 * 1000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Login" }}
        />
        <Stack.Screen
          name="Music"
          component={MusicScreen}
          options={{ title: "Music" }}
        />
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{ title: "Player" }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: "Settings" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
