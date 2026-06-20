const startBtn = document.getElementById('start-recording');
const stopBtn = document.getElementById('stop-recording');
const resultContainer = document.getElementById('result-container');
const translatedTextEl = document.getElementById('translated-text');
const listenBtn = document.getElementById('listen-translation');
const audio = document.getElementById('translation-audio');
const langDropdown = document.getElementById('languages');
const sourceLang = document.getElementById('source-lang');
const inputText = document.getElementById('input-text');
const translateBtn = document.getElementById('translate-btn');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const swapBtn = document.getElementById('swap-btn');
const charCountEl = document.getElementById('char-count');
const emptyState = document.getElementById('empty-state');
const loadingEl = document.getElementById('loading');

let currentTranslation = '';
let recognition;

// ── Char counter ──────────────────────────
inputText.addEventListener('input', () => {
    charCountEl.textContent = inputText.value.length;
});

// ── Clear ─────────────────────────────────
clearBtn.addEventListener('click', () => {
    inputText.value = '';
    charCountEl.textContent = '0';
    resetOutput();
});

// ── Copy ──────────────────────────────────
copyBtn.addEventListener('click', () => {
    if (!currentTranslation) return;
    navigator.clipboard.writeText(currentTranslation).then(() => {
        const original = copyBtn.title;
        copyBtn.title = 'Copied!';
        copyBtn.style.color = '#10B981';
        setTimeout(() => {
            copyBtn.title = original;
            copyBtn.style.color = '';
        }, 2000);
    });
});

// ── Swap languages ────────────────────────
swapBtn.addEventListener('click', () => {
    const sv = sourceLang.value;
    const tv = langDropdown.value;

    if (sv !== 'auto') {
        sourceLang.value = tv;
        langDropdown.value = sv;
    }

    if (currentTranslation) {
        inputText.value = currentTranslation;
        charCountEl.textContent = currentTranslation.length;
        resetOutput();
    }
});

// ── Translate button ──────────────────────
translateBtn.addEventListener('click', () => {
    const text = inputText.value.trim();
    if (!text) return;
    fetchTranslation(text, langDropdown.value);
});

// Ctrl+Enter shortcut
inputText.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        translateBtn.click();
    }
});

// ── Speech Recognition ────────────────────
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        inputText.value = transcript;
        charCountEl.textContent = transcript.length;
        fetchTranslation(transcript, langDropdown.value);
    };

    recognition.onerror = () => endRecording();
    recognition.onend = () => endRecording();
} else {
    startBtn.disabled = true;
    startBtn.title = 'Speech recognition not supported in this browser';
}

startBtn.addEventListener('click', () => {
    if (!recognition) return;
    const lang = sourceLang.value === 'auto' ? 'en-US' : sourceLang.value;
    recognition.lang = lang;
    recognition.start();
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-flex';
});

stopBtn.addEventListener('click', () => {
    if (recognition) recognition.stop();
    endRecording();
});

function endRecording() {
    startBtn.style.display = 'inline-flex';
    stopBtn.style.display = 'none';
}

// ── Listen ────────────────────────────────
listenBtn.addEventListener('click', () => audio.play());

// ── Reset output ──────────────────────────
function resetOutput() {
    currentTranslation = '';
    resultContainer.style.display = 'none';
    emptyState.style.display = 'flex';
    copyBtn.style.display = 'none';
    audio.src = '';
}

// ── Fetch translation ─────────────────────
async function fetchTranslation(text, targetLang) {
    emptyState.style.display = 'none';
    resultContainer.style.display = 'none';
    loadingEl.style.display = 'flex';

    try {
        const res = await fetch('/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, targetLang })
        });

        const data = await res.json();
        loadingEl.style.display = 'none';

        if (data.translatedText) {
            currentTranslation = data.translatedText;
            translatedTextEl.textContent = data.translatedText;
            audio.src = data.audioUrl;
            resultContainer.style.display = 'flex';
            copyBtn.style.display = 'flex';
        } else {
            emptyState.style.display = 'flex';
        }
    } catch {
        loadingEl.style.display = 'none';
        emptyState.style.display = 'flex';
        alert('Network error. Make sure the server is running.');
    }
}
