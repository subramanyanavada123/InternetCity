import { makeGameShell, makeHUD, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';
import { t } from '../../shared/i18n.js';

// ── Object type definitions ───────────────────────────────────────────────────
const REAL_TYPES = [
  { emoji: '🐱', label: 'Cat video',     speed: 0.6, path: 'wiggly'  },
  { emoji: '💎', label: 'Treasure data', speed: 1.1, path: 'straight' },
  { emoji: '🎮', label: 'Game update',   speed: 1.0, path: 'curve'   },
  { emoji: '📱', label: 'Phone call',    speed: 1.6, path: 'straight' },
];
const FAKE_TYPES = [
  { emoji: '👾', label: 'Virus',       speed: 1.5, path: 'zigzag'   },
  { emoji: '💀', label: 'Ransomware',  speed: 2.0, path: 'straight' },
  { emoji: '🤖', label: 'BOT-47',      speed: 1.1, path: 'straight' },
  { emoji: '📧', label: 'SPAM',        speed: 0.7, path: 'straight' },
];

// Round configuration
const ROUNDS = [
  { duration: 30, fakeRatio: 0.30, speedMult: 1.0, spawnInterval: 1500 },
  { duration: 30, fakeRatio: 0.40, speedMult: 1.4, spawnInterval: 1100 },
  { duration: 30, fakeRatio: 0.50, speedMult: 1.8, spawnInterval: 800  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function rand(min, max) { return min + Math.random() * (max - min); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function spawnObject(W, H, round) {
  const cfg = ROUNDS[round];
  const isFake = Math.random() < cfg.fakeRatio;
  const def = isFake ? pick(FAKE_TYPES) : pick(REAL_TYPES);

  // Spawn from one of 4 edges
  const edge = Math.floor(Math.random() * 4);
  let x, y;
  if (edge === 0) { x = rand(40, W - 40); y = -20; }       // top
  else if (edge === 1) { x = W + 20; y = rand(40, H - 40); } // right
  else if (edge === 2) { x = rand(40, W - 40); y = H + 20; } // bottom
  else                 { x = -20; y = rand(40, H - 40); }    // left

  const cx = W / 2, cy = H / 2;
  const dx = cx - x, dy = cy - y;
  const dist = Math.hypot(dx, dy);
  const spd = def.speed * cfg.speedMult;
  const vx = (dx / dist) * spd;
  const vy = (dy / dist) * spd;

  return {
    x, y, vx, vy,
    baseVx: vx, baseVy: vy,
    real: !isFake,
    emoji: def.emoji,
    label: isFake ? def.label : null,
    path: def.path,
    slashed: false,
    reached: false,
    age: 0,
    zigDir: 1,
    zigTimer: 0,
    wigglePhase: Math.random() * Math.PI * 2,
  };
}

function makeParticle(x, y, color) {
  const angle = Math.random() * Math.PI * 2;
  const spd = 2 + Math.random() * 5;
  return { x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, life: 1, decay: 0.03 + Math.random() * 0.02, r: 3 + Math.random() * 4, color };
}

function burstParticles(x, y, color, count = 8) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(makeParticle(x, y, color));
  return out;
}

// ── Main launch ───────────────────────────────────────────────────────────────
export function launch(app, state, onComplete) {
  const shell = makeGameShell(app, { bgColor: '#001a10' });
  const { root, canvas, ctx, W, H, destroy, canvasXY } = shell;

  const hud = makeHUD(root, { color: '#46f0c0' });

  // Back button
  const backBtn = document.createElement('button');
  backBtn.style.cssText = `position:absolute;top:8px;left:16px;z-index:70;
    background:rgba(0,0,0,0.5);border:1px solid #46f0c066;border-radius:10px;
    color:#46f0c0;font-size:13px;font-weight:700;cursor:pointer;
    padding:6px 12px;font-family:inherit;pointer-events:auto;`;
  backBtn.textContent = t('btn.back');
  backBtn.addEventListener('click', () => { cleanup(); onComplete(0, 0); });
  root.appendChild(backBtn);

  // Power buttons
  const powers = { freeze: true, shield: true, scan: true };
  const isMob = window.innerWidth <= 500;
  const powerWrap = document.createElement('div');
  powerWrap.style.cssText = isMob
    ? `position:absolute;bottom:8px;left:0;right:0;z-index:70;
       display:flex;flex-direction:row;justify-content:center;gap:8px;padding:0 8px;`
    : `position:absolute;bottom:16px;right:16px;z-index:70;
       display:flex;flex-direction:column;gap:8px;`;
  root.appendChild(powerWrap);

  function makePowerBtn(id, emoji, label) {
    const btn = document.createElement('button');
    btn.style.cssText = isMob
      ? `background:rgba(0,26,16,0.9);border:1px solid #46f0c0;
         border-radius:10px;color:#46f0c0;font-size:11px;font-weight:700;cursor:pointer;
         padding:6px 10px;font-family:inherit;transition:opacity 0.2s;flex:1;max-width:100px;`
      : `background:rgba(0,26,16,0.85);border:1px solid #46f0c0;
         border-radius:10px;color:#46f0c0;font-size:13px;font-weight:700;cursor:pointer;
         padding:7px 12px;font-family:inherit;transition:opacity 0.2s;`;
    btn.innerHTML = `${emoji} ${label}`;
    btn.dataset.id = id;
    powerWrap.appendChild(btn);
    return btn;
  }
  const freezeBtn = makePowerBtn('freeze', '🧊', 'Freeze');
  const shieldBtn = makePowerBtn('shield', '🛡', 'Shield');
  const scanBtn   = makePowerBtn('scan',   '🔍', 'Scan');

  // ── Game state ────────────────────────────────────────────────────────────
  let objects = [];
  let particles = [];
  let slashEffects = [];    // {x1,y1,x2,y2,life}
  let floatTexts = [];      // {x,y,text,color,life,vy}
  let hp = 5;
  let score = 0;
  let round = 0;
  let roundTime = 0;
  let totalFalsePositives = 0;
  let totalSlashes = 0;
  let gameOver = false;
  let frozen = false;
  let frozenTimer = 0;
  let shieldActive = false;
  let scanActive = false;
  let scanTimer = 0;
  let templeFlash = 0;   // red flash alpha
  let spawnTimer = 0;
  let raf = null;
  let lastTs = 0;
  let showingRoundOverlay = false;
  let roundOverlayTimer = 0;
  let roundOverlayText = '';
  let gameEnded = false;

  // Static rune positions (decorative)
  const runes = [];
  for (let i = 0; i < 18; i++) {
    runes.push({ x: rand(0.05, 0.95), y: rand(0.05, 0.95), sym: pick(['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ']), phase: Math.random() * Math.PI * 2 });
  }

  // Power button handlers
  freezeBtn.addEventListener('click', () => {
    if (!powers.freeze || gameOver || showingRoundOverlay) return;
    powers.freeze = false;
    frozen = true;
    frozenTimer = 3000;
    freezeBtn.style.opacity = '0.35';
    freezeBtn.style.cursor = 'default';
    sfx.pop();
  });
  shieldBtn.addEventListener('click', () => {
    if (!powers.shield || gameOver || showingRoundOverlay) return;
    powers.shield = false;
    shieldActive = true;
    shieldBtn.style.opacity = '0.35';
    shieldBtn.style.cursor = 'default';
    sfx.pop();
  });
  scanBtn.addEventListener('click', () => {
    if (!powers.scan || gameOver || showingRoundOverlay) return;
    powers.scan = false;
    scanActive = true;
    scanTimer = 5000;
    scanBtn.style.opacity = '0.35';
    scanBtn.style.cursor = 'default';
    sfx.pop();
  });

  // ── Input ─────────────────────────────────────────────────────────────────
  function pointerPos(e) { return canvasXY(e); }

  function onPointerDown(e) {
    e.preventDefault();
    if (gameOver || showingRoundOverlay) return;
    const { x, y } = pointerPos(e);

    // Find closest un-slashed object within 35px
    let closest = null, minDist = 35;
    for (const obj of objects) {
      if (obj.slashed || obj.reached) continue;
      const d = Math.hypot(obj.x - x, obj.y - y);
      if (d < minDist) { minDist = d; closest = obj; }
    }

    // Draw slash arc
    const angle = Math.random() * Math.PI;
    const len = 40 + Math.random() * 30;
    slashEffects.push({
      x1: x - Math.cos(angle) * len / 2,
      y1: y - Math.sin(angle) * len / 2,
      x2: x + Math.cos(angle) * len / 2,
      y2: y + Math.sin(angle) * len / 2,
      life: 1,
    });

    if (!closest) return;
    closest.slashed = true;
    totalSlashes++;

    if (!closest.real) {
      // Correct slash — fake object blocked
      score += 20;
      sfx.swipe();
      particles.push(...burstParticles(closest.x, closest.y, '#46f0c0', 10));
      floatTexts.push({ x: closest.x, y: closest.y - 20, text: '+20 ✅', color: '#46f0c0', life: 1, vy: -1.2 });
    } else {
      // False positive — slashed a real object
      score -= 10;
      totalFalsePositives++;
      sfx.block();
      particles.push(...burstParticles(closest.x, closest.y, '#ff4444', 10));
      floatTexts.push({ x: closest.x, y: closest.y - 20, text: 'FALSE POSITIVE! -10', color: '#ff4444', life: 1, vy: -1.2 });
      templeFlash = 0.5;
    }
  }

  canvas.addEventListener('mousedown', onPointerDown);
  canvas.addEventListener('touchstart', onPointerDown, { passive: false });

  // ── Update helpers ─────────────────────────────────────────────────────────
  function updateObjects(dt) {
    const cx = W() / 2, cy = H() / 2;
    const cfg = ROUNDS[round];
    spawnTimer += dt;

    if (!frozen && !showingRoundOverlay && spawnTimer >= cfg.spawnInterval) {
      spawnTimer = 0;
      objects.push(spawnObject(W(), H(), round));
    }

    for (const obj of objects) {
      if (obj.slashed || obj.reached) continue;
      if (frozen) continue;

      obj.age += dt;

      // Path modifiers
      if (obj.path === 'wiggly') {
        const perp = { x: -obj.baseVy, y: obj.baseVx };
        const mag = Math.hypot(perp.x, perp.y) || 1;
        const wave = Math.sin(obj.age * 0.005 + obj.wigglePhase) * 0.7;
        obj.x += obj.baseVx + (perp.x / mag) * wave;
        obj.y += obj.baseVy + (perp.y / mag) * wave;
      } else if (obj.path === 'zigzag') {
        obj.zigTimer += dt;
        if (obj.zigTimer > 300) { obj.zigDir *= -1; obj.zigTimer = 0; }
        const perp = { x: -obj.baseVy, y: obj.baseVx };
        const mag = Math.hypot(perp.x, perp.y) || 1;
        obj.x += obj.baseVx + (perp.x / mag) * obj.zigDir * 1.2;
        obj.y += obj.baseVy + (perp.y / mag) * obj.zigDir * 1.2;
      } else if (obj.path === 'curve') {
        const perp = { x: -obj.baseVy, y: obj.baseVx };
        const mag = Math.hypot(perp.x, perp.y) || 1;
        const curve = Math.sin(obj.age * 0.003) * 0.5;
        obj.x += obj.baseVx + (perp.x / mag) * curve;
        obj.y += obj.baseVy + (perp.y / mag) * curve;
      } else {
        obj.x += obj.vx;
        obj.y += obj.vy;
      }

      // Check if reached portal (within 50px of center)
      const distToCenter = Math.hypot(obj.x - cx, obj.y - cy);
      if (distToCenter < 52) {
        obj.reached = true;
        if (obj.real) {
          // Real data enters safely
          score += 10;
          floatTexts.push({ x: obj.x, y: obj.y - 20, text: '+10', color: '#46f0c0', life: 1, vy: -1.0 });
        } else {
          // Fake reached portal — temple damage
          if (shieldActive) {
            shieldActive = false;
            floatTexts.push({ x: cx, y: cy - 60, text: '🛡 BLOCKED!', color: '#46f0c0', life: 1, vy: -1.0 });
            sfx.pop();
          } else {
            hp = Math.max(0, hp - 1);
            templeFlash = 0.7;
            sfx.fail();
            floatTexts.push({ x: obj.x, y: obj.y - 20, text: '💥 -1 HP', color: '#ff4444', life: 1, vy: -1.2 });
            if (hp <= 0) triggerGameOver();
          }
        }
      }
    }

    // Prune far-gone objects
    objects = objects.filter(o => {
      if (o.slashed) return o.slashed; // keep briefly for rendering (handled by slashEffects)
      return !o.reached;
    });
    // Actually remove slashed/reached immediately (particles already spawned)
    objects = objects.filter(o => !o.slashed && !o.reached);
  }

  function updateRoundTimer(dt) {
    if (showingRoundOverlay || gameOver) return;
    roundTime += dt;
    const cfg = ROUNDS[round];
    if (roundTime >= cfg.duration * 1000) {
      roundTime = 0;
      objects = []; // clear objects between rounds
      round++;
      if (round >= ROUNDS.length) {
        triggerWin();
      } else {
        showRoundOverlay(`ROUND ${round + 1}`);
      }
    }
  }

  function showRoundOverlay(text) {
    showingRoundOverlay = true;
    roundOverlayText = text;
    roundOverlayTimer = 2000;
  }

  function updatePowers(dt) {
    if (frozen) {
      frozenTimer -= dt;
      if (frozenTimer <= 0) { frozen = false; frozenTimer = 0; }
    }
    if (scanActive) {
      scanTimer -= dt;
      if (scanTimer <= 0) { scanActive = false; scanTimer = 0; }
    }
  }

  function triggerGameOver() {
    if (gameEnded) return;
    gameEnded = true;
    gameOver = true;
    sfx.fail();
    setTimeout(() => showResult(false), 1200);
  }

  function triggerWin() {
    if (gameEnded) return;
    gameEnded = true;
    gameOver = true;
    sfx.win();
    setTimeout(() => showResult(true), 1200);
  }

  function showResult(survived) {
    let stars = 0;
    if (survived) {
      stars = 1;
      if (score > 300) stars = 2;
      const fpRate = totalSlashes > 0 ? totalFalsePositives / totalSlashes : 1;
      if (score > 500 && fpRate < 0.2) stars = 3;
    }
    const coins = Math.max(0, Math.floor(score / 5) + stars * 15);
    const fpRate = totalSlashes > 0 ? Math.round((totalFalsePositives / totalSlashes) * 100) : 0;

    showStarResult(root, {
      stars,
      title: survived ? (stars === 3 ? 'Perfect Guardian!' : stars === 2 ? 'Great Defender!' : 'Temple Survived!') : 'Temple Destroyed!',
      lines: [
        `Score: ${score}`,
        `False positive rate: ${fpRate}%`,
        stars < 3 ? 'Score 500+ with <20% false positives for ⭐⭐⭐' : 'Flawless firewall! 🏆',
      ],
      coins,
      color: '#46f0c0',
      onContinue: (action,s) => { cleanup(); if(action!=='retry') onComplete(s,coins); else launch(app,state,onComplete); },
    });
  }

  // ── Draw ──────────────────────────────────────────────────────────────────
  function drawBackground(t) {
    const c = ctx();
    const w = W(), h = H();
    c.fillStyle = '#001a10';
    c.fillRect(0, 0, w, h);

    // Glowing runes
    for (const rune of runes) {
      const glow = 0.15 + 0.1 * Math.sin(t * 0.001 + rune.phase);
      c.font = '18px serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillStyle = `rgba(70,240,192,${glow})`;
      c.fillText(rune.sym, rune.x * w, rune.y * h);
    }

    // Temple flash
    if (templeFlash > 0) {
      c.fillStyle = `rgba(255,0,0,${templeFlash * 0.25})`;
      c.fillRect(0, 0, w, h);
      templeFlash = Math.max(0, templeFlash - 0.03);
    }
  }

  function drawPortal(t) {
    const c = ctx();
    const cx = W() / 2, cy = H() / 2;
    const pulse = 1 + 0.06 * Math.sin(t * 0.003);
    const baseR = 50 * pulse;

    // Outer glow layers
    for (let i = 5; i >= 1; i--) {
      const r = baseR + i * 14;
      const alpha = (0.07 - i * 0.01) * pulse;
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.fillStyle = `rgba(70,240,192,${alpha})`;
      c.fill();
    }

    // Core rings
    for (let i = 3; i >= 0; i--) {
      const r = baseR - i * 10;
      const alpha = 0.15 + i * 0.18;
      c.beginPath();
      c.arc(cx, cy, Math.max(1, r), 0, Math.PI * 2);
      c.fillStyle = `rgba(70,240,192,${alpha})`;
      c.fill();
    }

    // Rotating inner highlight
    c.save();
    c.translate(cx, cy);
    c.rotate(t * 0.001);
    c.strokeStyle = 'rgba(180,255,235,0.5)';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(0, 0, baseR * 0.6, 0, Math.PI * 1.2);
    c.stroke();
    c.restore();

    // Center label
    c.font = 'bold 11px Space Mono, monospace';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = 'rgba(70,240,192,0.7)';
    c.fillText('PORTAL', cx, cy + baseR + 18);
  }

  function drawObjects(t) {
    const c = ctx();
    for (const obj of objects) {
      // Red warning glow for fakes
      if (!obj.real) {
        const glowAlpha = 0.35 + 0.15 * Math.sin(t * 0.008);
        c.fillStyle = `rgba(255,50,50,${glowAlpha})`;
        c.beginPath();
        c.roundRect(obj.x - 22, obj.y - 22, 44, 44, 8);
        c.fill();
      }

      // Scan glow for real objects
      if (obj.real && scanActive) {
        c.shadowColor = '#46f0c0';
        c.shadowBlur = 18;
      }

      c.font = '28px serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(obj.emoji, obj.x, obj.y);
      c.shadowBlur = 0;

      // Label for bot/spam fakes
      if (obj.label && !obj.real) {
        c.font = 'bold 9px Space Mono, monospace';
        c.fillStyle = '#ff8888';
        c.textAlign = 'center';
        c.textBaseline = 'top';
        c.fillText(obj.label, obj.x, obj.y + 16);
      }
    }
    c.textBaseline = 'alphabetic';
  }

  function drawSlashEffects() {
    const c = ctx();
    for (const s of slashEffects) {
      c.save();
      c.globalAlpha = s.life;
      c.strokeStyle = '#ffffff';
      c.lineWidth = 3 * s.life;
      c.lineCap = 'round';
      c.shadowColor = '#46f0c0';
      c.shadowBlur = 8;
      c.beginPath();
      c.moveTo(s.x1, s.y1);
      c.lineTo(s.x2, s.y2);
      c.stroke();
      c.restore();
    }
  }

  function drawParticles() {
    const c = ctx();
    for (const p of particles) {
      c.globalAlpha = p.life;
      c.fillStyle = p.color;
      c.beginPath();
      c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
  }

  function drawFloatTexts() {
    const c = ctx();
    for (const ft of floatTexts) {
      c.save();
      c.globalAlpha = ft.life;
      c.font = 'bold 14px Space Mono, monospace';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillStyle = ft.color;
      c.shadowColor = ft.color;
      c.shadowBlur = 6;
      c.fillText(ft.text, ft.x, ft.y);
      c.restore();
    }
  }

  function drawRoundOverlay(t) {
    if (!showingRoundOverlay) return;
    const c = ctx();
    const w = W(), h = H();
    c.fillStyle = 'rgba(0,10,6,0.72)';
    c.fillRect(0, 0, w, h);

    const alpha = Math.min(1, roundOverlayTimer / 500);
    c.save();
    c.globalAlpha = alpha;
    c.font = 'bold 52px Space Mono, monospace';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = '#46f0c0';
    c.shadowColor = '#46f0c0';
    c.shadowBlur = 30;
    c.fillText(roundOverlayText, w / 2, h / 2);
    c.restore();
  }

  function drawHUD() {
    // HP shields
    let hpStr = '⚡'.repeat(hp) + '🖤'.repeat(Math.max(0, 5 - hp));
    const cfg = ROUNDS[Math.min(round, ROUNDS.length - 1)];
    const timeLeft = Math.max(0, Math.ceil((cfg.duration * 1000 - roundTime) / 1000));
    hud.setLeft(hpStr);
    hud.setCenter(`Round ${round + 1}/3 &nbsp; ${timeLeft}s`);
    hud.setRight(`Score: ${score}`);
  }

  // ── Main loop ─────────────────────────────────────────────────────────────
  function loop(ts) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(ts - lastTs, 80);
    lastTs = ts;

    if (!gameOver) {
      updatePowers(dt);
      if (showingRoundOverlay) {
        roundOverlayTimer -= dt;
        if (roundOverlayTimer <= 0) { showingRoundOverlay = false; spawnTimer = 0; }
      } else {
        updateObjects(dt);
        updateRoundTimer(dt);
      }

      // Update slash effects
      for (const s of slashEffects) s.life -= 0.05;
      slashEffects = slashEffects.filter(s => s.life > 0);

      // Update particles
      for (const p of particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= p.decay; }
      particles = particles.filter(p => p.life > 0);

      // Update float texts
      for (const ft of floatTexts) { ft.y += ft.vy; ft.life -= 0.018; }
      floatTexts = floatTexts.filter(ft => ft.life > 0);
    }

    // Draw
    drawBackground(ts);
    drawPortal(ts);
    drawObjects(ts);
    drawSlashEffects();
    drawParticles();
    drawFloatTexts();
    if (showingRoundOverlay) drawRoundOverlay(ts);
    drawHUD();
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  showLessonBanner(root, {
    concept: t('m5.concept'),
    detail: t('m5.banner'),
    color: '#46f0c0',
  });

  showIntro(root, {
    emoji: '🥷',
    title: t('m5.title'),
    concept: t('m5.concept'),
    howto: t('m5.howto'),
    color: '#46f0c0',
    onStart: () => {
      requestAnimationFrame((ts) => {
        lastTs = ts;
        showRoundOverlay('ROUND 1');
        raf = requestAnimationFrame(loop);
      });
    },
  });

  function cleanup() {
    if (raf) cancelAnimationFrame(raf);
    canvas.removeEventListener('mousedown', onPointerDown);
    canvas.removeEventListener('touchstart', onPointerDown);
    destroy();
  }
}
