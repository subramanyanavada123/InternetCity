// Controls: rule-setter panel, rate slider, sawtooth chart, link toggle indicator
export class Controls {
  constructor(container) {
    this.container = container;
    this._el = null;
    this._rateSliders = new Map();
    this._sawCanvas = null;
    this._sawCtx = null;
    this._build();
  }

  _build() {
    const el = document.createElement('div');
    el.className = 'controls-panel';
    el.innerHTML = `
      <div class="ctrl-section" id="ctrl-rule-section" style="display:none">
        <div class="ctrl-label">SET ROUTE FOR</div>
        <div class="ctrl-node-name" id="ctrl-node-name">—</div>
        <div class="ctrl-label" style="margin-top:8px">SEND PACKETS TO</div>
        <div class="ctrl-neighbors" id="ctrl-neighbors"></div>
        <button class="ctrl-clear-btn" id="ctrl-clear-rule">✕ Clear rule</button>
      </div>
      <div class="ctrl-section" id="ctrl-rate-section" style="display:none">
        <div class="ctrl-label">TRANSMIT RATE</div>
        <div class="ctrl-node-name" id="ctrl-rate-name">—</div>
        <input type="range" min="0.1" max="4" step="0.1" value="1"
               class="ctrl-slider" id="ctrl-rate-slider"
               aria-label="Transmit rate" />
        <div class="ctrl-rate-value" id="ctrl-rate-val">1.0 pkt/s</div>
        <canvas class="ctrl-sawtooth" id="ctrl-saw" width="180" height="60"
                aria-label="Rate over time chart"></canvas>
      </div>
      <div class="ctrl-hint" id="ctrl-hint">Tap a router to set its rule.<br>Tap a sender to adjust rate.</div>
    `;
    this.container.appendChild(el);
    this._el = el;
    this._sawCanvas = el.querySelector('#ctrl-saw');
    this._sawCtx = this._sawCanvas.getContext('2d');
  }

  showRouterRule(node, neighbors, onSetRule, onClearRule) {
    const section = this._el.querySelector('#ctrl-rule-section');
    const hint    = this._el.querySelector('#ctrl-hint');
    const rateSection = this._el.querySelector('#ctrl-rate-section');

    this._el.querySelector('#ctrl-node-name').textContent = node.label || `Router ${node.id}`;
    const nbEl = this._el.querySelector('#ctrl-neighbors');
    nbEl.innerHTML = '';

    neighbors.forEach(({ neighbor, edge }) => {
      const nbNode = neighbor;
      const isActive = node.rule === nbNode.id;
      const btn = document.createElement('button');
      btn.className = 'ctrl-neighbor-btn' + (isActive ? ' active' : '');
      btn.innerHTML = `<span class="nbr-icon">${this._nodeIcon(nbNode.type)}</span>${nbNode.label || nbNode.id}`;
      btn.setAttribute('aria-pressed', isActive);
      btn.addEventListener('click', () => {
        nbEl.querySelectorAll('.ctrl-neighbor-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', false); });
        btn.classList.add('active'); btn.setAttribute('aria-pressed', true);
        onSetRule(node.id, nbNode.id);
      });
      nbEl.appendChild(btn);
    });

    this._el.querySelector('#ctrl-clear-rule').onclick = () => {
      nbEl.querySelectorAll('.ctrl-neighbor-btn').forEach(b => b.classList.remove('active'));
      onClearRule(node.id);
    };

    section.style.display = '';
    rateSection.style.display = 'none';
    hint.style.display = 'none';
  }

  showSenderRate(node, history, onRateChange) {
    const section = this._el.querySelector('#ctrl-rate-section');
    const ruleSection = this._el.querySelector('#ctrl-rule-section');
    const hint = this._el.querySelector('#ctrl-hint');

    this._el.querySelector('#ctrl-rate-name').textContent = node.label || `Sender ${node.id}`;
    const slider = this._el.querySelector('#ctrl-rate-slider');
    const valEl  = this._el.querySelector('#ctrl-rate-val');
    slider.value = node.rate ?? 1.0;
    valEl.textContent = (node.rate ?? 1.0).toFixed(1) + ' pkt/s';
    slider.oninput = () => {
      const r = parseFloat(slider.value);
      valEl.textContent = r.toFixed(1) + ' pkt/s';
      onRateChange(node.id, r);
    };

    section.style.display = '';
    ruleSection.style.display = 'none';
    hint.style.display = 'none';
    this._sawHistory = history;
    this._drawSawtooth(history);
  }

  updateSawtooth(history) {
    this._drawSawtooth(history);
  }

  _drawSawtooth(history) {
    if (!history?.length || !this._sawCtx) return;
    const c = this._sawCtx, W = 180, H = 60;
    c.clearRect(0, 0, W, H);

    // grid lines
    c.strokeStyle = 'rgba(70,240,192,0.08)';
    c.lineWidth = 0.5;
    [0.25, 0.5, 0.75].forEach(y => {
      c.beginPath(); c.moveTo(0, H * y); c.lineTo(W, H * y); c.stroke();
    });

    if (history.length < 2) return;
    const maxRate = 4.0;
    c.beginPath();
    history.forEach((pt, i) => {
      const x = (i / (history.length - 1)) * W;
      const y = H - (pt.rate / maxRate) * H;
      i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
    });
    c.strokeStyle = '#46f0c0';
    c.lineWidth = 1.5;
    c.stroke();

    // loss marks
    history.forEach((pt, i) => {
      if (!pt.loss) return;
      const x = (i / (history.length - 1)) * W;
      const y = H - (pt.rate / maxRate) * H;
      c.fillStyle = '#ff6b6b';
      c.beginPath(); c.arc(x, y, 3, 0, Math.PI * 2); c.fill();
    });

    // axis label
    c.fillStyle = 'rgba(70,240,192,0.4)';
    c.font = '9px monospace';
    c.fillText('rate', 2, 9);
  }

  showHint() {
    const hint = this._el?.querySelector('#ctrl-hint');
    const ruleSection = this._el?.querySelector('#ctrl-rule-section');
    const rateSection = this._el?.querySelector('#ctrl-rate-section');
    if (hint) hint.style.display = '';
    if (ruleSection) ruleSection.style.display = 'none';
    if (rateSection) rateSection.style.display = 'none';
  }

  _nodeIcon(type) {
    return { home: '⌂', server: '▣', router: '◈', firewall: '⊛' }[type] || '○';
  }

  destroy() { this._el?.remove(); }
}
