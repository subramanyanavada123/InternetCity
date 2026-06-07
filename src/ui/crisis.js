// Crisis Event Banner — transient alert card

export class CrisisBanner {
  constructor(container) {
    this._el = null;
    this._container = container;
  }

  show(label, durationMs = 5000) {
    if (this._el) this._el.remove();
    const el = document.createElement('div');
    el.className = 'crisis-banner crisis-enter';
    el.innerHTML = `<span class="crisis-icon">⚠</span><span class="crisis-text">${label}</span>`;
    this._container.appendChild(el);
    this._el = el;
    // pulse then stay
    setTimeout(() => { if (el.parentNode) el.classList.add('crisis-pulse'); }, 200);
  }

  dismiss() {
    if (this._el) {
      this._el.classList.add('crisis-exit');
      setTimeout(() => this._el?.remove(), 400);
      this._el = null;
    }
  }

  destroy() { this._el?.remove(); this._el = null; }
}
