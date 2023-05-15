require("dotenv").config();
const express = require("express");
const cors = require("cors"); // import cors

const app = express();
app.use(cors()); // use cors middleware

const port = process.env.PORT || 3000;

app.get("/api/spotify-credentials", (req, res) => {
  const clientId = process.env.clientId;
  const clientSecret = process.env.clientSecret;
  const redirectUri = process.env.redirectUri;
  const spotifyCredentials = { clientId, clientSecret, redirectUri };
  console.log(spotifyCredentials); // log the credentials
  res.json(spotifyCredentials);
});

app.listen(port, () => {
  const clientId = process.env.clientId;
  const clientSecret = process.env.clientSecret;
  const redirectUri = process.env.redirectUri;
  const spotifyCredentials = { clientId, clientSecret, redirectUri };
  console.log(spotifyCredentials);
  console.log(`Server is running on port ${port}`);
});
