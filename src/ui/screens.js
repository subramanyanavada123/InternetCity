import { speech } from './speech.js';

function el(tag, cls, html = '') {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}
function btn(cls, text, fn) {
  const b = el('button', cls, text);
  b.addEventListener('click', fn);
  return b;
}

function makeChrome(title, { onBack, onSettings, onMute } = {}) {
  const c = el('div', 'chrome');
  const left = el('div', 'chrome-left');
  if (onBack) left.appendChild(btn('btn btn-ghost hud-btn', '◀', onBack));
  const titleEl = el('div', 'chrome-title', title || '');
  const right = el('div', 'chrome-right');
  if (onMute) {
    const m = btn('hud-btn', speech.muted ? '♪̶' : '♪', () => {
      speech.toggle(); m.textContent = speech.muted ? '♪̶' : '♪';
    });
    right.appendChild(m);
  }
  if (onSettings) right.appendChild(btn('hud-btn', '⚙', onSettings));
  c.appendChild(left); c.appendChild(titleEl); c.appendChild(right);
  return c;
}

// ── Confetti ─────────────────────────────────────────────────────────────
export function showConfetti() {
  const wrap = el('div', 'confetti-wrap');
  document.body.appendChild(wrap);
  const colors = ['#46f0c0','#ffb454','#c9b6ff','#7fd8ff','#ff6b6b'];
  for (let i = 0; i < 60; i++) {
    const p = el('div', 'confetti-p');
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = colors[~~(Math.random() * colors.length)];
    p.style.animationDuration = (1 + Math.random() * 1.8) + 's';
    p.style.animationDelay = (Math.random() * 0.5) + 's';
    wrap.appendChild(p);
  }
  setTimeout(() => wrap.remove(), 3200);
}

// ── Splash ────────────────────────────────────────────────────────────────
export function renderSplash(app, onDone) {
  app.innerHTML = '';
  const s = el('div', 'screen-splash screen-enter');
  s.innerHTML = `
    <div class="splash-city-icon">◉</div>
    <div class="splash-wordmark">FutureOS</div>
    <div class="splash-sub">Design the City of 2050</div>
    <div class="splash-packet"></div>
  `;
  app.appendChild(s);
  setTimeout(onDone, 1800);
}

// ── Home / Academy ────────────────────────────────────────────────────────
export function renderHome(app, { onPlay, onTeacher, onSettings, onReport, hasProgress }) {
  app.innerHTML = '';
  const s = el('div', 'screen-home screen-enter');

  s.innerHTML = `
    <div class="home-eyebrow">Future Infrastructure Engineer</div>
    <div class="home-wordmark">FutureOS</div>
    <div class="home-tagline">Design · Connect · Protect the City of 2050</div>
    <div class="home-city-preview">
      <span class="city-icon-row">◈ ⊕ ☀ ⊛ ▣ ⌂</span>
    </div>
  `;
  const actions = el('div', 'home-actions');
  const playBtn = btn('btn btn-primary btn-xl', hasProgress ? '▶  Continue Missions' : '▶  Start as Engineer', onPlay);
  playBtn.autofocus = true;
  const secondary = el('div', 'home-secondary');
  secondary.appendChild(btn('btn btn-ghost', '⊛ For Teachers', onTeacher));
  secondary.appendChild(btn('btn btn-ghost', '⚙ Settings',    onSettings));
  actions.appendChild(playBtn);
  if (hasProgress && onReport) {
    actions.appendChild(btn('btn btn-ghost home-report-btn', '◈ My Engineer Report', onReport));
  }
  actions.appendChild(secondary);
  s.appendChild(actions);
  app.appendChild(s);

  if (!hasProgress) {
    setTimeout(() => speech.coach(
      'Welcome to FutureOS! You are a Future Infrastructure Engineer. Your mission: design a city that can survive 2050.'
    ), 900);
  }
}

// ── Module Select ─────────────────────────────────────────────────────────
export function renderModuleSelect(app, { modules, progress, onSelect, onBack, onSettings }) {
  app.innerHTML = '';
  const s = el('div', 'screen-modules screen-enter');
  s.appendChild(makeChrome('◉ FutureOS Academy', { onBack, onSettings, onMute: true }));

  const header = el('div', 'modules-header');
  const v2Url = window.location.origin + '/';
  header.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
      <div>
        <div class="modules-title">Choose a Mission</div>
        <div class="modules-sub">Each mission teaches real engineering concepts</div>
      </div>
      <div style="display:inline-flex;border-radius:20px;overflow:hidden;border:1px solid rgba(70,240,192,0.2);font-size:11px;font-weight:700;">
        <a href="${v2Url}" style="padding:7px 14px;text-decoration:none;color:#8aa6b4;border-right:1px solid rgba(70,240,192,0.15);transition:color 0.2s;" onmouseover="this.style.color='#46f0c0'" onmouseout="this.style.color='#8aa6b4'">Beginner</a>
        <span style="padding:7px 14px;background:rgba(70,240,192,0.15);color:#46f0c0;">Advanced ✦</span>
      </div>
    </div>
  `;
  s.appendChild(header);

  const grid = el('div', 'modules-grid');

  modules.forEach((mod, i) => {
    const stars = progress.moduleStars?.[mod.id] || 0;
    const unlocked = i === 0 || (progress.completedModules || []).includes(modules[i - 1].id);
    const done = (progress.completedModules || []).includes(mod.id);

    const card = el('div', `module-card${!unlocked ? ' locked' : done ? ' done' : ''}`);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', unlocked ? '0' : '-1');
    card.style.setProperty('--mod-color', mod.color);

    card.innerHTML = `
      <div class="mod-icon" style="color:${mod.color}">${mod.icon}</div>
      <div class="mod-num">Module ${mod.id}</div>
      <div class="mod-title">${mod.title}</div>
      <div class="mod-sub">${mod.subtitle}</div>
      <div class="mod-concept">${mod.concept}</div>
      ${stars ? `<div class="mod-stars">${'★'.repeat(stars)}</div>` : ''}
      ${!unlocked ? `<div class="mod-lock">🔒</div>` : ''}
    `;

    if (unlocked) {
      card.addEventListener('click',   () => onSelect(mod.id));
      card.addEventListener('keydown', e => { if (e.key === 'Enter') onSelect(mod.id); });
    } else {
      card.addEventListener('click', () =>
        speech.coach(`Finish Module ${i} first to unlock ${mod.title}.`)
      );
    }
    grid.appendChild(card);
  });

  s.appendChild(grid);
  app.appendChild(s);
}

// ── Mission Briefing ──────────────────────────────────────────────────────
export function renderMissionBriefing(app, { module: mod, onStart, onBack }) {
  app.innerHTML = '';
  const s = el('div', 'screen-briefing screen-enter');
  s.appendChild(makeChrome(`Module ${mod.id}`, { onBack }));

  const body = el('div', 'briefing-body');
  body.innerHTML = `
    <div class="briefing-icon" style="color:${mod.color}">${mod.icon}</div>
    <h1 class="briefing-title">${mod.title}</h1>
    <p class="briefing-subtitle">${mod.subtitle}</p>
    <div class="briefing-goal-box">
      <div class="briefing-goal-label">Your Mission</div>
      <div class="briefing-goal-text">${mod.description}</div>
    </div>
    <div class="briefing-concept-tag">Concept: <strong>${mod.concept}</strong></div>
    ${mod.crisisEvent ? `
      <div class="briefing-crisis-hint">
        <span>⚠</span> A crisis event will strike mid-mission. Be ready to adapt.
      </div>
    ` : ''}
  `;
  s.appendChild(body);
  s.appendChild(btn('btn btn-primary btn-xl briefing-start', '▶  Begin Mission', onStart));
  app.appendChild(s);

  setTimeout(() => speech.coach(`Mission: ${mod.title}. ${mod.description}`), 600);
}

// ── Results / After-action ─────────────────────────────────────────────────
export function renderResults(app, { stars, stats, conceptReveal, onNext, onRetry, onReport, isCity }) {
  const backdrop = el('div', 'overlay-back');
  const card = el('div', 'result-card');

  const tier = stars >= 3 ? { title: 'Outstanding!',       color: 'var(--teal)'  }
             : stars >= 2 ? { title: 'Mission Complete!',   color: 'var(--amber)' }
             :               { title: 'Keep Exploring.',     color: 'var(--slate)' };

  const starsHtml = Array.from({ length: stars }, (_, i) =>
    `<span class="star-pop" style="animation-delay:${i*.1}s">★</span>`
  ).join('') + Array.from({ length: 3 - stars }, () => `<span style="opacity:.15">★</span>`).join('');

  let statsHtml = '';
  if (stats && !isCity) {
    statsHtml = `
      <div class="result-stats">
        ✔ ${stats.delivered} delivered &nbsp;|&nbsp;
        ↺ ${stats.looped} looped &nbsp;|&nbsp;
        ✕ ${stats.dropped} dropped
      </div>`;
  } else if (stats && isCity) {
    statsHtml = `<div class="result-stats">${stats}</div>`;
  }

  card.innerHTML = `
    <div class="result-stars">${starsHtml}</div>
    <div class="result-title" style="color:${tier.color}">${tier.title}</div>
    ${statsHtml}
    ${stars >= 2 && conceptReveal ? `
      <div class="concept-card">
        <div class="concept-tag">◈ You discovered</div>
        <div class="concept-body">${conceptReveal}</div>
      </div>
    ` : ''}
    <div class="result-engineer-note">Your thinking was assessed. Check your Engineer Report to see how you\'re developing.</div>
  `;

  const actions = el('div', 'result-actions');
  actions.appendChild(btn('btn btn-ghost', '↩ Try Again', () => { backdrop.remove(); onRetry(); }));
  actions.appendChild(btn('btn btn-primary', isCity ? 'Next Mission ▶' : 'Next ▶', () => { backdrop.remove(); onNext(); }));
  card.appendChild(actions);

  if (onReport) {
    const reportBtn = btn('btn btn-ghost result-report-btn', '◈ View My Engineer Report', () => { backdrop.remove(); onReport(); });
    card.appendChild(reportBtn);
  }

  backdrop.appendChild(card);
  app.appendChild(backdrop);

  if (stars === 3) { showConfetti(); speech.celebrate(tier.title + (conceptReveal ? ' ' + conceptReveal : '')); }
  else speech.speak(tier.title);
}

// ── Teacher view ──────────────────────────────────────────────────────────
export function renderTeacher(app, { progress, assessment, onBack, onReport }) {
  app.innerHTML = '';
  const s = el('div', 'screen-teacher screen-enter');
  s.appendChild(makeChrome('For Teachers', { onBack }));

  const content = el('div', 'teacher-content');

  const concepts = [
    { icon: '◈', label: 'Networks & Graphs',         modId: 1, desc: 'Nodes, edges, connectivity — the structure of the internet' },
    { icon: '⟳', label: 'Queues & Throughput',        modId: 2, desc: 'Congestion, bottlenecks, load management' },
    { icon: '⊕', label: 'Priority Queues',            modId: 3, desc: 'Triage logic — critical first, normal last' },
    { icon: '⚡', label: 'Redundancy & Failover',      modId: 4, desc: 'Backup paths, single points of failure' },
    { icon: '⊛', label: 'Cybersecurity & Filtering',  modId: 5, desc: 'Firewalls, packet inspection, false positives' },
    { icon: '⊙', label: 'Algorithms & Optimization',  modId: 6, desc: 'Search, sort, shortest path, load balancing' },
  ];

  const hasAny = Object.keys(progress.moduleStars || {}).length > 0;

  // Thinking dimensions section (from assessment engine)
  const DIMS = [
    { key: 'systemsThinking',      icon: '◈', label: 'Systems Thinking',     color: '#46f0c0' },
    { key: 'resilienceThinking',   icon: '⚡', label: 'Resilience Thinking',  color: '#c9b6ff' },
    { key: 'optimizationThinking', icon: '⊙', label: 'Optimization',          color: '#7fd8ff' },
    { key: 'ethicalReasoning',     icon: '⊕', label: 'Ethical Reasoning',     color: '#ff6b6b' },
    { key: 'engineeringReasoning', icon: '⊛', label: 'Engineering Reasoning', color: '#ffb454' },
  ];

  const report = assessment?.generateReport?.() || null;

  if (!hasAny) {
    const empty = el('div', 'teacher-empty',
      'No sessions yet — hand the device to a student to begin.');
    content.appendChild(empty);
  } else {
    // Thinking Dimensions section
    if (report) {
      const dimHeader = el('div', 'teacher-section-title', '◈ Thinking Dimensions');
      content.appendChild(dimHeader);

      DIMS.forEach(d => {
        const val = report.scores[d.key] ?? 50;
        const row = el('div', 'mastery-row');
        row.innerHTML = `
          <span class="mastery-icon" style="color:${d.color}">${d.icon}</span>
          <div class="mastery-info">
            <div class="mastery-concept">${d.label}</div>
            <div class="teacher-dim-bar-wrap">
              <div class="teacher-dim-bar" style="width:${val}%;background:${d.color};"></div>
            </div>
          </div>
          <span class="mastery-score" style="color:${d.color}">${val}</span>
        `;
        content.appendChild(row);
      });

      const predNote = report.predictionCount > 0 ? `
        <div class="teacher-stat-row">
          <span>Prediction Accuracy</span>
          <span style="color:#46f0c0">${report.predictionAccuracy}% (${report.predictionCount} predictions)</span>
        </div>
      ` : '';
      const statBox = el('div', 'teacher-stats-box', `
        <div class="teacher-stat-row">
          <span>Overall Score</span>
          <span style="color:#46f0c0;font-weight:700;">${report.overallScore}/100</span>
        </div>
        <div class="teacher-stat-row">
          <span>Decision Quality</span>
          <span style="color:#ffb454">${report.decisionQuality}%</span>
        </div>
        ${predNote}
      `);
      content.appendChild(statBox);

      if (onReport) {
        const reportBtn = btn('btn btn-ghost teacher-report-btn', '◈ View Full Engineer Report', onReport);
        content.appendChild(reportBtn);
      }
    }

    // Module mastery section
    const modHeader = el('div', 'teacher-section-title', '◈ Module Mastery');
    content.appendChild(modHeader);

    concepts.forEach(c => {
      const v = (progress.moduleStars || {})[c.modId] || 0;
      const attempted = v > 0;
      const mastered  = v >= 2;
      const row = el('div', 'mastery-row');
      row.innerHTML = `
        <span class="mastery-icon">${c.icon}</span>
        <div class="mastery-info">
          <div class="mastery-concept">${c.label}</div>
          <div class="mastery-sub">${c.desc}</div>
        </div>
        <span class="mastery-status ${mastered ? 'mastered' : attempted ? 'partial' : ''}">${mastered ? '✔' : attempted ? '◐' : '○'}</span>
      `;
      content.appendChild(row);
    });
  }

  s.appendChild(content);

  const priv = el('p', 'privacy-note',
    '🔒 Everything here is stored only on this device. FutureOS collects nothing.');
  s.appendChild(priv);
  app.appendChild(s);
}

// ── Settings ──────────────────────────────────────────────────────────────
export function renderSettings(app, { onBack, onResetAssessment }) {
  app.innerHTML = '';
  const s = el('div', 'screen-settings screen-enter');
  s.appendChild(makeChrome('Settings', { onBack }));

  const list = el('div', 'settings-list');

  const addToggle = (icon, label, key, def) => {
    const row = el('div', 'settings-row');
    const on = localStorage.getItem(key) !== '0' && (localStorage.getItem(key) === '1' || def);
    row.innerHTML = `<span class="settings-icon">${icon}</span><span class="settings-label">${label}</span>`;
    const toggle = el('button', `toggle${on ? ' on' : ''}`);
    toggle.setAttribute('role', 'switch'); toggle.setAttribute('aria-checked', String(on));
    toggle.addEventListener('click', () => {
      const nowOn = toggle.classList.toggle('on');
      toggle.setAttribute('aria-checked', String(nowOn));
      localStorage.setItem(key, nowOn ? '1' : '0');
      if (key === 'ic_muted') speech.setMuted(!nowOn);
    });
    row.appendChild(toggle);
    list.appendChild(row);
  };

  addToggle('♪', 'Voice prompts',  'ic_muted', true);
  addToggle('✨', 'Animations',     'ic_anim',  true);

  const resetRow = el('div', 'settings-row');
  resetRow.innerHTML = `<span class="settings-icon">⊗</span><span class="settings-label">Reset Mission Progress</span>`;
  resetRow.appendChild(btn('btn btn-ghost', 'Reset', () => {
    if (confirm('Reset all mission progress?')) {
      localStorage.removeItem('ic_progress');
      localStorage.removeItem('futureos_progress');
      onBack();
    }
  }));
  list.appendChild(resetRow);

  const resetAssessRow = el('div', 'settings-row');
  resetAssessRow.innerHTML = `<span class="settings-icon">◈</span><span class="settings-label">Reset Engineer Report</span>`;
  resetAssessRow.appendChild(btn('btn btn-ghost', 'Reset', () => {
    if (confirm('Reset your Engineer Report and thinking scores?')) {
      onResetAssessment?.();
      onBack();
    }
  }));
  list.appendChild(resetAssessRow);

  s.appendChild(list);

  const priv = el('p', 'privacy-note',
    '🔒 No accounts. No data leaves this device. COPPA-friendly.');
  s.appendChild(priv);
  app.appendChild(s);
}

// ── Legacy world map (keep for v1/v2 compat) ─────────────────────────────
export function renderWorldMap(app, { worlds, progress, onSelectWorld, onBack, onSettings }) {
  app.innerHTML = '';
  const s = el('div', 'screen-worldmap screen-enter');
  s.appendChild(makeChrome('', { onBack, onSettings, onMute: true }));

  const header = el('div', 'worldmap-header');
  header.innerHTML = `<div class="worldmap-title">◈ Concepts</div><div class="worldmap-sub">Choose a world to explore</div>`;
  s.appendChild(header);

  const scroll = el('div', 'worlds-scroll');
  worlds.forEach((world, i) => {
    const unlocked = progress.unlockedWorlds?.includes(world.id) ?? (world.id === 1);
    const done = (progress.completedWorlds || []).includes(world.id);

    if (i > 0) {
      const conn = el('div', `world-connector${unlocked ? ' unlocked' : ''}`);
      scroll.appendChild(conn);
    }

    const wrap = el('div', 'world-node-wrap');
    const bubble = el('div', `world-bubble${!unlocked ? ' locked' : done ? ' done' : ''}`);
    bubble.setAttribute('role', 'button');
    bubble.setAttribute('tabindex', unlocked ? '0' : '-1');
    bubble.setAttribute('aria-label', `${world.title}${!unlocked ? ', locked' : ''}`);
    bubble.innerHTML = `<span class="world-icon">${world.emoji}</span><span class="world-name">${world.title}</span>`;

    if (unlocked) {
      bubble.addEventListener('click', () => onSelectWorld(world.id));
      bubble.addEventListener('keydown', e => { if (e.key === 'Enter') onSelectWorld(world.id); });
    } else {
      bubble.addEventListener('click', () => speech.coach(`Finish ${worlds[i-1]?.title} to unlock this world.`));
    }
    wrap.appendChild(bubble);
    scroll.appendChild(wrap);
  });

  s.appendChild(scroll);
  app.appendChild(s);
}

export function renderScenarioSelect(app, { world, progress, onSelect, onBack }) {
  app.innerHTML = '';
  const s = el('div', 'screen-scenarios screen-enter');
  s.appendChild(makeChrome(`${world.emoji} ${world.title}`, { onBack, onMute: true }));

  const list = el('div', 'scenario-list');
  world.scenarios.forEach((sc, i) => {
    const stars = progress.scenarioStars?.[sc.id] || 0;
    const card = el('div', 'scenario-card');
    card.setAttribute('role', 'button'); card.setAttribute('tabindex', '0');
    card.innerHTML = `
      <span class="scenario-num">${i + 1}</span>
      <div>
        <div class="scenario-title">${sc.title}</div>
        <div style="font-size:11px;color:var(--text-dim);margin-top:3px">${sc.goal.label}</div>
      </div>
      ${stars ? `<span class="scenario-stars">${'★'.repeat(stars)}</span>` : ''}
    `;
    card.addEventListener('click', () => onSelect(i));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') onSelect(i); });
    list.appendChild(card);
  });
  s.appendChild(list);
  app.appendChild(s);
}
