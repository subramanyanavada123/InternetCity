import { makeHUD, makeCard, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';
import { t } from '../../shared/i18n.js';

// ── Bidder definitions ────────────────────────────────────────────────────────
const BASE_BIDDERS = [
  { id:'hospital',    emoji:'🚑', name:'Hospital',      priority:'CRITICAL', needs:40, color:'#ff6b6b' },
  { id:'fire',        emoji:'🚒', name:'Fire Station',  priority:'CRITICAL', needs:30, color:'#ff9f43' },
  { id:'school',      emoji:'🏫', name:'School',        priority:'HIGH',     needs:25, color:'#ffd700' },
  { id:'news',        emoji:'📡', name:'News Station',  priority:'HIGH',     needs:20, color:'#74b9ff' },
  { id:'residential', emoji:'🏠', name:'Residential',   priority:'MEDIUM',   needs:35, color:'#a29bfe' },
  { id:'mall',        emoji:'🛒', name:'Mall',          priority:'MEDIUM',   needs:25, color:'#fd79a8' },
  { id:'gaming',      emoji:'🎮', name:'Gaming Server', priority:'LOW',      needs:50, color:'#55efc4' },
  { id:'streaming',   emoji:'📺', name:'Streaming',     priority:'LOW',      needs:45, color:'#636e72' },
];

const PRIORITY_WEIGHT = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

const ROUND_CONFIG = [
  { label:'Normal Operations', pool:150, surgeIds:[] },
  { label:'SURGE EVENT',       pool:150, surgeIds:['hospital','fire'] },
  { label:'BLACKOUT',          pool:80,  surgeIds:[] },
];

// ── Style injection ───────────────────────────────────────────────────────────
function injectStyles() {
  if (document.getElementById('m11-styles')) return;
  const s = document.createElement('style');
  s.id = 'm11-styles';
  s.textContent = `
    @keyframes m11-pulse-red {
      0%,100% { box-shadow:0 0 0 0 rgba(255,80,80,0); }
      50%      { box-shadow:0 0 0 8px rgba(255,80,80,0.6); }
    }
    @keyframes m11-float-up {
      0%   { transform:translateY(0); opacity:1; }
      100% { transform:translateY(-60px); opacity:0; }
    }
    @keyframes m11-amber-glow {
      0%,100% { box-shadow:0 2px 12px rgba(255,160,50,0.12); }
      50%      { box-shadow:0 2px 24px rgba(255,160,50,0.35); }
    }
    .m11-card-pulse { animation:m11-pulse-red 0.8s infinite; }
    .m11-bidder-card {
      background:linear-gradient(145deg,#2a1400,#1a0c00);
      border:1px solid rgba(255,160,50,0.2);
      border-radius:14px;
      padding:12px;
      position:relative;
      animation:m11-amber-glow 3s ease-in-out infinite;
      transition:border-color 0.3s;
    }
    .m11-floater {
      position:absolute;top:8px;right:8px;
      pointer-events:none;z-index:20;font-size:28px;
      animation:m11-float-up 1.2s ease-out forwards;
    }
    .m11-slider { -webkit-appearance:none;width:100%;height:6px;border-radius:3px;outline:none;cursor:pointer; }
    .m11-slider::-webkit-slider-thumb {
      -webkit-appearance:none;width:18px;height:18px;border-radius:50%;
      cursor:pointer;border:2px solid rgba(255,255,255,0.4);
    }
    .m11-slider::-moz-range-thumb {
      width:18px;height:18px;border-radius:50%;
      cursor:pointer;border:2px solid rgba(255,255,255,0.4);
    }
  `;
  document.head.appendChild(s);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function calcHappiness(allocated, needs) {
  if (allocated >= needs)        return 1.0;
  if (allocated >= needs * 0.7)  return 0.7;
  return 0.3;
}

function happinessEmoji(h) {
  return h >= 1.0 ? '😊' : h >= 0.7 ? '😐' : '😤';
}

function calcRoundScore(bidders, allocs) {
  let score = 0;
  for (const b of bidders) {
    const h = calcHappiness(allocs[b.id] || 0, b.needs);
    if (b.priority === 'CRITICAL' && (allocs[b.id] || 0) === 0) score -= 50;
    score += h * 100 * PRIORITY_WEIGHT[b.priority];
  }
  return Math.round(score);
}

// ── Main launch ───────────────────────────────────────────────────────────────
export function launch(app, state, onComplete) {
  injectStyles();

  const root = document.createElement('div');
  root.style.cssText = `
    position:fixed;inset:0;background:#1a0800;
    font-family:'Space Mono',monospace,sans-serif;
    overflow-y:auto;z-index:10;color:#fff;
  `;
  app.appendChild(root);

  const hud = makeHUD(root, { color: '#ffb347' });

  const backBtn = document.createElement('button');
  backBtn.style.cssText = `
    position:fixed;top:8px;left:16px;z-index:70;
    background:rgba(0,0,0,0.5);border:1px solid #ffb34766;border-radius:10px;
    color:#ffb347;font-size:13px;font-weight:700;cursor:pointer;
    padding:6px 12px;font-family:inherit;
  `;
  backBtn.textContent = '← Missions';
  backBtn.addEventListener('click', () => { cleanup(); onComplete(0, 0); });
  root.appendChild(backBtn);

  // Game state
  let round = 0;
  let totalScore = 0;
  let timeLeft = 30;
  let timerInterval = null;
  let hadCriticalGap = false;
  let allocs = {};
  let bidders = [];

  function buildBidders() {
    const cfg = ROUND_CONFIG[round];
    bidders = BASE_BIDDERS.map(b => ({
      ...b,
      needs: cfg.surgeIds.includes(b.id) ? b.needs * 2 : b.needs,
    }));
    allocs = {};
    bidders.forEach(b => { allocs[b.id] = 0; });
  }

  function poolLimit() { return ROUND_CONFIG[round].pool; }
  function totalAllocated() { return Object.values(allocs).reduce((s, v) => s + v, 0); }

  // ── DOM structure ─────────────────────────────────────────────────────────
  const header = document.createElement('div');
  header.style.cssText = 'text-align:center;padding:56px 16px 6px;';
  header.innerHTML = `
    <div style="font-size:11px;letter-spacing:3px;color:#ffb347;text-transform:uppercase;margin-bottom:4px;">◈ Internet Bandwidth Auction</div>
    <div id="m11-round-label" style="font-size:17px;font-weight:700;color:#fff;"></div>
  `;
  root.appendChild(header);

  // Pool bar section
  const poolSec = document.createElement('div');
  poolSec.style.cssText = 'padding:8px 20px 4px;max-width:860px;margin:0 auto;';
  poolSec.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
      <span style="font-size:11px;color:#ffb347;font-weight:700;letter-spacing:2px;">BANDWIDTH POOL</span>
      <span id="m11-pool-text" style="font-size:12px;font-weight:700;color:#fff;"></span>
    </div>
    <div style="background:#2a1400;border-radius:8px;height:14px;overflow:hidden;border:1px solid #ffb34733;">
      <div id="m11-pool-bar" style="height:100%;border-radius:8px;transition:width 0.15s,background 0.3s;width:0%;background:#2ecc71;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:2px;">
      <span style="font-size:10px;color:#666;">0</span>
      <span id="m11-pool-limit" style="font-size:10px;color:#666;"></span>
    </div>
  `;
  root.appendChild(poolSec);

  // Timer section
  const timerSec = document.createElement('div');
  timerSec.style.cssText = 'padding:4px 20px 6px;max-width:860px;margin:0 auto;';
  timerSec.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
      <span style="font-size:10px;color:#888;letter-spacing:2px;">TIME</span>
      <span id="m11-timer" style="font-size:12px;font-weight:700;color:#ffd700;">30s</span>
    </div>
    <div style="background:#2a1400;border-radius:4px;height:5px;overflow:hidden;">
      <div id="m11-timer-bar" style="height:100%;border-radius:4px;background:#ffd700;transition:width 1s linear;width:100%;"></div>
    </div>
  `;
  root.appendChild(timerSec);

  // Bidder grid
  const grid = document.createElement('div');
  grid.style.cssText = `
    display:grid;grid-template-columns:repeat(2,1fr);gap:10px;
    padding:6px 14px;max-width:860px;margin:0 auto;
  `;
  root.appendChild(grid);

  // Confirm button
  const confirmBtn = document.createElement('button');
  confirmBtn.style.cssText = `
    display:block;margin:10px auto 28px;
    background:linear-gradient(135deg,#ff9f43,#e67e22);
    border:none;border-radius:14px;color:#fff;
    font-size:15px;font-weight:700;cursor:pointer;
    padding:13px 38px;font-family:inherit;
    box-shadow:0 4px 20px rgba(255,160,50,0.4);
    transition:transform 0.1s,box-shadow 0.1s;letter-spacing:1px;
  `;
  confirmBtn.textContent = 'CONFIRM ALLOCATION';
  confirmBtn.addEventListener('mouseenter', () => { confirmBtn.style.transform='scale(1.04)'; confirmBtn.style.boxShadow='0 6px 28px rgba(255,160,50,0.6)'; });
  confirmBtn.addEventListener('mouseleave', () => { confirmBtn.style.transform='scale(1)'; confirmBtn.style.boxShadow='0 4px 20px rgba(255,160,50,0.4)'; });
  confirmBtn.addEventListener('click', onConfirm);
  root.appendChild(confirmBtn);

  // ── Build bidder grid cards ───────────────────────────────────────────────
  function buildGrid() {
    grid.innerHTML = '';
    const cfg = ROUND_CONFIG[round];
    const priorityColors = { CRITICAL: '#ff6b6b', HIGH: '#ffd700', MEDIUM: '#a29bfe', LOW: '#55efc4' };

    bidders.forEach(b => {
      const card = document.createElement('div');
      card.className = 'm11-bidder-card';
      card.id = `m11-card-${b.id}`;
      card.style.borderColor = b.color + '44';

      const surgeTag = cfg.surgeIds.includes(b.id)
        ? `<span style="font-size:9px;background:#ff4444;color:#fff;border-radius:4px;padding:1px 5px;margin-left:4px;">2× SURGE</span>`
        : '';

      card.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <div style="display:flex;align-items:center;gap:7px;">
            <span style="font-size:20px;">${b.emoji}</span>
            <div>
              <div style="font-size:12px;font-weight:700;color:#fff;">${b.name}${surgeTag}</div>
              <span style="font-size:9px;font-weight:700;color:${priorityColors[b.priority]};
                background:${priorityColors[b.priority]}22;padding:1px 5px;border-radius:4px;">
                ${b.priority}
              </span>
            </div>
          </div>
          <div id="m11-hap-${b.id}" style="font-size:22px;line-height:1;">😐</div>
        </div>
        <div style="font-size:11px;color:#aaa;margin-bottom:6px;">
          Needs: <strong style="color:${b.color};">${b.needs} units</strong>
        </div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
          <span style="font-size:10px;color:#666;min-width:14px;">0</span>
          <input type="range" class="m11-slider" id="m11-sl-${b.id}"
            min="0" max="60" value="0" step="1"
            style="background:linear-gradient(to right,${b.color} 0%,#333 0%);"
          />
          <span style="font-size:10px;color:#666;min-width:20px;">60</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
          <span style="font-size:11px;color:#bbb;">Allocated:</span>
          <span id="m11-val-${b.id}" style="font-size:13px;font-weight:700;color:${b.color};">0</span>
        </div>
        <div style="background:#1a0800;border-radius:5px;height:7px;overflow:hidden;">
          <div id="m11-hbar-${b.id}" style="height:100%;border-radius:5px;width:0%;background:#555;transition:width 0.15s,background 0.3s;"></div>
        </div>
        <div id="m11-warn-${b.id}" style="display:none;font-size:10px;color:#ff4444;margin-top:3px;font-weight:700;">⚠️ EMERGENCY UNSERVED!</div>
      `;

      grid.appendChild(card);

      const ts = document.createElement('style');
      ts.textContent = `#m11-sl-${b.id}::-webkit-slider-thumb{background:${b.color}}#m11-sl-${b.id}::-moz-range-thumb{background:${b.color}}`;
      document.head.appendChild(ts);

      const slider = card.querySelector(`#m11-sl-${b.id}`);
      slider.addEventListener('input', () => onSliderChange(b.id, parseInt(slider.value)));
    });
  }

  // ── UI updates ────────────────────────────────────────────────────────────
  function updatePoolBar() {
    const used = totalAllocated(), limit = poolLimit();
    const pct = Math.min(used / limit, 1) * 100, over = used > limit;
    const bar = document.getElementById('m11-pool-bar'), txt = document.getElementById('m11-pool-text'), lim = document.getElementById('m11-pool-limit');
    if (bar) { bar.style.width = pct + '%'; bar.style.background = over ? '#ff4444' : pct > 80 ? '#ffb347' : '#2ecc71'; }
    if (txt) { txt.textContent = `${used} / ${limit} units${over ? ' — OVER LIMIT!' : ''}`; txt.style.color = over ? '#ff4444' : '#fff'; }
    if (lim) lim.textContent = String(limit);
  }

  function updateCard(id) {
    const b = bidders.find(x => x.id === id);
    if (!b) return;
    const val = allocs[id] || 0, h = calcHappiness(val, b.needs);
    const hapColor = h >= 1 ? '#2ecc71' : h >= 0.7 ? '#f9ca24' : '#ff4444';
    const isCritical = b.priority === 'CRITICAL', unserved = val === 0;
    const valEl = document.getElementById(`m11-val-${id}`);
    const hbar   = document.getElementById(`m11-hbar-${id}`);
    const hapEl  = document.getElementById(`m11-hap-${id}`);
    const warnEl = document.getElementById(`m11-warn-${id}`);
    const cardEl = document.getElementById(`m11-card-${id}`);
    const slider = document.getElementById(`m11-sl-${id}`);

    if (valEl) valEl.textContent = String(val);
    if (hbar)  { hbar.style.width = (h * 100) + '%'; hbar.style.background = hapColor; }
    if (hapEl) hapEl.textContent = happinessEmoji(h);
    if (warnEl) warnEl.style.display = (isCritical && unserved) ? 'block' : 'none';
    if (cardEl) {
      if (isCritical && unserved) {
        cardEl.classList.add('m11-card-pulse');
        cardEl.style.borderColor = '#ff444488';
      } else {
        cardEl.classList.remove('m11-card-pulse');
        cardEl.style.borderColor = b.color + '44';
      }
    }
    if (slider) {
      const pct = (val / 60) * 100;
      slider.style.background = `linear-gradient(to right,${b.color} ${pct}%,#333 ${pct}%)`;
    }
  }

  function onSliderChange(id, raw) {
    const current = allocs[id] || 0;
    const otherUsed = totalAllocated() - current;
    const maxAllowed = Math.min(60, poolLimit() - otherUsed);
    const val = Math.max(0, Math.min(raw, maxAllowed));

    if (val !== raw) {
      const sl = document.getElementById(`m11-sl-${id}`);
      if (sl) sl.value = String(val);
    }

    allocs[id] = val;
    updateCard(id);
    updatePoolBar();
    sfx.click();
  }

  // ── Timer ─────────────────────────────────────────────────────────────────
  function startTimer() {
    timeLeft = 30; updateTimerUI();
    timerInterval = setInterval(() => {
      timeLeft--; updateTimerUI();
      if (timeLeft <= 0) { clearInterval(timerInterval); timerInterval = null; onConfirm(); }
    }, 1000);
  }
  function updateTimerUI() {
    const el = document.getElementById('m11-timer'), bar = document.getElementById('m11-timer-bar');
    if (el) el.textContent = timeLeft + 's';
    if (bar) bar.style.width = (timeLeft / 30 * 100) + '%';
  }

  // ── Round lifecycle ───────────────────────────────────────────────────────
  function startRound() {
    buildBidders();
    buildGrid();
    const lbl = document.getElementById('m11-round-label');
    if (lbl) {
      const cfg = ROUND_CONFIG[round];
      lbl.textContent = `Round ${round + 1}/3 — ${cfg.label}`;
      lbl.style.color = round === 2 ? '#ff6b6b' : round === 1 ? '#ffb347' : '#fff';
    }
    hud.setLeft(`Score: ${totalScore}`);
    hud.setRight(`Round ${round + 1} / 3`);
    updatePoolBar();
    bidders.forEach(b => updateCard(b.id));
    confirmBtn.disabled = false;
    confirmBtn.style.opacity = '1';
    startTimer();
  }

  function onConfirm() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    confirmBtn.disabled = true;
    confirmBtn.style.opacity = '0.5';

    const roundScore = calcRoundScore(bidders, allocs);
    totalScore += roundScore;
    hud.setLeft(`Score: ${totalScore}`);

    const critUnserved = bidders.filter(b => b.priority === 'CRITICAL' && (allocs[b.id] || 0) === 0);
    if (critUnserved.length > 0) { hadCriticalGap = true; sfx.fail(); } else { sfx.coin(); }

    // Float reaction emojis
    bidders.forEach((b, i) => {
      setTimeout(() => {
        const h = calcHappiness(allocs[b.id] || 0, b.needs);
        const emoji = h >= 1 ? '😊' : h >= 0.7 ? '😐' : '😡';
        const cardEl = document.getElementById(`m11-card-${b.id}`);
        if (!cardEl) return;
        const f = document.createElement('div');
        f.className = 'm11-floater';
        f.textContent = emoji;
        cardEl.appendChild(f);
        setTimeout(() => f.remove(), 1200);
      }, i * 90);
    });

    setTimeout(() => showRoundResult(roundScore, round >= 2), 1400);
  }

  function showRoundResult(roundScore, isLast) {
    const card = makeCard(root, { title: `◈ Round ${round + 1} Complete`, color: '#ffb347' });
    const penalty = bidders.filter(b => b.priority === 'CRITICAL' && (allocs[b.id] || 0) === 0).length * 50;
    card.body.innerHTML = `
      <div style="text-align:center;margin-bottom:16px;">
        <div style="font-size:36px;margin-bottom:8px;">${roundScore > 200 ? '🎉' : roundScore > 0 ? '👍' : '😬'}</div>
        <div style="font-size:13px;color:#ccc;margin-top:6px;">Round score: <strong style="color:#ffd700;">+${roundScore}</strong></div>
        <div style="font-size:13px;color:#ccc;margin-top:6px;">${penalty > 0
          ? `<span style="color:#ff4444;">Critical penalty: -${penalty} pts</span>`
          : 'All critical services covered ✓'}</div>
        <div style="font-size:13px;color:#ccc;margin-top:6px;">Running total: <strong style="color:#ffb347;">${totalScore}</strong></div>
      </div>
    `;
    const btn = document.createElement('button');
    btn.style.cssText = `
      width:100%;padding:12px;border-radius:10px;border:none;
      background:#ffb347;color:#000;font-size:14px;font-weight:700;
      cursor:pointer;font-family:inherit;margin-top:4px;
    `;
    btn.textContent = isLast ? 'See Final Results' : `Round ${round + 2}: ${ROUND_CONFIG[round + 1].label} →`;
    btn.addEventListener('click', () => {
      card.remove();
      if (isLast) showFinalResult(); else { round++; startRound(); }
    });
    card.body.appendChild(btn);
  }

  function showFinalResult() {
    let stars = hadCriticalGap ? 0 : 1;
    if (totalScore > 500) stars = 2;
    if (totalScore > 750) stars = 3;
    const coins = Math.floor(totalScore / 10);
    const titles = ['Needs Work', 'Bandwidth Manager', 'Efficient Allocator', 'QoS Master!'];

    if (stars >= 2) sfx.win(); else sfx.fail();

    showStarResult(root, {
      stars,
      title: titles[stars],
      lines: [
        `Total score: ${totalScore}`,
        totalScore > 750 ? 'Near-optimal allocation every round!' :
          totalScore > 500 ? 'Good balance of priorities!' :
          'Try allocating more to critical services.',
        stars < 3 ? 'Score >750 for ⭐⭐⭐' : 'All services optimally served! 🏆',
      ],
      coins,
      color: '#ffb347',
      onContinue: (s) => { cleanup(); onComplete(s, coins); },
    });
  }

  function cleanup() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    root.remove();
  }

  showLessonBanner(root, {
    concept: t('m11.concept'),
    detail: 'Networks share limited bandwidth between many users. Prioritising critical services keeps the network fair and reliable.',
    color: '#e17055',
  });

  showIntro(root, {
    emoji: '💰',
    title: t('m11.title'),
    concept: t('m11.concept'),
    howto: t('m11.howto'),
    color: '#e17055',
    onStart: () => { startRound(); },
  });
}
