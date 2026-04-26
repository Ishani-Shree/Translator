const startRecordingButton = document.getElementById('start-recording');
const stopRecordingButton = document.getElementById('stop-recording');
const resultContainer = document.getElementById('result-container');
const originalTextElement = document.getElementById('original-text');
const translatedTextElement = document.getElementById('translated-text');
const listenTranslationButton = document.getElementById('listen-translation');
const translationAudio = document.getElementById('translation-audio');
const languagesDropdown = document.getElementById('languages');

let recognition;
let isRecording = false;
let userLanguage = 'en';

const languageMap = {
    "en": "English",
    "hi": "Hindi",
    "es": "Spanish",
    "fr": "French"
};

// Set up the speech recognition
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = function() {
        console.log('Recording started...');
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('original-text').textContent = transcript;

        // Send the transcript to the backend for translation
        fetchTranslation(transcript, userLanguage);
    };

    recognition.onerror = function(event) {
        console.error("Error occurred in speech recognition: " + event.error);
    };
} else {
    alert("Speech Recognition API is not supported in your browser.");
}

startRecordingButton.addEventListener('click', () => {
    userLanguage = languagesDropdown.value;
    recognition.lang = userLanguage;
    recognition.start();
    startRecordingButton.style.display = 'none';
    stopRecordingButton.style.display = 'inline-block';
});

stopRecordingButton.addEventListener('click', () => {
    recognition.stop();
    startRecordingButton.style.display = 'inline-block';
    stopRecordingButton.style.display = 'none';
});

listenTranslationButton.addEventListener('click', () => {
    translationAudio.play();
});

async function fetchTranslation(text, targetLang) {
    const response = await fetch(`/translate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, targetLang })
    });

    const data = await response.json();
    if (data.translatedText) {
        translatedTextElement.textContent = data.translatedText;
        translationAudio.src = data.audioUrl;
        resultContainer.style.display = 'block';
    } else {
        alert("Translation failed. Please try again.");
    }
}
