// Digital Twin Dashboard — 5 live scores

const SCORE_META = [
  { key: 'connectivity',  label: 'Connectivity',   icon: '◈', color: '#46f0c0' },
  { key: 'sustainability',label: 'Sustainability',  icon: '☀', color: '#a8e063' },
  { key: 'cybersecurity', label: 'Cybersecurity',  icon: '⊛', color: '#c9b6ff' },
  { key: 'responseTime',  label: 'Response Time',  icon: '⊕', color: '#ff6b6b' },
  { key: 'resilience',    label: 'Resilience',     icon: '⚡', color: '#7fd8ff' },
];

export class TwinDashboard {
  constructor(container) {
    this._bars = {};
    this._nums = {};
    this._el = document.createElement('div');
    this._el.className = 'twin-panel';

    const title = document.createElement('div');
    title.className = 'twin-title';
    title.textContent = '◉ Digital Twin';
    this._el.appendChild(title);

    SCORE_META.forEach(m => {
      const row = document.createElement('div');
      row.className = 'twin-row';
      row.innerHTML = `
        <span class="twin-icon" style="color:${m.color}">${m.icon}</span>
        <span class="twin-label">${m.label}</span>
        <div class="twin-bar-bg">
          <div class="twin-bar" id="tbar-${m.key}" style="width:50%;background:${m.color}"></div>
        </div>
        <span class="twin-num" id="tnum-${m.key}">50</span>
      `;
      this._el.appendChild(row);
    });

    container.appendChild(this._el);

    SCORE_META.forEach(m => {
      this._bars[m.key] = this._el.querySelector(`#tbar-${m.key}`);
      this._nums[m.key] = this._el.querySelector(`#tnum-${m.key}`);
    });
  }

  update(scores) {
    SCORE_META.forEach(m => {
      const v = Math.round(Math.max(0, Math.min(100, scores[m.key] ?? 50)));
      this._bars[m.key].style.width = v + '%';
      this._nums[m.key].textContent = v;
      // color-code danger
      if (v < 40) this._bars[m.key].style.background = '#ff6b6b';
      else if (v < 65) this._bars[m.key].style.background = '#ffb454';
      else this._bars[m.key].style.background = SCORE_META.find(mm => mm.key === m.key)?.color || '#46f0c0';
    });
  }

  destroy() { this._el.remove(); }
}
