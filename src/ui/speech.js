const MUTE_KEY = 'ic_muted';

class Speech {
  constructor() {
    this._muted = localStorage.getItem(MUTE_KEY) === '1';
    this._ok = 'speechSynthesis' in window;
    this._queue = [];
    this._busy = false;
  }
  get muted() { return this._muted; }
  toggle() { this.setMuted(!this._muted); }
  setMuted(v) {
    this._muted = v;
    localStorage.setItem(MUTE_KEY, v ? '1' : '0');
    if (v) window.speechSynthesis?.cancel();
  }
  speak(text, opts = {}) {
    if (this._muted || !this._ok || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts.rate ?? 0.95; u.pitch = opts.pitch ?? 1; u.volume = opts.volume ?? 0.9;
    window.speechSynthesis.speak(u);
  }
  celebrate(text) { this.speak(text, { pitch: 1.15, rate: 0.9 }); }
  coach(text)     { this.speak(text, { rate: 0.88 }); }
}
export const speech = new Speech();
