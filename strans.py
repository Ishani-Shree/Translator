import speech_recognition as sr
from googletrans import Translator
from gtts import gTTS
import winsound  # To generate simple beep sounds

# Initialize the recognizer
r = sr.Recognizer()
tr = Translator()

def translation(text, lang):
    """Translate and play the translated speech"""
    translatedText = tr.translate(text, dest=lang)
    print(f"Translated: {translatedText.text}")
    translatedSpeech = gTTS(translatedText.text, lang=lang)
    translatedSpeech.save("svo_output.mp3")
    playsound("svo_output.mp3")

# Define supported languages
lang_dict = {
    "English": "en",
    "Hindi": "hi",
    "Spanish": "es",
    "French": "fr"
}

# Function to play a beep sound (using winsound)
def beep_sound():
    winsound.Beep(1000, 500)  # Frequency = 1000 Hz, Duration = 500 ms

# Main code loop
def main():
    while True:
        # Play initial beep sound
        beep_sound()

        with sr.Microphone() as source:
            # Adjust for ambient noise
            r.adjust_for_ambient_noise(source)
            print("[Listening] Say something...")

            # Listen to the microphone input
            try:
                audio = r.listen(source)
                text = r.recognize_google(audio)
                print(f"[You said]: {text}")
                
                if text.lower() == 'close the program':
                    print("[!] Program closed.")
                    break  # Exit the loop if the user says 'close the program'

                # Now asking for language selection
                while True:
                    print("\nSelect language:")
                    print("1: English\n2: Hindi\n3: Spanish\n4: French")
                    beep_sound()  # Language selection beep

                    # Listen to the user's language choice
                    audio = r.listen(source)
                    try:
                        sel_lang = r.recognize_google(audio)
                        print(f"[You said]: {sel_lang}")
                        
                        if sel_lang in lang_dict:
                            dest_lang = lang_dict[sel_lang]
                            translation(text, dest_lang)
                            break  # Exit the loop after translation
                        else:
                            print("[!] Invalid language. Please choose again.")
                            beep_sound()  # Error beep sound
                    except sr.UnknownValueError:
                        print("[!] Could not understand the language. Please try again.")
                        beep_sound()  # Error beep sound
                    except sr.RequestError as e:
                        print(f"[!] Error in request: {e}")
                        beep_sound()  # Error beep sound
                        break
            except sr.UnknownValueError:
                print("[!] Sorry, could not understand the audio. Try again.")
                beep_sound()  # Error beep sound
            except sr.RequestError as e:
                print(f"[!] Request error: {e}")
                beep_sound()  # Error beep sound

if __name__ == "__main__":
    main()
