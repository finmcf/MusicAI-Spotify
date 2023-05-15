from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import requests
import base64
import json

app = Flask(__name__)
CORS(app)

# Your Spotify Developer Dashboard app's credentials
CLIENT_ID = "ffd2b6481cb84901932381a5ba9e8554"
CLIENT_SECRET = "75ba38437810455ba606aa30ac6ecd10"  # Replace this with your actual client secret
REDIRECT_URI = "exp://127.0.0.1:19000/--/expo-auth-session"  # Updated redirect URI

# Spotify OAuth2 URLs
AUTH_URL = "https://accounts.spotify.com/authorize"
TOKEN_URL = "https://accounts.spotify.com/api/token"

@app.route('/login')
def login():
    auth_params = {
        "client_id": CLIENT_ID,
        "response_type": "code",
        "redirect_uri": REDIRECT_URI,
        "scope": "playlist-read-private",
    }

    auth_url = requests.Request('GET', AUTH_URL, params=auth_params).prepare().url
    return jsonify({"url": auth_url})

@app.route('/callback')
def callback():
    auth_code = request.args.get('code')
    auth_header = base64.urlsafe_b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
    token_data = {
        "grant_type": "authorization_code",
        "code": auth_code,
        "redirect_uri": REDIRECT_URI,
    }
    token_headers = {"Authorization": f"Basic {auth_header}"}

    response = requests.post(TOKEN_URL, data=token_data, headers=token_headers)
    access_token = response.json().get('access_token')

    return jsonify({"access_token": access_token})

if __name__ == '__main__':
    app.run(debug=True)
