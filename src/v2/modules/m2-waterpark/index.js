import { makeGameShell, makeHUD, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';

// ─── Layout helpers ──────────────────────────────────────────────────────────
const NODE_DEFS = [
  { id: 'src',  fx: 0.08, fy: 0.50, label: '🏊', gate: false },
  { id: 'jA',   fx: 0.35, fy: 0.28, label: '🔵', gate: true  },
  { id: 'jB',   fx: 0.65, fy: 0.28, label: '🔵', gate: true  },
  { id: 'jC',   fx: 0.35, fy: 0.72, label: '🔵', gate: true  },
  { id: 'jD',   fx: 0.65, fy: 0.72, label: '🔵', gate: true  },
  { id: 'snk',  fx: 0.92, fy: 0.50, label: '🌊', gate: false },
];

const PIPE_DEFS = [
  { from: 'src', to: 'jA',  cap: 2 },
  { from: 'src', to: 'jC',  cap: 2 },
  { from: 'jA',  to: 'jB',  cap: 1 },
  { from: 'jC',  to: 'jD',  cap: 1 },
  { from: 'jA',  to: 'jD',  cap: 1 },
  { from: 'jB',  to: 'snk', cap: 2 },
  { from: 'jD',  to: 'snk', cap: 2 },
];

const TOTAL_TIME  = 60;
const SURGE_START = 15;
const SURGE_DUR   = 20;
const BASE_SPAWN  = 0.4;   // seconds
const BLOB_SPEED  = 0.28;  // fraction-of-pipe per second (normal)
const BLOB_SLOW   = 0.30;  // fraction of normal when congested
const GOAL_1      = 30;
const GOAL_2      = 60;
const UPGRADE_COST = 20;
const INIT_BUDGET  = 100;
const COINS_WIN    = [0, 30, 50, 80];

export function launch(app, state, onComplete) {
  // ── Shell ──────────────────────────────────────────────────────────────────
  const shell = makeGameShell(app, { bgColor: '#001a2e' });
  const { root, canvas, ctx: getCtx, W, H, destroy } = shell;
  const hud = makeHUD(root, { color: '#44ccff' });

  // ── Game state ─────────────────────────────────────────────────────────────
  let nodes = NODE_DEFS.map(n => ({ ...n, open: true }));
  let pipes = PIPE_DEFS.map((p, i) => ({ ...p, index: i, load: 0, cap: p.cap, upgFlash: 0 }));
  let blobs = [];
  let particles = [];
  let floaters = [];
  let delivered = 0;
  let budget = INIT_BUDGET;
  let spawnTimer = 0;
  let gameTime = 0;
  let surgeActive = false;
  let ended = false;
  let lastNow = null;

  // Build adjacency once; recalc routes when gates toggle
  function nodeById(id) { return nodes.find(n => n.id === id); }

  // BFS from src to snk respecting open gates — returns array of pipe indices or null
  function findRoute() {
    const adj = {};
    nodes.forEach(n => { adj[n.id] = []; });
    pipes.forEach((p, i) => {
      const fromN = nodeById(p.from);
      const toN   = nodeById(p.to);
      if (fromN && toN && (fromN.id === 'src' || fromN.open) && (toN.id === 'snk' || toN.open)) {
        adj[p.from].push({ to: p.to, pipe: i });
      }
    });
    // BFS
    const visited = new Set(['src']);
    const queue = [{ node: 'src', path: [] }];
    while (queue.length) {
      const { node, path } = queue.shift();
      if (node === 'snk') return path;
      for (const edge of adj[node]) {
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          queue.push({ node: edge.to, path: [...path, edge.pipe] });
        }
      }
    }
    return null;
  }

  let currentRoute = findRoute();

  // ── Spawn ──────────────────────────────────────────────────────────────────
  function spawnBlob() {
    if (!currentRoute || currentRoute.length === 0) return;
    blobs.push({
      pipeIndex: currentRoute[0],
      routePos: 0,          // index into currentRoute
      route: [...currentRoute],
      t: 0,
      wobble: 0,
      stuck: false,
    });
  }

  // ── Particles ──────────────────────────────────────────────────────────────
  function addSparkle(x, y) {
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 50;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1, maxLife: 0.5 + Math.random() * 0.3,
        r: 2 + Math.random() * 3,
        color: `hsl(${180 + Math.random() * 60},100%,${70 + Math.random() * 30}%)`,
      });
    }
  }

  function addFloater(x, y, emoji) {
    floaters.push({ x, y, vy: -60, life: 1, emoji });
  }

  // ── World coords ───────────────────────────────────────────────────────────
  function nodePos(id) {
    const n = nodeById(id);
    return { x: n.fx * W(), y: n.fy * H() };
  }

  function pipeMidpoint(pipe) {
    const a = nodePos(pipe.from);
    const b = nodePos(pipe.to);
    return { x: (a.x + b.x) * 0.5, y: (a.y + b.y) * 0.5 };
  }

  function blobWorldPos(blob) {
    const pipe = pipes[blob.pipeIndex];
    const a = nodePos(pipe.from);
    const b = nodePos(pipe.to);
    return {
      x: a.x + (b.x - a.x) * blob.t,
      y: a.y + (b.y - a.y) * blob.t,
    };
  }

  // ── Click handling ─────────────────────────────────────────────────────────
  function onCanvasClick(e) {
    if (ended) return;
    const { x: cx, y: cy } = canvasXY(e);

    // Check gate nodes (excluding src and snk)
    for (const n of nodes) {
      if (!n.gate) continue;
      const np = nodePos(n.id);
      const dx = cx - np.x, dy = cy - np.y;
      if (dx * dx + dy * dy < 30 * 30) {
        n.open = !n.open;
        currentRoute = findRoute();
        // Reroute any blob that's in a now-closed pipe
        blobs.forEach(b => rerouteBlob(b));
        sfx.click();
        return;
      }
    }

    // Check pipe click for upgrade
    for (const pipe of pipes) {
      const a = nodePos(pipe.from);
      const b = nodePos(pipe.to);
      // Distance from click to segment
      const dx = b.x - a.x, dy = b.y - a.y;
      const len2 = dx * dx + dy * dy;
      const t = Math.max(0, Math.min(1, ((cx - a.x) * dx + (cy - a.y) * dy) / len2));
      const px = a.x + t * dx - cx;
      const py = a.y + t * dy - cy;
      if (px * px + py * py < 18 * 18) {
        if (pipe.cap < 3 && budget >= UPGRADE_COST) {
          pipe.cap += 1;
          budget -= UPGRADE_COST;
          pipe.upgFlash = 0.5;
          const mid = pipeMidpoint(pipe);
          addSparkle(mid.x, mid.y);
          addSparkle(mid.x, mid.y);
          sfx.coin();
        } else if (pipe.cap >= 3) {
          addFloater(cx, cy - 20, '🔒');
        } else {
          addFloater(cx, cy - 20, '😤');
          sfx.block();
        }
        return;
      }
    }
  }

  canvas.addEventListener('click', onCanvasClick);

  function rerouteBlob(blob) {
    const newRoute = findRoute();
    if (!newRoute) return;
    // If the blob is on a pipe that's still accessible, keep it; otherwise reroute from current node
    const pipe = pipes[blob.pipeIndex];
    const nodeId = blob.t < 0.5 ? pipe.from : pipe.to;
    // BFS from that node
    const partial = bfsFrom(nodeId);
    if (partial) {
      blob.route = partial;
      blob.routePos = 0;
      blob.pipeIndex = partial[0];
      blob.t = 0;
    }
  }

  function bfsFrom(startId) {
    const adj = {};
    nodes.forEach(n => { adj[n.id] = []; });
    pipes.forEach((p, i) => {
      const fromN = nodeById(p.from);
      const toN   = nodeById(p.to);
      if (fromN && toN && (fromN.id === 'src' || fromN.open) && (toN.id === 'snk' || toN.open)) {
        adj[p.from].push({ to: p.to, pipe: i });
      }
    });
    const visited = new Set([startId]);
    const queue = [{ node: startId, path: [] }];
    while (queue.length) {
      const { node, path } = queue.shift();
      if (node === 'snk') return path.length ? path : null;
      for (const edge of adj[node]) {
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          queue.push({ node: edge.to, path: [...path, edge.pipe] });
        }
      }
    }
    return null;
  }

  // ── Update ─────────────────────────────────────────────────────────────────
  function update(dt) {
    gameTime += dt;
    surgeActive = gameTime >= SURGE_START && gameTime <= SURGE_START + SURGE_DUR;
    const spawnInterval = surgeActive ? BASE_SPAWN * 0.5 : BASE_SPAWN;

    // Spawn blobs
    spawnTimer += dt;
    while (spawnTimer >= spawnInterval) {
      spawnTimer -= spawnInterval;
      spawnBlob();
    }

    // Count load per pipe
    pipes.forEach(p => { p.load = 0; });
    blobs.forEach(b => { pipes[b.pipeIndex].load++; });

    // Update blobs
    blobs = blobs.filter(blob => {
      const pipe = pipes[blob.pipeIndex];
      const congested = pipe.load > pipe.cap;
      blob.stuck = congested;
      const speed = congested ? BLOB_SPEED * BLOB_SLOW : BLOB_SPEED;
      blob.wobble = congested ? blob.wobble + dt * 8 : 0;

      // Compute pipe length in world coords for speed normalisation
      const a = nodePos(pipe.from);
      const b = nodePos(pipe.to);
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      // speed is in "pipe-lengths per second" normalised to 200px baseline
      const normSpeed = speed * (200 / Math.max(len, 1));
      blob.t += normSpeed * dt;

      if (blob.t >= 1) {
        // Advance to next pipe in route
        blob.routePos++;
        if (blob.routePos >= blob.route.length) {
          // Reached sink
          delivered++;
          const snkPos = nodePos('snk');
          addSparkle(snkPos.x, snkPos.y);
          if (delivered % 5 === 0) addFloater(snkPos.x, snkPos.y - 20, '💧✨');
          sfx.pop();
          return false; // remove blob
        }
        blob.pipeIndex = blob.route[blob.routePos];
        blob.t = 0;
      }
      return true;
    });

    // Upgrade flash timers
    pipes.forEach(p => { if (p.upgFlash > 0) p.upgFlash = Math.max(0, p.upgFlash - dt); });

    // Particles
    particles = particles.filter(p => {
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 60 * dt; // gravity
      p.life -= dt / p.maxLife;
      return p.life > 0;
    });

    // Floaters
    floaters = floaters.filter(f => {
      f.y += f.vy * dt;
      f.life -= dt * 1.5;
      return f.life > 0;
    });

    // Sparkle on smooth pipes
    pipes.forEach(pipe => {
      if (pipe.load <= pipe.cap && pipe.load > 0 && Math.random() < dt * 3) {
        const mid = pipeMidpoint(pipe);
        const t2 = Math.random();
        const a = nodePos(pipe.from), b = nodePos(pipe.to);
        addSparkle(a.x + (b.x - a.x) * t2, a.y + (b.y - a.y) * t2);
      }
    });

    // Congestion feedback
    pipes.forEach(pipe => {
      if (pipe.load > pipe.cap && Math.random() < dt * 1.5) {
        const mid = pipeMidpoint(pipe);
        addFloater(mid.x + (Math.random() - 0.5) * 40, mid.y - 10, '😤');
      }
    });

    // Timer
    if (gameTime >= TOTAL_TIME && !ended) endGame();
  }

  // ── Draw ───────────────────────────────────────────────────────────────────
  function draw() {
    const ctx = getCtx();
    const w = W(), h = H();

    // Background
    ctx.fillStyle = '#001a2e';
    ctx.fillRect(0, 0, w, h);

    // Pool wave lines
    ctx.strokeStyle = '#002a45';
    ctx.lineWidth = 1;
    for (let y = 80; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 60) {
        ctx.quadraticCurveTo(x + 15, y - 6, x + 30, y);
        ctx.quadraticCurveTo(x + 45, y + 6, x + 60, y);
      }
      ctx.stroke();
    }

    // Draw pipes
    pipes.forEach(pipe => {
      const a = nodePos(pipe.from);
      const b = nodePos(pipe.to);
      const congested = pipe.load > pipe.cap;
      const baseWidth = 8 + (pipe.cap - 1) * 6; // 8, 14, 20 for cap 1,2,3

      // Shadow
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = baseWidth + 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      // Main pipe body
      if (pipe.upgFlash > 0) {
        const f = pipe.upgFlash * 2;
        ctx.strokeStyle = `rgba(255,255,255,${f})`;
      } else if (congested) {
        const pulse = 0.7 + 0.3 * Math.sin(gameTime * 10);
        ctx.strokeStyle = `rgba(255,${Math.floor(60 * pulse)},${Math.floor(30 * pulse)},1)`;
      } else {
        ctx.strokeStyle = '#00aaff';
      }
      ctx.lineWidth = baseWidth;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      // Inner highlight
      ctx.strokeStyle = congested ? 'rgba(255,180,180,0.4)' : 'rgba(68,204,255,0.5)';
      ctx.lineWidth = Math.max(2, baseWidth * 0.35);
      ctx.beginPath();
      // offset toward top-left for highlight
      const nx = -(b.y - a.y) / Math.hypot(b.x - a.x, b.y - a.y) * (baseWidth * 0.2);
      const ny =  (b.x - a.x) / Math.hypot(b.x - a.x, b.y - a.y) * (baseWidth * 0.2);
      ctx.moveTo(a.x + nx, a.y + ny);
      ctx.lineTo(b.x + nx, b.y + ny);
      ctx.stroke();

      // Capacity label
      const mid = pipeMidpoint(pipe);
      ctx.fillStyle = 'rgba(0,170,255,0.9)';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const capStr = pipe.cap === 1 ? '●' : pipe.cap === 2 ? '●●' : '●●●';
      ctx.fillText(capStr, mid.x, mid.y - baseWidth * 0.7 - 4);
    });

    // Draw blobs
    blobs.forEach(blob => {
      const pos = blobWorldPos(blob);
      const congested = pipes[blob.pipeIndex].load > pipes[blob.pipeIndex].cap;
      const wobX = blob.stuck ? Math.sin(blob.wobble) * 5 : 0;

      // Speed trail (smooth only)
      if (!congested) {
        const pipe = pipes[blob.pipeIndex];
        const a = nodePos(pipe.from), b = nodePos(pipe.to);
        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.hypot(dx, dy);
        const tx = dx / len, ty = dy / len;
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath();
          ctx.arc(pos.x + wobX - tx * i * 5, pos.y - ty * i * 5, 8 - i * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,170,255,${0.12 - i * 0.03})`;
          ctx.fill();
        }
      }

      // Blob body
      const grad = ctx.createRadialGradient(pos.x + wobX - 2, pos.y - 2, 1, pos.x + wobX, pos.y, 8);
      if (congested) {
        grad.addColorStop(0, 'rgba(255,200,100,0.95)');
        grad.addColorStop(1, 'rgba(255,100,50,0.7)');
      } else {
        grad.addColorStop(0, 'rgba(120,240,255,0.95)');
        grad.addColorStop(1, 'rgba(0,140,255,0.65)');
      }
      ctx.beginPath();
      ctx.arc(pos.x + wobX, pos.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Stuck fish
      if (blob.stuck) {
        ctx.font = '12px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐟', pos.x + wobX, pos.y);
      }
    });

    // Draw particles
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    });

    // Floaters
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    floaters.forEach(f => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, f.life);
      ctx.font = '20px serif';
      ctx.fillText(f.emoji, f.x, f.y);
      ctx.restore();
    });

    // Draw nodes
    nodes.forEach(n => {
      const pos = nodePos(n.id);
      const isGate = n.gate;
      const closed = isGate && !n.open;

      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 22, 0, Math.PI * 2);
      ctx.fillStyle = closed ? '#334' : (n.id === 'src' ? '#0066aa' : n.id === 'snk' ? '#006644' : '#004488');
      ctx.fill();
      ctx.strokeStyle = closed ? '#556' : '#44ccff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Emoji label
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (n.id === 'src') {
        ctx.fillText('🏊', pos.x, pos.y);
      } else if (n.id === 'snk') {
        ctx.fillText('🌊', pos.x, pos.y);
      } else if (closed) {
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#aaa';
        ctx.fillText('✕', pos.x, pos.y);
      } else {
        // draw open gate
        ctx.font = '14px serif';
        ctx.fillText('💧', pos.x, pos.y);
      }
    });

    // HUD
    const remaining = Math.max(0, Math.ceil(TOTAL_TIME - gameTime));
    hud.setLeft(`<span style="cursor:pointer;font-size:18px" id="m2-back">◀</span>`);
    hud.setCenter(
      `${surgeActive ? '<span style="color:#ff6644">🌊 SURGE!</span> ' : ''}⏱ ${remaining}s`
    );
    hud.setRight(`💧 ${delivered} &nbsp; 🪙 ${budget}`);

    // Ensure back button click
    const backEl = root.querySelector('#m2-back');
    if (backEl && !backEl._bound) {
      backEl._bound = true;
      backEl.addEventListener('click', () => { cleanup(); onComplete(0, 0); });
    }
  }

  // ── End game ───────────────────────────────────────────────────────────────
  function endGame() {
    if (ended) return;
    ended = true;
    cancelAnimationFrame(rafId);

    let stars = 0;
    if (delivered >= GOAL_1) stars = 1;
    if (delivered >= GOAL_2) stars = 2;
    if (delivered >= GOAL_2 && budget >= 40) stars = 3;

    const coins = COINS_WIN[stars];
    if (stars >= 2) sfx.win(); else sfx.fail();

    const lines = [
      `💧 Delivered: ${delivered}`,
      `🪙 Budget left: ${budget}`,
      ``,
      `💡 You discovered <b>load balancing</b>!`,
      `Real internet routers do exactly this — spreading`,
      `traffic across paths to prevent congestion.`,
    ];

    showStarResult(root, {
      stars,
      title: stars === 3 ? 'Flawless Flow!' : stars === 2 ? 'Great Manager!' : stars === 1 ? 'Decent Flow' : 'Jam Packed!',
      lines,
      coins,
      color: '#44ccff',
      onContinue: (s) => { cleanup(); onComplete(stars, coins); },
    });
  }

  // ── Game loop ──────────────────────────────────────────────────────────────
  let rafId;
  function loop(now) {
    if (ended) return;
    if (lastNow === null) lastNow = now;
    const dt = Math.min((now - lastNow) / 1000, 0.05);
    lastNow = now;
    update(dt);
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function cleanup() {
    cancelAnimationFrame(rafId);
    canvas.removeEventListener('click', onCanvasClick);
    destroy();
  }

  showLessonBanner(root, {
    concept: 'Packet Routing & Bandwidth',
    detail: 'Data flows like water — it follows open paths and stops at congested links. Gates = routers.',
    color: '#00b4ff',
  });

  showIntro(root, {
    emoji: '💧',
    title: 'Water Park',
    concept: 'Networks route data through pipes. Bandwidth limits flow. Open the right gates to reach every zone!',
    howto: 'Tap nodes to toggle gates open/closed. Route water from the source to all destinations.',
    color: '#00b4ff',
    onStart: () => { rafId = requestAnimationFrame(loop); },
  });
}
