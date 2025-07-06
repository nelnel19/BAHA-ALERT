from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import logging

# Configure Gemini API
API_KEY = "AIzaSyCLhSa2OjxYinrqypAjcbCnKUfDCCXwd4o"  # <-- Replace with your actual API key
genai.configure(api_key=API_KEY)

# Flask setup
app = Flask(__name__)
CORS(app)  # Allow requests from Expo
logging.basicConfig(level=logging.DEBUG)

# Gemini chat model setup
model = genai.GenerativeModel("gemini-2.0-flash")
chat = model.start_chat()

@app.route("/api/chat", methods=["POST"])
def chat_with_gemini():
    try:
        data = request.get_json()
        message = data.get("message")

        if not message:
            return jsonify({"error": "Missing message"}), 400

        response = chat.send_message(message)
        return jsonify({"response": response.text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Run on all interfaces so phone can reach it
    app.run(host="0.0.0.0", port=5001, debug=True)
