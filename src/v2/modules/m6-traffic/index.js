import { makeGameShell, makeHUD, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';
import { t } from '../../shared/i18n.js';

// ── Constants ─────────────────────────────────────────────────────────────────
const GAME_DURATION = 90;
const BUDGET        = 150;
const UPGRADE_COST  = 30;
const SHORTCUT_COST = 60;

const DISTRICT_DEFS = [
  { id: 'airport',   label: 'Airport',   fx: 0.10, fy: 0.50, color: '#54a0ff' },
  { id: 'downtown',  label: 'Downtown',  fx: 0.40, fy: 0.30, color: '#ffd700' },
  { id: 'stadium',   label: 'Stadium',   fx: 0.40, fy: 0.70, color: '#ff6b6b' },
  { id: 'mall',      label: 'Mall',      fx: 0.70, fy: 0.25, color: '#1dd1a1' },
  { id: 'hospital',  label: 'Hospital',  fx: 0.70, fy: 0.65, color: '#ff9f43' },
  { id: 'port',      label: 'Port',      fx: 0.90, fy: 0.50, color: '#a29bfe' },
];

// Road definitions: [fromIdx, toIdx, capacity]
const ROAD_DEFS = [
  [0, 1, 2], // Airport → Downtown
  [0, 2, 2], // Airport → Stadium
  [1, 3, 3], // Downtown → Mall
  [1, 2, 1], // Downtown → Stadium (bottleneck)
  [2, 4, 2], // Stadium → Hospital
  [3, 5, 2], // Mall → Port
  [4, 5, 2], // Hospital → Port
  [1, 4, 1], // Downtown → Hospital (bottleneck)
];

// ── BFS shortest path ─────────────────────────────────────────────────────────
function bfsPath(roads, numNodes, src, dst) {
  if (src === dst) return [src];
  const adj = Array.from({ length: numNodes }, () => []);
  for (const r of roads) {
    adj[r.a].push({ node: r.b, road: r });
    adj[r.b].push({ node: r.a, road: r });
  }
  const prev = new Array(numNodes).fill(-1);
  const seen = new Array(numNodes).fill(false);
  seen[src] = true;
  const queue = [src];
  while (queue.length) {
    const cur = queue.shift();
    if (cur === dst) break;
    for (const { node } of adj[cur]) {
      if (!seen[node]) { seen[node] = true; prev[node] = cur; queue.push(node); }
    }
  }
  if (prev[dst] === -1) return null;
  const path = [];
  let c = dst;
  while (c !== -1) { path.unshift(c); c = prev[c]; }
  return path;
}

// ── Road lookup ───────────────────────────────────────────────────────────────
function findRoad(roads, a, b) {
  return roads.find(r => (r.a === a && r.b === b) || (r.a === b && r.b === a)) || null;
}

// Point-to-segment distance
function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// ── Confetti helpers ──────────────────────────────────────────────────────────
function makeConfetti(x, y) {
  const colors = ['#ffd700', '#ff6b6b', '#54a0ff', '#1dd1a1', '#f368e0', '#ff9f43'];
  const arr = [];
  for (let i = 0; i < 22; i++) {
    const angle = Math.random() * Math.PI * 2;
    const sp = 2 + Math.random() * 4;
    arr.push({
      x, y,
      vx: Math.cos(angle) * sp,
      vy: Math.sin(angle) * sp - 3,
      color: colors[i % colors.length],
      life: 1, decay: 0.022,
      r: 3 + Math.random() * 4,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.25,
    });
  }
  return arr;
}

// ── Float-up emoji ────────────────────────────────────────────────────────────
function makeFloat(root, x, y, text) {
  const el = document.createElement('div');
  el.style.cssText = `
    position:absolute;left:${x}px;top:${y}px;font-size:20px;
    pointer-events:none;z-index:200;
    animation:coinPop 1.1s ease-out forwards;
  `;
  el.textContent = text;
  root.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

// ── Main launch ───────────────────────────────────────────────────────────────
export function launch(app, state, onComplete) {
  const shell = makeGameShell(app, { bgColor: '#05050f' });
  const { root, canvas, ctx, W, H, destroy, canvasXY } = shell;
  const hud = makeHUD(root, { color: '#46f0c0' });

  // Back button
  const backBtn = document.createElement('button');
  backBtn.style.cssText = `
    position:absolute;top:8px;left:16px;z-index:70;
    background:rgba(0,0,0,0.55);border:1px solid #46f0c055;border-radius:10px;
    color:#46f0c0;font-size:13px;font-weight:700;cursor:pointer;
    padding:6px 12px;font-family:inherit;pointer-events:auto;
  `;
  backBtn.textContent = t('btn.back');
  backBtn.addEventListener('click', () => { cleanup(); onComplete(0, 0); });
  root.appendChild(backBtn);

  // ── Game state ────────────────────────────────────────────────────────────
  let districts = [];
  let roads     = [];
  let cars      = [];
  let particles = [];

  let happiness   = 50;   // starts at 50 — player must actively manage to push it up
  let coins       = BUDGET;
  let elapsed     = 0;
  let lastSpawn   = 0;
  let spawnPeriod = 2.5; // seconds between spawns
  let carsSpawned = 0;
  let phaseLabel  = '';
  let phaseFade   = 0;
  let loadTimer   = 0;

  let selectedRoad   = null;
  let shortcutFrom   = null;   // district index for two-click shortcut
  let upgradeAnim    = null;   // { road, t } — t 0→1

  let gameOver = false;
  let raf = null;

  // ── Upgrade panel (DOM) ───────────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.style.cssText = `
    position:absolute;bottom:16px;right:16px;z-index:70;
    background:rgba(5,5,20,0.92);border:1px solid #46f0c055;border-radius:14px;
    padding:12px 16px;min-width:180px;font-family:inherit;
    color:#fff;font-size:13px;pointer-events:auto;
    display:none;
  `;
  root.appendChild(panel);

  // Shortcut hint
  const hintEl = document.createElement('div');
  hintEl.style.cssText = `
    position:absolute;bottom:16px;left:50%;transform:translateX(-50%);
    z-index:70;background:rgba(5,5,20,0.85);border:1px solid #ffd70055;
    border-radius:10px;padding:8px 14px;color:#ffd700;font-size:12px;
    font-family:inherit;font-weight:700;pointer-events:none;display:none;
  `;
  root.appendChild(hintEl);

  // ── Initialise districts & roads ──────────────────────────────────────────
  function initGame() {
    const w = W(), h = H();
    districts = DISTRICT_DEFS.map(d => ({
      ...d,
      x: d.fx * w,
      y: d.fy * h,
    }));

    roads = ROAD_DEFS.map(([a, b, capacity]) => ({
      a, b, capacity,
      load: 0,
      upgraded: false,
    }));
  }

  // ── Car spawning ──────────────────────────────────────────────────────────
  function spawnCar() {
    const n = districts.length;
    let src = Math.floor(Math.random() * n);
    let dst = Math.floor(Math.random() * n);
    if (src === dst) dst = (dst + 1) % n;

    const path = bfsPath(roads, n, src, dst);
    if (!path || path.length < 2) return;

    const startD = districts[path[0]];
    const car = {
      x: startD.x,
      y: startD.y,
      path,
      pathIdx: 0,
      t: 0,
      speed: 0.4 + Math.random() * 0.2, // fraction per second
      color: districts[dst].color,
    };
    cars.push(car);
  }

  // ── Load update (every 0.5s) ──────────────────────────────────────────────
  function updateLoads() {
    for (const r of roads) r.load = 0;
    for (const car of cars) {
      const seg = car.path[car.pathIdx];
      const segNext = car.path[car.pathIdx + 1];
      if (segNext === undefined) continue;
      const r = findRoad(roads, seg, segNext);
      if (r) r.load += 1;
    }
  }

  // Happiness: 0-100, updated each tick based on congestion
  function calcHappiness() {
    return happiness;
  }

  // ── Road selection ────────────────────────────────────────────────────────
  function selectRoad(r) {
    selectedRoad = r;
    shortcutFrom = null;
    hintEl.style.display = 'none';
    showPanel(r);
  }

  function clearSelection() {
    selectedRoad = null;
    panel.style.display = 'none';
  }

  function showPanel(r) {
    const ratio = r.load / r.capacity;
    const statusColor = ratio > 0.8 ? '#ff4757' : ratio > 0.5 ? '#ffd700' : '#2ed573';
    const statusText  = ratio > 0.8 ? 'CONGESTED' : ratio > 0.5 ? 'BUSY' : 'FLOWING';
    const canAfford = coins >= UPGRADE_COST;

    panel.innerHTML = `
      <div style="color:#46f0c0;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;font-weight:700;">
        Selected Road
      </div>
      <div style="margin-bottom:6px;">
        ${districts[r.a].label} ↔ ${districts[r.b].label}
      </div>
      <div style="color:${statusColor};font-weight:700;margin-bottom:4px;">${statusText}</div>
      <div style="color:#8aa6b4;font-size:11px;margin-bottom:10px;">
        Load: ${r.load}/${r.capacity} · Cap: ${r.capacity}
      </div>
      <button id="upgradeBtn" style="
        width:100%;padding:8px;border-radius:8px;border:none;
        background:${canAfford ? '#46f0c0' : '#333'};
        color:${canAfford ? '#000' : '#666'};
        font-size:12px;font-weight:700;cursor:${canAfford ? 'pointer' : 'not-allowed'};
        font-family:inherit;margin-bottom:6px;
      ">Upgrade Road (+1 cap) — ${UPGRADE_COST}🪙</button>
      <button id="shortcutBtn" style="
        width:100%;padding:8px;border-radius:8px;border:none;
        background:rgba(255,215,0,0.15);border:1px solid #ffd70044;
        color:#ffd700;font-size:12px;font-weight:700;cursor:pointer;
        font-family:inherit;
      ">Add Shortcut — ${SHORTCUT_COST}🪙</button>
      <button id="closeBtn" style="
        width:100%;padding:6px;border-radius:8px;border:1px solid #46f0c033;
        background:transparent;color:#46f0c0;font-size:11px;cursor:pointer;
        font-family:inherit;margin-top:6px;
      ">✕ Close</button>
    `;
    panel.style.display = 'block';

    document.getElementById('upgradeBtn').addEventListener('click', () => {
      if (coins < UPGRADE_COST) { sfx.block(); return; }
      const wasRed = r.load / r.capacity > 0.8;
      r.capacity += 1;
      r.upgraded = true;
      coins -= UPGRADE_COST;
      upgradeAnim = { road: r, t: 0 };
      sfx.coin();
      if (wasRed && r.load / r.capacity <= 0.8) {
        // Turned green → celebrate
        particles.push(...makeConfetti(
          (districts[r.a].x + districts[r.b].x) / 2,
          (districts[r.a].y + districts[r.b].y) / 2,
        ));
        const mx = (districts[r.a].x + districts[r.b].x) / 2;
        const my = (districts[r.a].y + districts[r.b].y) / 2;
        makeFloat(root, mx, my, '🎉');
        sfx.win();
      }
      showPanel(r); // refresh panel
    });

    document.getElementById('shortcutBtn').addEventListener('click', () => {
      panel.style.display = 'none';
      selectedRoad = null;
      shortcutFrom = null;
      hintEl.textContent = 'Click a district to start shortcut (ESC to cancel)';
      hintEl.style.display = 'block';
    });

    document.getElementById('closeBtn').addEventListener('click', clearSelection);
  }

  // ── Click handler ─────────────────────────────────────────────────────────
  function getCanvasPos(e) { return canvasXY(e); }

  function findDistrictAt(x, y) {
    for (let i = 0; i < districts.length; i++) {
      const d = districts[i];
      if (Math.hypot(d.x - x, d.y - y) < 28) return i;
    }
    return -1;
  }

  function findRoadAt(x, y) {
    for (const r of roads) {
      const a = districts[r.a], b = districts[r.b];
      if (distToSegment(x, y, a.x, a.y, b.x, b.y) < 15) return r;
    }
    return null;
  }

  function onClick(e) {
    if (gameOver) return;
    const { x, y } = getCanvasPos(e);

    // Two-click shortcut mode
    if (hintEl.style.display === 'block') {
      const di = findDistrictAt(x, y);
      if (di >= 0) {
        if (shortcutFrom === null) {
          shortcutFrom = di;
          hintEl.textContent = `Now click destination district (from: ${districts[di].label})`;
          sfx.click();
        } else {
          if (di !== shortcutFrom) {
            const exists = findRoad(roads, shortcutFrom, di);
            if (exists) {
              hintEl.textContent = 'Road already exists! Pick another.';
              setTimeout(() => { hintEl.style.display = 'none'; shortcutFrom = null; }, 1500);
              sfx.block();
            } else if (coins < SHORTCUT_COST) {
              hintEl.textContent = 'Not enough coins!';
              setTimeout(() => { hintEl.style.display = 'none'; shortcutFrom = null; }, 1500);
              sfx.block();
            } else {
              roads.push({ a: shortcutFrom, b: di, capacity: 2, load: 0, upgraded: true });
              coins -= SHORTCUT_COST;
              sfx.coin();
              makeFloat(root, (districts[shortcutFrom].x + districts[di].x) / 2,
                              (districts[shortcutFrom].y + districts[di].y) / 2, '🛣️');
              hintEl.style.display = 'none';
              shortcutFrom = null;
            }
          } else {
            shortcutFrom = null;
            hintEl.textContent = 'Click a district to start shortcut (ESC to cancel)';
          }
        }
      }
      return;
    }

    // Normal: try to select a road
    const r = findRoadAt(x, y);
    if (r) { selectRoad(r); sfx.click(); return; }

    // Click elsewhere → deselect
    clearSelection();
  }

  canvas.addEventListener('click', onClick);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') { shortcutFrom = null; hintEl.style.display = 'none'; clearSelection(); } });

  // ── Phase events ──────────────────────────────────────────────────────────
  let phase1Done = false, phase2Done = false;

  function checkPhases() {
    if (!phase1Done && elapsed >= 15) {
      phase1Done = true;
      spawnPeriod = 1.25;
      phaseLabel = '🚗 RUSH HOUR!';
      phaseFade = 3;
      sfx.launch();
    }
    if (!phase2Done && elapsed >= 35) {
      phase2Done = true;
      spawnPeriod = 0.8;
      phaseLabel = '🎉 FESTIVAL DAY!';
      phaseFade = 3;
      sfx.boom();
    }
  }

  // ── Drawing helpers ───────────────────────────────────────────────────────
  function roadColor(r) {
    const ratio = r.load / r.capacity;
    if (ratio > 0.8) return '#ff4757';
    if (ratio > 0.5) return '#ffd700';
    return '#2ed573';
  }

  function roadBaseWidth(r) {
    return 3 + r.capacity * 2.5;
  }

  function drawBackground() {
    const c = ctx();
    const w = W(), h = H();
    // Night city base
    const tint = happiness < 0.5 ? `rgba(80,0,0,${(0.5 - happiness) * 0.35})` : null;
    c.fillStyle = '#05050f';
    c.fillRect(0, 0, w, h);
    if (tint) {
      c.fillStyle = tint;
      c.fillRect(0, 0, w, h);
    }
    // Subtle grid
    c.strokeStyle = 'rgba(70,240,192,0.04)';
    c.lineWidth = 1;
    const step = 60;
    c.beginPath();
    for (let x = 0; x < w; x += step) { c.moveTo(x, 0); c.lineTo(x, h); }
    for (let y = 0; y < h; y += step) { c.moveTo(0, y); c.lineTo(w, y); }
    c.stroke();
  }

  function drawRoads(now) {
    const c = ctx();
    for (const r of roads) {
      const a = districts[r.a], b = districts[r.b];
      const col = roadColor(r);
      const ratio = r.load / r.capacity;
      const isRed = ratio > 0.8;
      const isSelected = r === selectedRoad;
      let lw = roadBaseWidth(r);

      // Pulse red roads
      if (isRed) lw += Math.sin(now * 0.008) * 2;

      // Upgrade animation: width spike
      if (upgradeAnim && upgradeAnim.road === r) {
        lw *= 1 + 0.5 * Math.sin(upgradeAnim.t * Math.PI);
      }

      // Glow shadow
      c.save();
      c.shadowColor = isSelected ? '#ffd700' : col;
      c.shadowBlur  = isSelected ? 18 : 10;
      c.strokeStyle = isSelected ? '#ffd700' : col;
      c.lineWidth   = lw;
      c.lineCap = 'round';
      c.globalAlpha = 0.45;
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
      c.globalAlpha = 1;

      // Core line
      c.lineWidth = Math.max(2, lw * 0.55);
      c.strokeStyle = isSelected ? '#ffd700' : col;
      c.shadowBlur = 0;
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
      c.restore();

      // Dashed centre
      c.save();
      c.setLineDash([6, 8]);
      c.strokeStyle = 'rgba(255,255,255,0.18)';
      c.lineWidth = 1.2;
      c.lineCap = 'round';
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
      c.setLineDash([]);
      c.restore();
    }
  }

  function drawDistricts(now) {
    const c = ctx();
    for (let i = 0; i < districts.length; i++) {
      const d = districts[i];
      const isFrom = shortcutFrom === i;
      const pulse = 0.85 + 0.15 * Math.sin(now * 0.003 + i * 1.1);
      const r = 22;

      c.save();
      c.translate(d.x, d.y);

      // Outer glow
      c.shadowColor = d.color;
      c.shadowBlur  = isFrom ? 30 : 14;
      c.strokeStyle = d.color;
      c.lineWidth   = isFrom ? 3.5 : 2;
      c.fillStyle   = '#05050f';
      c.beginPath();
      c.roundRect(-r, -r, r * 2, r * 2, 7);
      c.fill();
      c.stroke();

      // Inner tint
      c.fillStyle = d.color + '22';
      c.beginPath();
      c.roundRect(-r, -r, r * 2, r * 2, 7);
      c.fill();
      c.shadowBlur = 0;

      // Tiny window lights (3×2 grid)
      const winColors = ['#fffde0', '#ffd27f', '#c8f5ff'];
      for (let wy = -10; wy <= 4; wy += 7) {
        for (let wx = -8; wx <= 6; wx += 7) {
          c.fillStyle = winColors[Math.floor(Math.random() * winColors.length < 0.2 ? 0 : 2)];
          // Use deterministic "flicker" based on position + time
          const on = ((Math.sin(now * 0.001 + wx * 7 + wy * 13 + i * 31)) > -0.6) ? 1 : 0.1;
          c.globalAlpha = on * pulse;
          c.fillRect(wx, wy, 4, 3);
        }
      }
      c.globalAlpha = 1;

      // Label
      c.font = 'bold 9px "Space Mono",monospace';
      c.fillStyle = d.color;
      c.textAlign = 'center';
      c.textBaseline = 'top';
      c.fillText(d.label.toUpperCase(), 0, r + 3);

      c.restore();
    }
  }

  function drawCars() {
    const c = ctx();
    for (const car of cars) {
      const aIdx = car.path[car.pathIdx];
      const bIdx = car.path[car.pathIdx + 1];
      if (bIdx === undefined) continue;
      const a = districts[aIdx], b = districts[bIdx];
      const x = a.x + (b.x - a.x) * car.t;
      const y = a.y + (b.y - a.y) * car.t;
      const angle = Math.atan2(b.y - a.y, b.x - a.x);

      c.save();
      c.translate(x, y);
      c.rotate(angle);
      c.fillStyle = car.color;
      c.beginPath();
      c.roundRect(-5, -2, 10, 4, 1.5);
      c.fill();
      // Windshield glint
      c.fillStyle = 'rgba(255,255,255,0.7)';
      c.fillRect(2, -1.5, 2.5, 3);
      c.restore();
    }
  }

  function drawParticles() {
    const c = ctx();
    for (const p of particles) {
      c.save();
      c.globalAlpha = p.life;
      c.fillStyle = p.color;
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      c.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      c.restore();
    }
    c.globalAlpha = 1;
  }

  function drawPhaseLabel() {
    if (phaseFade <= 0) return;
    const c = ctx();
    const w = W(), h = H();
    c.save();
    c.globalAlpha = Math.min(1, phaseFade);
    c.font = 'bold 32px "Space Mono",monospace';
    c.fillStyle = '#fff';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.shadowColor = '#ffd700';
    c.shadowBlur  = 20;
    c.fillText(phaseLabel, w / 2, h / 2 - 30);
    c.restore();
  }

  function drawShortcutPreview() {
    if (shortcutFrom === null) return;
    // Draw highlight on selected district
    const d = districts[shortcutFrom];
    const c = ctx();
    c.save();
    c.strokeStyle = '#ffd700';
    c.lineWidth = 3;
    c.shadowColor = '#ffd700';
    c.shadowBlur = 16;
    c.beginPath();
    c.roundRect(d.x - 25, d.y - 25, 50, 50, 9);
    c.stroke();
    c.restore();
  }

  // ── HUD update ─────────────────────────────────────────────────────────────
  function updateHUD() {
    const pct = Math.round(happiness);
    const col = pct > 60 ? '#2ed573' : pct > 30 ? '#ffd700' : '#ff4757';
    const timeLeft = Math.max(0, Math.ceil(GAME_DURATION - elapsed));
    hud.setLeft(`😊 ${pct}%`);
    hud.setCenter(`⏱ ${timeLeft}s`);
    hud.setRight(`🪙 ${coins}`);
    hud.leftEl.style.color = col;
  }

  // ── Main loop ─────────────────────────────────────────────────────────────
  let lastTs = null;

  function loop(ts) {
    if (gameOver) return;
    raf = requestAnimationFrame(loop);

    if (lastTs === null) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.1); // cap at 100ms
    lastTs = ts;

    elapsed += dt;
    checkPhases();

    // Spawn cars
    lastSpawn += dt;
    if (lastSpawn >= spawnPeriod) {
      lastSpawn = 0;
      spawnCar();
      carsSpawned++;
    }

    // Move cars
    for (const car of cars) {
      if (car.pathIdx >= car.path.length - 1) continue;
      car.t += car.speed * dt;
      if (car.t >= 1) {
        car.t -= 1;
        car.pathIdx += 1;
      }
    }
    // Remove cars that finished
    cars = cars.filter(car => car.pathIdx < car.path.length - 1);

    // Load update every 0.5s — happiness degrades with congestion, recovers slowly
    loadTimer += dt;
    if (loadTimer >= 0.5) {
      loadTimer = 0;
      updateLoads();
      if (carsSpawned >= 3) {
        let congestedCount = roads.filter(r => r.load > r.capacity).length;
        let flowingCount   = roads.filter(r => r.load > 0 && r.load <= r.capacity).length;
        happiness = Math.max(0, Math.min(100,
          happiness - congestedCount * 4 + flowingCount * 1
        ));
      }
    }

    // Upgrade anim
    if (upgradeAnim) {
      upgradeAnim.t += dt * 2.5;
      if (upgradeAnim.t >= 1) upgradeAnim = null;
    }

    // Phase label fade
    if (phaseFade > 0) phaseFade -= dt * 0.7;

    // Particles
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.15;
      p.rot += p.rotV;
      p.life -= p.decay;
    }
    particles = particles.filter(p => p.life > 0);

    // Draw
    const c = ctx();
    const w = W(), h = H();
    c.clearRect(0, 0, w, h);

    drawBackground();
    drawRoads(ts);
    drawShortcutPreview();
    drawDistricts(ts);
    drawCars();
    drawParticles();
    drawPhaseLabel();

    updateHUD();

    // End condition
    if (elapsed >= GAME_DURATION) {
      gameOver = true;
      endGame();
    }
  }

  function endGame() {
    updateLoads();
    const finalHappiness = happiness; // already 0-100
    let stars = 0;
    if (finalHappiness > 25) stars = 1;
    if (finalHappiness > 45) stars = 2;
    if (finalHappiness > 65) stars = 3;

    const coinsEarned = stars * 40 + (coins - BUDGET < 0 ? 0 : coins - BUDGET);
    const titles = ['City in Chaos!', 'City Survived!', 'City Flowing!', 'Traffic Master! 🏆'];

    sfx[stars >= 2 ? 'win' : 'fail']();

    setTimeout(() => {
      showStarResult(root, {
        stars,
        title: titles[stars],
        lines: [
          `Final happiness: ${Math.round(finalHappiness)}%`,
          `Coins remaining: ${coins}🪙`,
          stars < 3 ? 'Upgrade bottleneck roads earlier!' : 'Perfect traffic management!',
        ],
        coins: coinsEarned,
        color: '#46f0c0',
        onContinue: (action,s) => { cleanup(); if(action!=='retry') onComplete(s,coinsEarned); else launch(app,state,onComplete); },
      });
    }, 600);
  }

  // ── Init & start ──────────────────────────────────────────────────────────
  showLessonBanner(root, {
    concept: t('m6.concept'),
    detail: t('m6.banner'),
    color: '#ff3860',
  });

  showIntro(root, {
    emoji: '🚗',
    title: t('m6.title'),
    concept: t('m6.concept'),
    howto: t('m6.howto'),
    color: '#ff3860',
    onStart: () => {
      requestAnimationFrame(() => {
        initGame();
        raf = requestAnimationFrame(loop);
      });
    },
  });

  function cleanup() {
    if (raf) cancelAnimationFrame(raf);
    canvas.removeEventListener('click', onClick);
    destroy();
  }
}
