from flask import Flask, jsonify
from dotenv import load_dotenv
import os

load_dotenv()  # take environment variables from .env.

app = Flask(__name__)

@app.route('/api/spotify-credentials', methods=['GET'])
def spotify_credentials():
    clientId = os.getenv("clientId")
    clientSecret = os.getenv("clientSecret")
    redirectUri = os.getenv("redirectUri")
    spotify_credentials = { 'clientId': clientId, 'clientSecret': clientSecret, 'redirectUri': redirectUri }
    print(spotify_credentials)  # log the credentials
    return jsonify(spotify_credentials)

if __name__ == '__main__':
    port = os.getenv("PORT", 3000)  # default port to 3000
    clientId = os.getenv("clientId")
    clientSecret = os.getenv("clientSecret")
    redirectUri = os.getenv("redirectUri")
    spotify_credentials = { 'clientId': clientId, 'clientSecret': clientSecret, 'redirectUri': redirectUri }
    print(spotify_credentials)
    print(f"Server is running on port {port}")
    app.run(host='0.0.0.0', port=port)
