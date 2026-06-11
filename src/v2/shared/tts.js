// Text-to-Speech helper — uses browser speechSynthesis (no external files, works offline)
// Reads lesson intro text aloud. User can mute via the 🔊 toggle button stored in localStorage.

const TTS_KEY = 'ic2_tts';

export function isTTSEnabled() {
  return localStorage.getItem(TTS_KEY) !== 'off';
}

export function setTTSEnabled(on) {
  localStorage.setItem(TTS_KEY, on ? 'on' : 'off');
}

export function speak(text, lang = 'en') {
  if (!('speechSynthesis' in window)) return;
  if (!isTTSEnabled()) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  // Pick a voice matching the language when available
  const voices = window.speechSynthesis.getVoices();
  const langTag = lang === 'kn' ? 'kn' : 'en';
  const match = voices.find(v => v.lang.startsWith(langTag));
  if (match) utt.voice = match;
  utt.lang = lang === 'kn' ? 'kn-IN' : 'en-US';
  utt.rate = 0.92;
  utt.pitch = 1.05;
  window.speechSynthesis.speak(utt);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// Small mute/unmute toggle button — returns the button element
export function makeTTSToggle(parent, color = '#46f0c0') {
  const btn = document.createElement('button');
  const update = () => {
    btn.textContent = isTTSEnabled() ? '🔊' : '🔇';
    btn.title = isTTSEnabled() ? 'Mute voice' : 'Unmute voice';
  };
  btn.style.cssText = `
    position:absolute;top:56px;right:16px;z-index:70;
    background:rgba(0,0,0,0.5);border:1px solid ${color}55;
    border-radius:50%;width:36px;height:36px;
    font-size:16px;cursor:pointer;display:flex;align-items:center;
    justify-content:center;touch-action:manipulation;
    -webkit-tap-highlight-color:transparent;
  `;
  update();
  btn.addEventListener('click', () => {
    setTTSEnabled(!isTTSEnabled());
    stopSpeaking();
    update();
  });
  parent.appendChild(btn);
  return btn;
}
