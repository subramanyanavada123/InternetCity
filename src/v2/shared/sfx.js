// Tiny Web Audio sound effects — no files needed.
// Modules call sfx.pop(), sfx.whoosh(), sfx.win(), sfx.fail() etc.

let ctx = null;
function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function tone(freq, type, duration, gain = 0.18, startFreq = null) {
  try {
    const c = ac();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = type;
    if (startFreq) {
      o.frequency.setValueAtTime(startFreq, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(freq, c.currentTime + duration * 0.8);
    } else {
      o.frequency.setValueAtTime(freq, c.currentTime);
    }
    g.gain.setValueAtTime(gain, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    o.start(c.currentTime);
    o.stop(c.currentTime + duration);
  } catch (_) {}
}

export const sfx = {
  pop()    { tone(600, 'sine', 0.08, 0.15); },
  click()  { tone(900, 'square', 0.05, 0.08); },
  whoosh() { tone(200, 'sawtooth', 0.18, 0.12, 800); },
  coin()   { tone(1200, 'sine', 0.12, 0.15); setTimeout(() => tone(1600, 'sine', 0.1, 0.12), 80); },
  win()    { [523,659,784,1047].forEach((f,i) => setTimeout(() => tone(f,'sine',0.3,0.18), i*100)); },
  fail()   { tone(220, 'sawtooth', 0.4, 0.2, 440); },
  launch() { tone(80, 'sawtooth', 0.5, 0.25, 400); },
  boom()   { tone(60, 'sawtooth', 0.6, 0.3); setTimeout(() => tone(40,'square',0.4,0.2), 80); },
  swipe()  { tone(500, 'sine', 0.08, 0.1, 300); },
  block()  { tone(180, 'square', 0.12, 0.15); },
};
