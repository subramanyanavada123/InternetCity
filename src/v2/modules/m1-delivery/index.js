import { makeGameShell, makeHUD, coinBurst, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';

// ── Building definitions ──────────────────────────────────────────────────────
const BUILDING_DEFS = [
  { label: 'Palace',  icon: '🏰', color: '#ffd700', isPalace: true  },
  { label: 'School',  icon: '🏫', color: '#ff6b6b' },
  { label: 'Market',  icon: '🏪', color: '#ff9f43' },
  { label: 'Clinic',  icon: '🏥', color: '#54a0ff' },
  { label: 'Home A',  icon: '🏠', color: '#5f27cd' },
  { label: 'Home B',  icon: '🏠', color: '#00d2d3' },
  { label: 'Home C',  icon: '🏠', color: '#ff6348' },
  { label: 'Park',    icon: '🌳', color: '#1dd1a1' },
  { label: 'Library', icon: '📚', color: '#c8a96e' },
  { label: 'Bakery',  icon: '🍞', color: '#f368e0' },
];

// ── Particles ─────────────────────────────────────────────────────────────────
function makeParticle(x, y, color) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 1.5 + Math.random() * 3;
  return {
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 2,
    life: 1,
    decay: 0.025 + Math.random() * 0.015,
    r: 3 + Math.random() * 4,
    color,
  };
}

function makeConfettiParticle(W, color) {
  return {
    x: Math.random() * W,
    y: -10,
    vx: (Math.random() - 0.5) * 3,
    vy: 2 + Math.random() * 3,
    life: 1,
    decay: 0.006,
    r: 4 + Math.random() * 5,
    color,
    rot: Math.random() * Math.PI * 2,
    rotV: (Math.random() - 0.5) * 0.2,
  };
}

// ── BFS connectivity ──────────────────────────────────────────────────────────
function bfsReachable(buildings, roads) {
  const palIdx = buildings.findIndex(b => b.isPalace);
  const visited = new Set([palIdx]);
  const queue = [palIdx];
  while (queue.length) {
    const cur = queue.shift();
    for (const r of roads) {
      let other = -1;
      if (r.a === cur) other = r.b;
      else if (r.b === cur) other = r.a;
      if (other >= 0 && !visited.has(other)) {
        visited.add(other);
        queue.push(other);
      }
    }
  }
  return visited;
}

// ── Truck animation ───────────────────────────────────────────────────────────
function makeTruck(road, buildings, slow) {
  return {
    road,
    t: 0,
    speed: slow ? 0.003 : 0.007,
    color: slow ? '#ff9f43' : buildings[road.b].color,
    done: false,
  };
}

// ── Main launch ───────────────────────────────────────────────────────────────
export function launch(app, state, onComplete) {
  const shell = makeGameShell(app, { bgColor: '#1a1200' });
  const { root, canvas, ctx, W, H, destroy, canvasXY } = shell;

  const hud = makeHUD(root, { color: '#ffd700' });

  // Back button
  const backBtn = document.createElement('button');
  backBtn.style.cssText = `
    position:absolute;top:8px;left:16px;z-index:70;
    background:rgba(0,0,0,0.5);border:1px solid #ffd70066;border-radius:10px;
    color:#ffd700;font-size:13px;font-weight:700;cursor:pointer;
    padding:6px 12px;font-family:inherit;pointer-events:auto;
  `;
  backBtn.textContent = '← Missions';
  backBtn.addEventListener('click', () => { cleanup(); onComplete(0, 0); });
  root.appendChild(backBtn);

  // State
  let buildings = [];
  let roads = [];
  let trucks = [];
  let particles = [];
  let confetti = [];
  let reachable = new Set();
  let totalCoins = 0;
  let gameWon = false;
  let dragFrom = null;
  let dragPos = null;
  let raf = null;
  let bounceBuildings = new Set();    // indices bouncing on first connect
  let confettiFired = false;

  function buildingRadius() { return Math.min(W(), H()) * 0.045; }

  function initBuildings() {
    const w = W(), h = H();
    const pad = 80;
    const cx = w / 2, cy = h / 2;
    buildings = [];

    // Palace always center
    buildings.push({ ...BUILDING_DEFS[0], x: cx, y: cy, bounce: 0, connected: true });

    // Scatter remaining buildings avoiding overlap
    const others = BUILDING_DEFS.slice(1);
    const minDist = buildingRadius() * 3.2;
    for (let i = 0; i < others.length; i++) {
      let x, y, tries = 0;
      do {
        const angle = (i / others.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
        const dist = w * 0.2 + Math.random() * (Math.min(w, h) * 0.28);
        x = cx + Math.cos(angle) * dist;
        y = cy + Math.sin(angle) * dist;
        x = Math.max(pad, Math.min(w - pad, x));
        y = Math.max(pad + 48, Math.min(h - pad, y));
        tries++;
      } while (tries < 40 && buildings.some(b => Math.hypot(b.x - x, b.y - y) < minDist));
      buildings.push({ ...others[i], x, y, bounce: 0, connected: false });
    }
    reachable = new Set([0]);
  }

  function roadLength(r) {
    const a = buildings[r.a], b = buildings[r.b];
    return Math.hypot(b.x - a.x, b.y - a.y);
  }

  function diagonal() { return Math.hypot(W(), H()); }

  function avgRoadLength() {
    if (!roads.length) return 0;
    return roads.reduce((s, r) => s + roadLength(r), 0) / roads.length;
  }

  function checkWin() {
    const newReachable = bfsReachable(buildings, roads);

    // Find newly reachable
    for (const idx of newReachable) {
      if (!reachable.has(idx) && idx !== 0) {
        // Celebrate this building
        const b = buildings[idx];
        b.connected = true;
        bounceBuildings.add(idx);
        setTimeout(() => bounceBuildings.delete(idx), 600);

        // Find the road that connects this building
        const connectingRoad = roads.find(r =>
          (r.b === idx && newReachable.has(r.a)) ||
          (r.a === idx && newReachable.has(r.b))
        );
        if (connectingRoad) {
          const diag = diagonal();
          const slow = roadLength(connectingRoad) > diag * 0.6;
          trucks.push(makeTruck(connectingRoad, buildings, slow));
        }

        // Coin burst
        totalCoins += 10;
        coinBurst(root, b.x, b.y, 10);
        sfx.coin();

        // Particle burst
        for (let p = 0; p < 18; p++) {
          particles.push(makeParticle(b.x, b.y, b.color));
        }
      }
    }

    reachable = newReachable;

    // Win?
    const allConnected = reachable.size === buildings.length;
    if (allConnected && !gameWon) {
      gameWon = true;
      if (!confettiFired) {
        confettiFired = true;
        const colors = ['#ffd700','#ff6b6b','#54a0ff','#1dd1a1','#f368e0','#ff9f43'];
        for (let i = 0; i < 80; i++) {
          confetti.push(makeConfettiParticle(W(), colors[Math.floor(Math.random() * colors.length)]));
        }
        sfx.win();
      }
      setTimeout(() => showResult(), 1800);
    }
  }

  function showResult() {
    const diag = diagonal();
    const avg = avgRoadLength();
    let stars = 1;
    if (avg < diag * 0.55) stars = 2;
    if (avg < diag * 0.40) stars = 3;
    const bonus = stars * 20;
    totalCoins += bonus;

    const titles = ['', 'Connected!', 'Efficient Routes!', 'Master Planner!'];
    showStarResult(root, {
      stars,
      title: titles[stars],
      lines: [
        `All ${buildings.length} buildings connected`,
        `Average road: ${Math.round((avg / diag) * 100)}% of city size`,
        stars < 3 ? `Shorter roads = more stars!` : `Perfect network! 🏆`,
      ],
      coins: totalCoins,
      color: '#ffd700',
      onContinue: (s) => { cleanup(); onComplete(s, totalCoins); },
    });
  }

  // ── Input handling ────────────────────────────────────────────────────────
  function findBuilding(x, y) {
    const r = buildingRadius() + 10;
    for (let i = 0; i < buildings.length; i++) {
      if (Math.hypot(buildings[i].x - x, buildings[i].y - y) < r) return i;
    }
    return -1;
  }

  function onDown(e) {
    e.preventDefault();
    const { x, y } = canvasXY(e);
    const idx = findBuilding(x, y);
    if (idx >= 0) { dragFrom = idx; dragPos = { x, y }; }
  }

  function onMove(e) {
    e.preventDefault();
    if (dragFrom === null) return;
    dragPos = canvasXY(e);
  }

  function onUp(e) {
    e.preventDefault();
    if (dragFrom === null) return;
    const { x, y } = canvasXY(e);
    const idx = findBuilding(x, y);
    if (idx >= 0 && idx !== dragFrom) {
      // Avoid duplicate roads
      const exists = roads.some(r =>
        (r.a === dragFrom && r.b === idx) || (r.a === idx && r.b === dragFrom)
      );
      if (!exists) {
        roads.push({ a: dragFrom, b: idx });
        sfx.pop();
        checkWin();
      }
    }
    dragFrom = null;
    dragPos = null;
  }

  canvas.addEventListener('mousedown', onDown);
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseup', onUp);
  canvas.addEventListener('touchstart', onDown, { passive: false });
  canvas.addEventListener('touchmove', onMove, { passive: false });
  canvas.addEventListener('touchend', onUp, { passive: false });

  // ── Drawing ───────────────────────────────────────────────────────────────
  function drawBackground() {
    const c = ctx();
    const w = W(), h = H();
    c.fillStyle = '#1a1200';
    c.fillRect(0, 0, w, h);

    // Grass patches
    const patches = [
      { x: w * 0.12, y: h * 0.2, r: 60 },
      { x: w * 0.85, y: h * 0.15, r: 50 },
      { x: w * 0.08, y: h * 0.75, r: 55 },
      { x: w * 0.9,  y: h * 0.8,  r: 65 },
      { x: w * 0.5,  y: h * 0.88, r: 45 },
    ];
    for (const p of patches) {
      const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, '#2a4000');
      g.addColorStop(1, 'transparent');
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
    }
  }

  function drawRoads() {
    const c = ctx();
    for (const r of roads) {
      const a = buildings[r.a], b = buildings[r.b];
      const diag = diagonal();
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const slow = len > diag * 0.6;

      // Road shadow
      c.save();
      c.strokeStyle = 'rgba(0,0,0,0.3)';
      c.lineWidth = 9;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(a.x + 2, a.y + 2);
      c.lineTo(b.x + 2, b.y + 2);
      c.stroke();
      c.restore();

      // Road surface
      c.strokeStyle = slow ? '#c87a2a' : '#c8a96e';
      c.lineWidth = 6;
      c.lineCap = 'round';
      c.setLineDash([]);
      c.beginPath();
      c.moveTo(a.x, a.y);
      c.lineTo(b.x, b.y);
      c.stroke();

      // Dashed center line
      c.strokeStyle = 'rgba(255,255,255,0.2)';
      c.lineWidth = 1.5;
      c.setLineDash([8, 10]);
      c.beginPath();
      c.moveTo(a.x, a.y);
      c.lineTo(b.x, b.y);
      c.stroke();
      c.setLineDash([]);
    }
  }

  function drawBuildings(t) {
    const c = ctx();
    const br = buildingRadius();

    for (let i = 0; i < buildings.length; i++) {
      const b = buildings[i];
      let dy = 0;

      if (!b.connected) {
        // Idle bounce for unconnected
        dy = Math.sin(t * 0.003 + i * 1.2) * 3;
      } else if (bounceBuildings.has(i)) {
        // Celebration bounce
        dy = -Math.abs(Math.sin(t * 0.02)) * 10;
      }

      c.save();
      c.translate(b.x, b.y + dy);

      // Shadow
      c.fillStyle = 'rgba(0,0,0,0.35)';
      c.beginPath();
      c.ellipse(2, br * 0.6, br * 0.7, br * 0.25, 0, 0, Math.PI * 2);
      c.fill();

      // Building body
      const bx = -br, by = -br, bw = br * 2, bh = br * 2;
      c.beginPath();
      c.roundRect(bx, by, bw, bh, 10);
      c.fillStyle = b.color + 'cc';
      c.fill();
      c.strokeStyle = b.color;
      c.lineWidth = b.connected ? 2.5 : 1.5;
      c.stroke();

      // Glow for connected
      if (b.connected && i !== 0) {
        c.shadowColor = b.color;
        c.shadowBlur = 12;
        c.beginPath();
        c.roundRect(bx, by, bw, bh, 10);
        c.stroke();
        c.shadowBlur = 0;
      }

      // Palace crown glow
      if (b.isPalace) {
        c.shadowColor = '#ffd700';
        c.shadowBlur = 20;
        c.beginPath();
        c.roundRect(bx, by, bw, bh, 10);
        c.strokeStyle = '#ffd700';
        c.lineWidth = 3;
        c.stroke();
        c.shadowBlur = 0;
      }

      // Icon
      c.font = `${br * 1.0}px serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(b.icon, 0, 0);

      // Label
      c.font = `bold ${Math.max(9, br * 0.45)}px 'Space Mono',monospace`;
      c.fillStyle = '#fff';
      c.textAlign = 'center';
      c.textBaseline = 'top';
      c.fillText(b.label, 0, br + 4);

      c.restore();
    }
  }

  function drawTrucks() {
    const c = ctx();
    for (const truck of trucks) {
      const a = buildings[truck.road.a];
      const b = buildings[truck.road.b];
      const x = a.x + (b.x - a.x) * truck.t;
      const y = a.y + (b.y - a.y) * truck.t;
      const angle = Math.atan2(b.y - a.y, b.x - a.x);

      c.save();
      c.translate(x, y);
      c.rotate(angle);

      // Shadow
      c.fillStyle = 'rgba(0,0,0,0.3)';
      c.fillRect(-6, 3, 16, 5);

      // Truck body
      c.fillStyle = truck.color;
      c.beginPath();
      c.roundRect(-8, -5, 16, 10, 3);
      c.fill();

      // Cab
      c.fillStyle = '#fff';
      c.fillRect(4, -4, 5, 8);

      // Wheels
      c.fillStyle = '#333';
      c.beginPath(); c.arc(-4, 5, 2.5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(6, 5, 2.5, 0, Math.PI * 2); c.fill();

      // Gift box on slow trucks
      if (truck.color === '#ff9f43') {
        c.fillStyle = '#ff6348';
        c.fillRect(-5, -8, 8, 6);
        c.strokeStyle = '#fff';
        c.lineWidth = 0.8;
        c.beginPath();
        c.moveTo(-1, -8); c.lineTo(-1, -2);
        c.moveTo(-5, -5); c.lineTo(3, -5);
        c.stroke();
      }

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

  function drawConfetti() {
    const c = ctx();
    for (const p of confetti) {
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

  function drawDragLine() {
    if (dragFrom === null || !dragPos) return;
    const c = ctx();
    const a = buildings[dragFrom];
    c.save();
    c.setLineDash([6, 8]);
    c.strokeStyle = 'rgba(255,215,0,0.6)';
    c.lineWidth = 3;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(a.x, a.y);
    c.lineTo(dragPos.x, dragPos.y);
    c.stroke();
    c.restore();
  }

  function updateTrucks() {
    for (const truck of trucks) {
      if (!truck.done) {
        truck.t += truck.speed;
        if (truck.t >= 1) { truck.t = 1; truck.done = true; }
      }
    }
    // Remove trucks that have gone back and forth
    trucks = trucks.filter(t => !t.done || t.t < 1.05);
  }

  function updateParticles() {
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.12;
      p.life -= p.decay;
    }
    particles = particles.filter(p => p.life > 0);

    for (const p of confetti) {
      p.x += p.vx; p.y += p.vy;
      p.rot += p.rotV;
      p.life -= p.decay;
    }
    confetti = confetti.filter(p => p.life > 0);
  }

  function updateHUD() {
    const connected = reachable.size - 1;
    const total = buildings.length - 1;
    hud.setCenter(`🎁 ${connected}/${total} delivered  🪙 ${totalCoins}`);
  }

  // ── Loop ──────────────────────────────────────────────────────────────────
  let lastT = 0;
  function loop(t) {
    raf = requestAnimationFrame(loop);
    const w = W(), h = H();
    const c = ctx();
    c.clearRect(0, 0, w, h);

    drawBackground();
    drawRoads();
    drawDragLine();
    drawBuildings(t);
    drawTrucks();
    drawParticles();
    drawConfetti();
    updateTrucks();
    updateParticles();
    updateHUD();
    lastT = t;
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  showLessonBanner(root, {
    concept: 'Graph Networks & Routing',
    detail: 'Every building is a node. Every road is an edge. This is how the internet connects devices.',
    color: '#ffd700',
  });

  showIntro(root, {
    emoji: '🎁',
    title: 'Delivery Kingdom',
    concept: 'A network connects nodes with edges so data (or trucks!) can travel between them. Shortest paths mean faster delivery.',
    howto: 'Drag from one building to another to build a road. Connect all buildings to the Palace to win!',
    color: '#ffd700',
    onStart: () => {
      requestAnimationFrame(() => {
        initBuildings();
        raf = requestAnimationFrame(loop);
      });
    },
  });

  function cleanup() {
    if (raf) cancelAnimationFrame(raf);
    canvas.removeEventListener('mousedown', onDown);
    canvas.removeEventListener('mousemove', onMove);
    canvas.removeEventListener('mouseup', onUp);
    canvas.removeEventListener('touchstart', onDown);
    canvas.removeEventListener('touchmove', onMove);
    canvas.removeEventListener('touchend', onUp);
    destroy();
  }
}
