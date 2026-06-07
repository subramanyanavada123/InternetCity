// Future Engineer Report — personalized end-of-session assessment output
// Shows: thinking dimension scores, prediction accuracy, decision quality,
// strengths, growth areas, and a narrative personalised to the student's choices.

import { speech } from './speech.js';
import { DIMENSIONS } from '../engine/assessment.js';
import { showConfetti } from './screens.js';

const DIMENSION_META = {
  [DIMENSIONS.SYSTEMS]: {
    label:   'Systems Thinking',
    icon:    '◈',
    color:   '#46f0c0',
    desc:    'Seeing how all parts of a system connect and affect each other',
    tip:     'Keep asking: "If I change this, what else changes?"',
  },
  [DIMENSIONS.RESILIENCE]: {
    label:   'Resilience Thinking',
    icon:    '⚡',
    color:   '#c9b6ff',
    desc:    'Designing systems that keep working when things go wrong',
    tip:     'Always ask: "What happens when this fails?"',
  },
  [DIMENSIONS.OPTIMIZATION]: {
    label:   'Optimization Thinking',
    icon:    '⊙',
    color:   '#7fd8ff',
    desc:    'Finding the most efficient solution, not just any solution',
    tip:     'Look for bottlenecks — fixing the slowest part speeds everything up.',
  },
  [DIMENSIONS.ETHICS]: {
    label:   'Ethical Reasoning',
    icon:    '⊕',
    color:   '#ff6b6b',
    desc:    'Making decisions that consider fairness and human impact',
    tip:     'Ask: "Who benefits, and who bears the cost of my decision?"',
  },
  [DIMENSIONS.ENGINEERING]: {
    label:   'Engineering Reasoning',
    icon:    '⊛',
    color:   '#ffb454',
    desc:    'Using evidence and iteration to solve real problems',
    tip:     'Try, observe, adjust — that\'s the engineering loop.',
  },
};

function scoreLabel(n) {
  if (n >= 80) return { text: 'Advanced',   color: '#46f0c0' };
  if (n >= 65) return { text: 'Developing', color: '#ffb454' };
  if (n >= 45) return { text: 'Emerging',   color: '#7fd8ff' };
  return               { text: 'Beginning', color: '#8aa6b4' };
}

function renderRadarSVG(scores) {
  const dims  = Object.values(DIMENSIONS);
  const cx    = 80;
  const cy    = 80;
  const r     = 60;
  const n     = dims.length;

  const points = dims.map((d, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const val   = scores[d] / 100;
    return {
      x: cx + r * val * Math.cos(angle),
      y: cy + r * val * Math.sin(angle),
      lx: cx + (r + 18) * Math.cos(angle),
      ly: cy + (r + 18) * Math.sin(angle),
      dim: d,
    };
  });

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1].map(frac => {
    const pts = dims.map((_, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      return `${cx + r * frac * Math.cos(angle)},${cy + r * frac * Math.sin(angle)}`;
    }).join(' ');
    return `<polygon points="${pts}" fill="none" stroke="rgba(70,240,192,0.08)" stroke-width="1"/>`;
  }).join('');

  // Axis lines
  const axes = dims.map((_, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    return `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(angle)}" y2="${cy + r * Math.sin(angle)}" stroke="rgba(70,240,192,0.12)" stroke-width="1"/>`;
  }).join('');

  // Score polygon
  const scorePts = points.map(p => `${p.x},${p.y}`).join(' ');

  // Labels
  const labels = points.map(p => {
    const meta = DIMENSION_META[p.dim];
    const anchor = p.lx < cx - 5 ? 'end' : p.lx > cx + 5 ? 'start' : 'middle';
    return `<text x="${p.lx}" y="${p.ly + 4}" fill="${meta.color}" font-size="7" text-anchor="${anchor}" font-family="monospace">${meta.icon}</text>`;
  }).join('');

  return `
    <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" class="report-radar">
      ${rings}${axes}
      <polygon points="${scorePts}" fill="rgba(70,240,192,0.12)" stroke="#46f0c0" stroke-width="1.5"/>
      ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="3" fill="#46f0c0"/>`).join('')}
      ${labels}
    </svg>
  `;
}

export function renderReport(app, reportData, onDone) {
  app.innerHTML = '';

  const { scores, overallScore, predictionAccuracy, decisionQuality,
          strengths, growthAreas, narrative, predictionCount } = reportData;

  const overallLabel = scoreLabel(overallScore);
  const s = document.createElement('div');
  s.className = 'screen-report screen-enter';

  const dimRows = Object.values(DIMENSIONS).map(d => {
    const meta = DIMENSION_META[d];
    const val  = scores[d] ?? 50;
    const lbl  = scoreLabel(val);
    const isStrength   = strengths.includes(d);
    const isGrowthArea = growthAreas.includes(d);
    return `
      <div class="report-dim-row ${isStrength ? 'report-strength' : ''} ${isGrowthArea ? 'report-growth' : ''}">
        <div class="report-dim-icon" style="color:${meta.color}">${meta.icon}</div>
        <div class="report-dim-info">
          <div class="report-dim-name" style="color:${meta.color}">${meta.label}</div>
          <div class="report-dim-desc">${meta.desc}</div>
          ${isStrength   ? `<div class="report-dim-badge strength-badge">★ Strength</div>` : ''}
          ${isGrowthArea ? `<div class="report-dim-badge growth-badge">↑ Growth Area</div>` : ''}
          <div class="report-dim-tip">Tip: ${meta.tip}</div>
        </div>
        <div class="report-dim-right">
          <div class="report-dim-bar-wrap">
            <div class="report-dim-bar" style="width:${val}%;background:${meta.color};"></div>
          </div>
          <div class="report-dim-score" style="color:${lbl.color}">${lbl.text}</div>
        </div>
      </div>
    `;
  }).join('');

  const predHtml = predictionCount > 0 ? `
    <div class="report-stat-card">
      <div class="report-stat-icon">◑</div>
      <div class="report-stat-body">
        <div class="report-stat-label">Prediction Accuracy</div>
        <div class="report-stat-value">${predictionAccuracy ?? '—'}%</div>
        <div class="report-stat-sub">across ${predictionCount} prediction${predictionCount !== 1 ? 's' : ''}</div>
      </div>
    </div>
  ` : '';

  s.innerHTML = `
    <div class="report-header">
      <div class="report-header-eyebrow">◈ Future Engineer Report</div>
      <div class="report-header-title">Your Engineering Profile</div>
    </div>

    <div class="report-scroll">
      <div class="report-overall-row">
        <div class="report-radar-wrap">
          ${renderRadarSVG(scores)}
        </div>
        <div class="report-overall-info">
          <div class="report-overall-label">Overall Score</div>
          <div class="report-overall-score" style="color:${overallLabel.color}">${overallScore}</div>
          <div class="report-overall-tier" style="color:${overallLabel.color}">${overallLabel.text}</div>
          <div class="report-narrative">${narrative}</div>
        </div>
      </div>

      <div class="report-stats-row">
        <div class="report-stat-card">
          <div class="report-stat-icon">⚖</div>
          <div class="report-stat-body">
            <div class="report-stat-label">Decision Quality</div>
            <div class="report-stat-value">${decisionQuality}%</div>
            <div class="report-stat-sub">of decisions moved the city forward</div>
          </div>
        </div>
        ${predHtml}
      </div>

      <div class="report-section-title">Thinking Dimensions</div>
      <div class="report-dims">
        ${dimRows}
      </div>

      <div class="report-footer-note">
        This report shows how you think, not what you memorised.
        These are skills you can grow with every mission.
      </div>
    </div>

    <div class="report-actions">
      <button class="btn btn-ghost" id="report-back">◀ More Missions</button>
      <button class="btn btn-primary" id="report-share">Share with Teacher ▶</button>
    </div>
  `;

  s.querySelector('#report-back').addEventListener('click', onDone);
  s.querySelector('#report-share').addEventListener('click', () => {
    _showShareCard(app, reportData, onDone);
  });

  app.appendChild(s);

  if (overallScore >= 70) {
    setTimeout(showConfetti, 400);
    setTimeout(() => speech.celebrate(`Outstanding thinking, future engineer! Your overall score is ${overallScore}.`), 800);
  } else {
    setTimeout(() => speech.coach(`Here is your Engineer Report. These are thinking skills you build over time.`), 600);
  }
}

function _showShareCard(app, reportData, onDone) {
  const { scores, overallScore, narrative, strengths } = reportData;
  const s1 = DIMENSION_META[strengths[0]];
  const s2 = DIMENSION_META[strengths[1]];

  const overlay = document.createElement('div');
  overlay.className = 'overlay-back';
  overlay.innerHTML = `
    <div class="share-card">
      <div class="share-card-eyebrow">◈ FutureOS — Future Engineer Report</div>
      <div class="share-card-score">${overallScore}<span class="share-card-score-label">/100</span></div>
      <div class="share-card-narrative">${narrative}</div>
      <div class="share-card-strengths">
        ${s1 ? `<div class="share-strength" style="color:${s1.color}">${s1.icon} ${s1.label}</div>` : ''}
        ${s2 ? `<div class="share-strength" style="color:${s2.color}">${s2.icon} ${s2.label}</div>` : ''}
      </div>
      <div class="share-card-note">Printed from this device — no data was sent anywhere.</div>
      <div class="share-card-actions">
        <button class="btn btn-ghost" id="share-close">Close</button>
        <button class="btn btn-primary" id="share-print">Print / Save as PDF</button>
      </div>
    </div>
  `;

  overlay.querySelector('#share-close').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#share-print').addEventListener('click', () => window.print());
  app.appendChild(overlay);
}
