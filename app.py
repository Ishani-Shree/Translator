from flask import Flask, render_template, request, jsonify
from googletrans import Translator
from gtts import gTTS
from playsound import playsound
import os

app = Flask(__name__)

# Initialize Translator and Audio Tools
translator = Translator()

def translation(text, lang):
    translated = translator.translate(text, dest=lang)
    translated_speech = gTTS(translated.text, lang=lang)
    translated_speech.save("translated_output.mp3")
    playsound("translated_output.mp3")
    return translated.text

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        text = request.form["text"]
        lang = request.form["lang"]
        translation_result = translation(text, lang)
        return jsonify(translated_text=translation_result)

    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
