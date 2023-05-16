import React, { useEffect, useState } from "react";
import { Text, View, Image, StyleSheet } from "react-native";
import SpotifyWebAPI from "spotify-web-api-js";
import { getUserData } from "./auth"; // Assuming auth.js file contains your auth functions

export default function SettingsScreen() {
  const [spotifyApi, setSpotifyApi] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userPlaylists, setUserPlaylists] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    // Check if user data is already available
    (async () => {
      const accessToken = await getUserData("accessToken");

      if (accessToken) {
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
      <Text>Welcome {userProfile && userProfile.display_name}</Text>
      {profilePicture && (
        <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
      )}
      <Text>Your playlists:</Text>
      {userPlaylists &&
        userPlaylists.items.map((playlist, index) => (
          <Text key={index}>{playlist.name}</Text>
        ))}
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
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});
