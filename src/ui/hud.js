// HUD: live stats, router's-eye toggle, mute, back — all diegetic/dark-themed
export class HUD {
  constructor(container, { onToggleScope, onMute, onBack }) {
    this.container = container;
    this._scope = false;
    this._onToggleScope = onToggleScope;
    this._onMute = onMute;
    this._onBack = onBack;
    this._el = null;
    this._stats = { sent: 0, delivered: 0, looped: 0, dropped: 0, stranded: 0 };
    this._goalEl = null;
    this._sawtoothCanvas = null;
    this._sawHistory = [];
    this._build();
  }

  _build() {
    const hud = document.createElement('div');
    hud.className = 'hud';
    hud.innerHTML = `
      <div class="hud-left">
        <button class="hud-btn hud-back" aria-label="Back">◀</button>
      </div>
      <div class="hud-center">
        <div class="hud-stats">
          <span class="hud-stat" id="hud-delivered" title="Delivered">✔ <b>0</b></span>
          <span class="hud-stat hud-loop"  id="hud-looped"    title="Loops/TTL expired">↺ <b>0</b></span>
          <span class="hud-stat hud-drop"  id="hud-dropped"   title="Dropped (buffer full)">✕ <b>0</b></span>
          <span class="hud-stat hud-strand" id="hud-stranded" title="Stranded (no route)">? <b>0</b></span>
        </div>
        <div class="hud-goal" id="hud-goal"></div>
      </div>
      <div class="hud-right">
        <button class="hud-btn hud-scope" id="hud-scope-btn" aria-label="Router's-eye view" title="Router's-eye view: see what a single router knows">◉</button>
        <button class="hud-btn hud-mute"  id="hud-mute-btn"  aria-label="Toggle sound">♪</button>
      </div>
    `;

    hud.querySelector('.hud-back').addEventListener('click', this._onBack);
    hud.querySelector('#hud-scope-btn').addEventListener('click', () => {
      this._scope = !this._scope;
      hud.querySelector('#hud-scope-btn').classList.toggle('active', this._scope);
      this._onToggleScope(this._scope);
    });
    hud.querySelector('#hud-mute-btn').addEventListener('click', () => {
      this._onMute();
    });

    this.container.insertAdjacentElement('afterbegin', hud);
    this._el = hud;
    this._goalEl = hud.querySelector('#hud-goal');
  }

  setMuteIcon(muted) {
    const btn = this._el?.querySelector('#hud-mute-btn');
    if (btn) btn.textContent = muted ? '♪̶' : '♪';
  }

  update(stats) {
    if (!this._el) return;
    this._stats = stats;
    const set = (id, val) => {
      const el = this._el.querySelector(`#${id} b`);
      if (el) el.textContent = val;
    };
    set('hud-delivered', stats.delivered);
    set('hud-looped',    stats.looped);
    set('hud-dropped',   stats.dropped);
    set('hud-stranded',  stats.stranded);
  }

  setGoal(text, achieved) {
    if (!this._goalEl) return;
    this._goalEl.textContent = text;
    this._goalEl.className = 'hud-goal' + (achieved ? ' achieved' : '');
  }

  addSawtoothPoint(rate, lost) {
    this._sawHistory.push({ rate, lost });
    if (this._sawHistory.length > 80) this._sawHistory.shift();
  }

  destroy() { this._el?.remove(); }
}
