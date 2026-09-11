let voicesReady = false;
let voicesPromise = null;

function loadVoices() {
  if (voicesPromise) return voicesPromise;
  voicesPromise = new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      voicesReady = true;
      resolve(existing);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      voicesReady = true;
      resolve(window.speechSynthesis.getVoices());
    };
    // Safety timeout in case the event never fires
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
  });
  return voicesPromise;
}

// Chrome sometimes silently drops speech that isn't tied to a user gesture,
// and can "pause" long-running speech synthesis sessions. This nudges it awake.
let keepAliveTimer = null;
function startKeepAlive() {
  stopKeepAlive();
  keepAliveTimer = setInterval(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    } else {
      stopKeepAlive();
    }
  }, 10000);
}
function stopKeepAlive() {
  if (keepAliveTimer) { clearInterval(keepAliveTimer); keepAliveTimer = null; }
}

export async function speak(text, { rate = 1, pitch = 0.85, onEnd } = {}) {
  if (!window.speechSynthesis) { if (onEnd) onEnd(); return; }

  window.speechSynthesis.cancel();

  const voices = voicesReady ? window.speechSynthesis.getVoices() : await loadVoices();

  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = rate;
  utter.pitch = pitch;
  utter.volume = 1;

  const preferred =
    voices.find(v => /daniel|david|male|uk english male/i.test(v.name)) ||
    voices.find(v => v.lang === 'en-US') ||
    voices[0];
  if (preferred) utter.voice = preferred;

  utter.onstart = () => startKeepAlive();
  utter.onend = () => { stopKeepAlive(); if (onEnd) onEnd(); };
  utter.onerror = () => { stopKeepAlive(); if (onEnd) onEnd(); };

  window.speechSynthesis.speak(utter);
}

// Call this directly inside a click/tap event handler once, to unlock speech
// synthesis in browsers that require a user gesture before the first utterance.
export function unlockSpeech() {
  if (!window.speechSynthesis) return;
  const primer = new SpeechSynthesisUtterance(' ');
  primer.volume = 0;
  window.speechSynthesis.speak(primer);
}

export function createRecognizer(onResult, onEnd) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };
  recognition.onend = () => { if (onEnd) onEnd(); };
  recognition.onerror = () => { if (onEnd) onEnd(); };
  return recognition;
}
