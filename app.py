from flask import Flask, render_template, request, jsonify
from googletrans import Translator
from gtts import gTTS
import os
import uuid

app = Flask(__name__)
translator = Translator()

os.makedirs(os.path.join("static", "audio"), exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/translate", methods=["POST"])
def translate():
    data = request.get_json()
    text = data.get("text", "").strip()
    target_lang = data.get("targetLang", "en")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    translated = translator.translate(text, dest=target_lang)
    translated_text = translated.text

    audio_filename = f"{uuid.uuid4()}.mp3"
    audio_path = os.path.join("static", "audio", audio_filename)
    tts = gTTS(translated_text, lang=target_lang)
    tts.save(audio_path)

    return jsonify({
        "translatedText": translated_text,
        "audioUrl": f"/static/audio/{audio_filename}"
    })

if __name__ == "__main__":
    app.run(debug=True)
