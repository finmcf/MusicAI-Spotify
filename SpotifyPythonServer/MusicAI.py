from flask import Flask, jsonify, request
from dotenv import load_dotenv
import os
import requests
from threading import Timer
from flask_cors import CORS
from spotipy import Spotify

load_dotenv()  # take environment variables from .env.

app = Flask(__name__)

CORS(app)  # This allows CORS for all origins and all routes.

# Tokens will be stored here. In a real-world application, you should use secure storage.
spotify_tokens = {
    'access_token': None,
    'refresh_token': None,
    'expires_in': None
}

def get_tokens_from_spotify(grant_type, code_or_token):
    data = {
        'grant_type': grant_type,
        'client_id': os.getenv("clientId"),
        'client_secret': os.getenv("clientSecret"),
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    if grant_type == 'authorization_code':
        data['code'] = code_or_token
        data['redirect_uri'] = os.getenv("redirectUri")
    elif grant_type == 'refresh_token':
        data['refresh_token'] = code_or_token
    response = requests.post("https://accounts.spotify.com/api/token", data=data, headers=headers)
    return response.json()

def refresh_tokens():
    refreshToken = spotify_tokens['refresh_token']
    tokens = get_tokens_from_spotify('refresh_token', refreshToken)
    spotify_tokens.update(tokens)
    Timer(tokens['expires_in'], refresh_tokens).start()
    print("Refreshed tokens received: ", tokens)




@app.route('/api/spotify-credentials', methods=['GET'])
def spotify_credentials():
    clientId = os.getenv("clientId")
    clientSecret = os.getenv("clientSecret")
    redirectUri = os.getenv("redirectUri")
    spotify_credentials = { 'clientId': clientId, 'clientSecret': clientSecret, 'redirectUri': redirectUri }
    return jsonify(spotify_credentials)

@app.route('/api/store-authorization-code', methods=['POST'])
def store_authorization_code():
    authorizationCode = request.json['authorizationCode']
    print("Authorization code received: ", authorizationCode)
    tokens = get_tokens_from_spotify('authorization_code', authorizationCode)
    spotify_tokens.update(tokens)
    Timer(tokens['expires_in'], refresh_tokens).start()
    print("Access and refresh tokens received: ", tokens)
    return jsonify({'status': 'success'})

@app.route('/api/get-access-token', methods=['GET'])
def get_access_token():
    return jsonify({'access_token': spotify_tokens['access_token']})

@app.route('/api/user-info', methods=['GET'])
def get_user_info():
    sp = Spotify(auth=spotify_tokens['access_token'])
    user_profile = sp.me()
    user_playlists = sp.current_user_playlists()
    return jsonify({'userProfile': user_profile, 'userPlaylists': user_playlists})

@app.route('/api/user-playlists', methods=['GET'])
def get_user_playlists():
    sp = Spotify(auth=spotify_tokens['access_token'])
    user_playlists = sp.current_user_playlists()
    return jsonify(user_playlists)


@app.route('/api/test', methods=['POST'])
def test_post_request():
    print("Test POST request received.")
    data = request.json
    print("Data: ", data)
    return jsonify({'status': 'success', 'message': 'Test POST request received.'})

if __name__ == '__main__':
    port = 5001  # Specify the desired port number here
    print(f"Server is running on port {port}")
    app.run(host='0.0.0.0', port=port)
