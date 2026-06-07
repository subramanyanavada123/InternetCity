// Reactive coach: context-sensitive spoken+text prompts that guide without instructing
import { speech } from './speech.js';

export class Coach {
  constructor(container) {
    this.container = container;
    this._el = null;
    this._timer = null;
    this._lastKey = null;
    this._build();
  }

  _build() {
    const el = document.createElement('div');
    el.className = 'coach-box hidden';
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('role', 'status');
    this.container.appendChild(el);
    this._el = el;
  }

  show(text, { key, duration = 5000, speak = true } = {}) {
    if (key && key === this._lastKey) return; // don't repeat same message
    this._lastKey = key;
    clearTimeout(this._timer);
    this._el.textContent = text;
    this._el.classList.remove('hidden');
    this._el.classList.add('coach-in');
    if (speak) speech.coach(text);
    if (duration > 0) {
      this._timer = setTimeout(() => this.hide(), duration);
    }
  }

  hide() {
    this._el?.classList.add('hidden');
    this._el?.classList.remove('coach-in');
    clearTimeout(this._timer);
  }

  destroy() { clearTimeout(this._timer); this._el?.remove(); }
}
