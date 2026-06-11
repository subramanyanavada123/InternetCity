// Module 3 — Rocket Launch Center  (Priority Queues & Scheduling)
import { makeHUD, makeCard, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';
import { t } from '../../shared/i18n.js';

const TYPES = [
  { id: 'medical',   emoji: '🚑', label: 'EMERGENCY', priority: 4, color: '#ff6b6b' },
  { id: 'satellite', emoji: '🛰',  label: 'CRITICAL',  priority: 3, color: '#c9b6ff' },
  { id: 'gifts',     emoji: '🎁',  label: 'NORMAL',    priority: 2, color: '#ffd700' },
  { id: 'pizza',     emoji: '🍕',  label: 'LOW',       priority: 1, color: '#ff9944' },
];

let uid = 0;
function mkRocket() {
  const t = TYPES[Math.floor(Math.random() * TYPES.length)];
  return { ...t, uid: ++uid };
}

// inject module-specific styles once
function injectStyles() {
  if (document.getElementById('m3-styles')) return;
  const s = document.createElement('style');
  s.id = 'm3-styles';
  s.textContent = `
    .m3-col { position:absolute;top:56px;bottom:140px;width:44%;overflow-y:auto;
      display:flex;flex-direction:column;gap:8px;padding:8px;
      background:rgba(255,255,255,0.03);border-radius:12px; }
    .m3-col-left  { left:2%; }
    .m3-col-right { right:2%; }
    @media(max-width:500px){
      .m3-col { width:48%;bottom:110px; }
      .m3-col-left  { left:1%; }
      .m3-col-right { right:1%; }
      .m3-card { min-height:56px;padding:8px; }
      .m3-card-emoji { font-size:22px; }
      .m3-card-label { font-size:10px; }
      .m3-pad { height:100px; }
      .m3-countdown { font-size:22px; }
    }
    .m3-col-title { font-size:10px;letter-spacing:2px;color:#8aa6b4;
      text-transform:uppercase;text-align:center;margin-bottom:4px;font-weight:700; }
    .m3-card { border-radius:12px;padding:10px 12px;cursor:grab;user-select:none;
      display:flex;align-items:center;gap:10px;
      border:2px solid transparent;transition:transform 0.15s,opacity 0.15s;
      min-height:68px;position:relative;font-family:'Space Mono',monospace,sans-serif; }
    .m3-card:hover { transform:scale(1.03); }
    .m3-card.dragging { opacity:0.4; transform:scale(0.96); }
    .m3-card-emoji { font-size:28px;line-height:1; }
    .m3-card-info  { flex:1;min-width:0; }
    .m3-card-label { font-size:11px;font-weight:700;letter-spacing:1px; }
    .m3-card-pri   { font-size:10px;opacity:0.7;margin-top:2px; }
    .m3-badge { font-size:9px;font-weight:700;padding:2px 6px;border-radius:6px;
      background:rgba(0,0,0,0.35);letter-spacing:1px;white-space:nowrap; }
    .m3-drop-zone  { border:2px dashed rgba(255,255,255,0.15);border-radius:12px;
      min-height:68px;display:flex;align-items:center;justify-content:center;
      font-size:11px;color:rgba(255,255,255,0.25);letter-spacing:1px; }
    .m3-drop-zone.drag-over { border-color:#46f0c0;background:rgba(70,240,192,0.08); }
    .m3-pad { position:absolute;bottom:0;left:0;right:0;height:130px;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      background:rgba(0,0,0,0.4);border-top:1px solid rgba(255,255,255,0.08); }
    .m3-pad-label { font-size:10px;letter-spacing:2px;color:#8aa6b4;
      text-transform:uppercase;margin-bottom:4px; }
    .m3-countdown { font-size:28px;font-weight:700;color:#46f0c0;font-family:'Space Mono',monospace; }
    @keyframes m3-launch {
      0%   { transform:translateY(0) scale(1); opacity:1; }
      40%  { transform:translateY(-60px) scale(1.1); opacity:1; }
      100% { transform:translateY(-320px) scale(0.5); opacity:0; }
    }
    @keyframes m3-shake-screen {
      0%,100% { transform:translateX(0); }
      20%,60% { transform:translateX(-10px); }
      40%,80% { transform:translateX(10px); }
    }
    @keyframes m3-flash-red {
      0%,100% { box-shadow:none; }
      50%      { box-shadow:0 0 0 4px #ff3860 inset; }
    }
    @keyframes m3-flash-green {
      0%,100% { box-shadow:none; }
      50%      { box-shadow:0 0 0 4px #46f0c0 inset; }
    }
    @keyframes m3-pulse {
      0%,100% { transform:scale(1); }
      50%      { transform:scale(1.05); }
    }
    @keyframes m3-particle {
      0%   { transform:translate(0,0) scale(1); opacity:1; }
      100% { transform:translate(var(--dx),var(--dy)) scale(0); opacity:0; }
    }
    .m3-surge { position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
      font-size:32px;font-weight:700;color:#ff9944;letter-spacing:3px;
      text-shadow:0 0 24px #ff9944;pointer-events:none;z-index:80;
      animation:popIn 0.4s ease both; }
    @keyframes popIn {
      0%   { transform:translate(-50%,-50%) scale(0.5); opacity:0; }
      70%  { transform:translate(-50%,-50%) scale(1.15); opacity:1; }
      100% { transform:translate(-50%,-50%) scale(1); opacity:1; }
    }
  `;
  document.head.appendChild(s);
}

export function launch(app, state, onComplete) {
  injectStyles();

  // --- root ---
  const root = document.createElement('div');
  root.style.cssText = `position:fixed;inset:0;background:#05001a;z-index:10;
    font-family:'Space Mono',monospace,sans-serif;overflow:hidden;`;
  app.appendChild(root);

  // --- starfield canvas ---
  const starCanvas = document.createElement('canvas');
  starCanvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
  root.appendChild(starCanvas);
  function drawStars() {
    const dpr = window.devicePixelRatio || 1;
    starCanvas.width = root.clientWidth * dpr;
    starCanvas.height = root.clientHeight * dpr;
    starCanvas.style.width = root.clientWidth + 'px';
    starCanvas.style.height = root.clientHeight + 'px';
    const ctx = starCanvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, root.clientWidth, root.clientHeight);
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * root.clientWidth;
      const y = Math.random() * root.clientHeight;
      const r = Math.random() * 1.5 + 0.3;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.5})`;
      ctx.fill();
    }
  }
  drawStars();

  // --- game state ---
  let incoming = [];   // waiting rockets
  let queue    = [];   // launch queue (ordered by player)
  let score    = 0;
  let timeLeft = 90;
  let launched = 0;
  let correct  = 0;
  let done     = false;
  let launchCountdown = 8;   // seconds until next auto-launch
  let dragSrcList = null;    // 'incoming' | 'queue'
  let dragSrcIdx  = null;

  // --- HUD ---
  const hud = makeHUD(root, { color: '#c9b6ff' });
  hud.leftEl.style.cursor = 'pointer';
  hud.leftEl.title = 'Quit';
  hud.leftEl.addEventListener('click', () => finish(true));

  function updateHUD() {
    hud.setLeft('◀ Back');
    hud.setCenter(`🚀 ${launched}/10 &nbsp;|&nbsp; ✅ ${correct} correct &nbsp;|&nbsp; ⭐ ${score}pts`);
    hud.setRight(`⏱ ${timeLeft}s`);
  }

  // --- columns ---
  const leftCol = document.createElement('div');
  leftCol.className = 'm3-col m3-col-left';
  root.appendChild(leftCol);

  const rightCol = document.createElement('div');
  rightCol.className = 'm3-col m3-col-right';
  root.appendChild(rightCol);

  // --- launch pad ---
  const pad = document.createElement('div');
  pad.className = 'm3-pad';
  pad.innerHTML = `
    <div class="m3-pad-label">🚀 LAUNCH PAD — next launch in</div>
    <div class="m3-countdown" id="m3-cd">8s</div>
    <div style="font-size:10px;color:#8aa6b4;margin-top:4px;letter-spacing:1px;">
      Drag rockets into queue → priority order wins!
    </div>`;
  root.appendChild(pad);

  // --- render helpers ---
  function makeCardEl(rocket, listName, idx) {
    const card = document.createElement('div');
    card.className = 'm3-card';
    card.draggable = true;
    card.style.cssText += `background:${rocket.color}22;border-color:${rocket.color}55;`;
    card.innerHTML = `
      <div class="m3-card-emoji">${rocket.emoji}</div>
      <div class="m3-card-info">
        <div class="m3-card-label" style="color:${rocket.color}">${rocket.label}</div>
        <div class="m3-card-pri">Priority ${rocket.priority}</div>
      </div>
      <div class="m3-badge" style="color:${rocket.color}">P${rocket.priority}</div>`;

    // HTML5 drag
    card.addEventListener('dragstart', e => {
      dragSrcList = listName;
      dragSrcIdx  = idx;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));

    // Touch drag
    let touchClone = null;
    let touchOffX = 0, touchOffY = 0;
    card.addEventListener('touchstart', e => {
      const t = e.touches[0];
      dragSrcList = listName;
      dragSrcIdx  = idx;
      touchOffX = t.clientX - card.getBoundingClientRect().left;
      touchOffY = t.clientY - card.getBoundingClientRect().top;
      touchClone = card.cloneNode(true);
      touchClone.style.cssText += `position:fixed;z-index:999;opacity:0.85;pointer-events:none;
        width:${card.offsetWidth}px;left:${t.clientX - touchOffX}px;top:${t.clientY - touchOffY}px;`;
      document.body.appendChild(touchClone);
    }, { passive: true });
    card.addEventListener('touchmove', e => {
      e.preventDefault();
      const t = e.touches[0];
      if (touchClone) {
        touchClone.style.left = (t.clientX - touchOffX) + 'px';
        touchClone.style.top  = (t.clientY - touchOffY) + 'px';
      }
    }, { passive: false });
    card.addEventListener('touchend', e => {
      if (touchClone) { touchClone.remove(); touchClone = null; }
      const t = e.changedTouches[0];
      const el = document.elementFromPoint(t.clientX, t.clientY);
      const col = el && el.closest('.m3-col');
      if (col === rightCol) handleDrop('queue', null);
      else if (col === leftCol) handleDrop('incoming', null);
    });

    return card;
  }

  function render() {
    leftCol.innerHTML = '';
    rightCol.innerHTML = '';

    // titles
    const lt = document.createElement('div');
    lt.className = 'm3-col-title';
    lt.textContent = `📡 INCOMING (${incoming.length}/5)`;
    leftCol.appendChild(lt);

    const rt = document.createElement('div');
    rt.className = 'm3-col-title';
    rt.textContent = '🚀 LAUNCH QUEUE';
    rightCol.appendChild(rt);

    if (incoming.length === 0) {
      const dz = document.createElement('div');
      dz.className = 'm3-drop-zone';
      dz.textContent = 'AWAITING ROCKETS…';
      leftCol.appendChild(dz);
    } else {
      incoming.forEach((r, i) => leftCol.appendChild(makeCardEl(r, 'incoming', i)));
    }

    const dz = document.createElement('div');
    dz.className = 'm3-drop-zone';
    dz.style.minHeight = queue.length === 0 ? '80px' : '44px';
    dz.textContent = queue.length === 0 ? 'DROP ROCKETS HERE' : '+';
    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-over'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
    dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('drag-over'); handleDrop('queue', null); });
    rightCol.appendChild(dz);

    queue.forEach((r, i) => {
      const card = makeCardEl(r, 'queue', i);
      // allow drop-between for reorder
      card.addEventListener('dragover', e => { e.preventDefault(); card.style.borderTopColor = '#46f0c0'; });
      card.addEventListener('dragleave', () => { card.style.borderTopColor = r.color + '55'; });
      card.addEventListener('drop', e => {
        e.preventDefault();
        card.style.borderTopColor = r.color + '55';
        handleDrop('queue', i);
      });
      rightCol.appendChild(card);
    });

    // right col: make whole column a drop target
    rightCol.addEventListener('dragover', e => { e.preventDefault(); });
    rightCol.addEventListener('drop', e => { e.preventDefault(); handleDrop('queue', null); });

    updateHUD();
    document.getElementById('m3-cd').textContent = launchCountdown + 's';
  }

  function handleDrop(destList, destIdx) {
    if (dragSrcList === null) return;

    let rocket;
    if (dragSrcList === 'incoming') {
      if (dragSrcIdx === null || dragSrcIdx >= incoming.length) return;
      rocket = incoming.splice(dragSrcIdx, 1)[0];
    } else {
      if (dragSrcIdx === null || dragSrcIdx >= queue.length) return;
      rocket = queue.splice(dragSrcIdx, 1)[0];
    }

    if (destList === 'queue') {
      if (destIdx === null) {
        queue.push(rocket);
      } else {
        queue.splice(destIdx, 0, rocket);
      }
    } else {
      incoming.push(rocket);
    }

    dragSrcList = null;
    dragSrcIdx  = null;
    sfx.swipe();
    render();
  }

  // --- auto-launch ---
  function triggerLaunch() {
    if (queue.length === 0) return;

    // Snapshot queue BEFORE shift — check if top was highest priority in queue
    const topPriority = Math.max(...queue.map(r => r.priority));
    const launched_rocket = queue.shift();
    const wasCorrect = launched_rocket.priority === topPriority;

    launched++;
    if (wasCorrect) {
      correct++;
      score += 50;
      sfx.launch();
      animateLaunchSuccess(launched_rocket.emoji, launched_rocket.color);
      flashScreen('green');
      showFeedback(`✅ Correct! P${launched_rocket.priority} launched first`, '#46f0c0');
    } else {
      score = Math.max(0, score - 20);
      sfx.fail();
      flashScreen('red');
      showFeedback(`❌ Wrong order! P${topPriority} should launch first`, '#ff6b6b');
    }

    launchCountdown = 8;
    render();
    checkWin();
  }

  function showFeedback(msg, color) {
    const el = document.createElement('div');
    el.style.cssText = `position:absolute;top:60px;left:50%;transform:translateX(-50%);
      background:rgba(0,0,0,0.8);border:1px solid ${color};border-radius:10px;
      padding:8px 16px;font-size:12px;font-weight:700;color:${color};
      z-index:90;pointer-events:none;white-space:nowrap;
      animation:popIn 0.3s ease both;`;
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }

  function animateLaunchSuccess(emoji, color) {
    const el = document.createElement('div');
    el.style.cssText = `position:absolute;bottom:145px;left:50%;transform:translateX(-50%);
      font-size:36px;pointer-events:none;z-index:70;animation:m3-launch 0.7s ease-out forwards;`;
    el.textContent = emoji;
    root.appendChild(el);
    setTimeout(() => el.remove(), 750);
    // particle trail
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      const angle = -90 + (Math.random() - 0.5) * 60;
      const dist  = 60 + Math.random() * 80;
      const dx = Math.round(Math.cos(angle * Math.PI / 180) * dist);
      const dy = Math.round(Math.sin(angle * Math.PI / 180) * dist);
      p.style.cssText = `position:absolute;bottom:145px;left:50%;
        width:8px;height:8px;border-radius:50%;
        background:${color};pointer-events:none;z-index:69;
        --dx:${dx}px;--dy:${dy}px;
        animation:m3-particle 0.6s ease-out ${i * 30}ms forwards;`;
      root.appendChild(p);
      setTimeout(() => p.remove(), 700);
    }
  }

  function flashScreen(type) {
    root.style.animation = '';
    root.offsetWidth; // reflow
    if (type === 'red') {
      root.style.animation = 'm3-shake-screen 0.4s ease';
      setTimeout(() => { root.style.animation = ''; }, 420);
    } else {
      root.style.boxShadow = 'inset 0 0 40px #46f0c080';
      setTimeout(() => { root.style.boxShadow = ''; }, 600);
    }
  }

  function showMissionFailed() {
    const el = document.createElement('div');
    el.style.cssText = `position:absolute;top:50%;left:50%;
      transform:translate(-50%,-50%);
      background:#1a0010;border:2px solid #ff3860;border-radius:16px;
      padding:18px 32px;font-size:20px;font-weight:700;color:#ff3860;
      z-index:90;pointer-events:none;text-align:center;
      animation:popIn 0.3s ease both;`;
    el.textContent = 'MISSION FAILED 💥';
    root.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }

  // --- surge event ---
  function triggerSurge() {
    const needed = Math.min(3, 5 - incoming.length);
    for (let i = 0; i < needed; i++) incoming.push(mkRocket());
    const el = document.createElement('div');
    el.className = 'm3-surge';
    el.textContent = '⚡ SURGE! ⚡';
    root.appendChild(el);
    setTimeout(() => el.remove(), 1800);
    sfx.boom();
    render();
  }

  // --- win check ---
  function checkWin() {
    if (launched >= 10) finish(false);
  }

  function finish(back) {
    if (done) return;
    done = true;
    clearInterval(mainTimer);
    clearInterval(spawnTimer);
    clearInterval(surgeTimer);

    if (back) { onComplete(0, 0); root.remove(); return; }

    const pct = launched > 0 ? correct / launched : 0;
    let stars = 0;
    if (launched >= 5) stars = 1;
    if (launched >= 8 && pct > 0.6) stars = 2;
    if (launched >= 10 && pct > 0.8) stars = 3;

    const coins = stars * 30 + Math.floor(score / 10);

    showStarResult(root, {
      stars,
      title: stars === 3 ? 'Perfect Mission! 🚀' : stars === 2 ? 'Great Work!' : 'Mission Done',
      lines: [
        `Rockets launched: ${launched}`,
        `Correct order: ${Math.round(pct * 100)}%`,
        `Score: ${score} pts`,
        `<br><strong style="color:#46f0c0">You just built a priority queue — the same algorithm hospitals,<br>911 centers, and internet routers use every second! 🌐</strong>`,
      ],
      coins,
      color: '#c9b6ff',
      onContinue: () => { onComplete(stars, coins); root.remove(); },
    });
  }

  // --- spawn rockets ---
  function spawnRocket() {
    if (incoming.length < 5) {
      incoming.push(mkRocket());
      render();
    }
  }

  // --- timers ---
  const spawnTimer = setInterval(spawnRocket, 3000);
  const surgeTimer = setInterval(triggerSurge, 20000);

  const mainTimer = setInterval(() => {
    if (done) return;
    timeLeft--;
    launchCountdown--;
    updateHUD();
    const cdEl = document.getElementById('m3-cd');
    if (cdEl) cdEl.textContent = launchCountdown + 's';

    if (launchCountdown <= 0) {
      launchCountdown = 8;
      triggerLaunch();
    }
    if (timeLeft <= 0) finish(false);
  }, 1000);

  showLessonBanner(root, {
    concept: t('m3.concept'),
    detail: t('m3.banner'),
    color: '#ff6b35',
  });

  showIntro(root, {
    emoji: '🚀',
    title: t('m3.title'),
    concept: t('m3.concept'),
    howto: t('m3.howto'),
    color: '#c9b6ff',
    onStart: () => {
      incoming.push(mkRocket());
      incoming.push(mkRocket());
      render();
    },
  });
}
