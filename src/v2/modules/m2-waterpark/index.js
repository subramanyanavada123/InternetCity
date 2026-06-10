import { makeGameShell, makeHUD, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';

// ── Network topology — 4 zones, each needs water ──────────────────────────────
//
//  SRC ──► R1 ──► R2 ──► ZONE-A (🏖️)
//           │      │
//           ▼      ▼
//          R3 ──► R4 ──► ZONE-B (🏊)
//           │      │
//           ▼      ▼
//          R5 ──► R6 ──► ZONE-C (🎢)
//                  │
//                  ▼
//                ZONE-D (🌊)  (hardest to reach)
//
// Routers (R1–R6) can be opened/closed. Player must open the right ones
// so that water reaches ALL 4 zones simultaneously, while staying under
// a congestion budget. Surge events double demand mid-game.

const NODES = [
  { id:'src',  fx:0.05, fy:0.50, kind:'src',   label:'💦' },
  { id:'r1',   fx:0.25, fy:0.25, kind:'router', label:'R1' },
  { id:'r2',   fx:0.50, fy:0.20, kind:'router', label:'R2' },
  { id:'r3',   fx:0.25, fy:0.50, kind:'router', label:'R3' },
  { id:'r4',   fx:0.50, fy:0.50, kind:'router', label:'R4' },
  { id:'r5',   fx:0.25, fy:0.75, kind:'router', label:'R5' },
  { id:'r6',   fx:0.50, fy:0.75, kind:'router', label:'R6' },
  { id:'zA',   fx:0.82, fy:0.18, kind:'zone',   label:'🏖️', name:'Beach' },
  { id:'zB',   fx:0.82, fy:0.42, kind:'zone',   label:'🏊', name:'Pool' },
  { id:'zC',   fx:0.82, fy:0.65, kind:'zone',   label:'🎢', name:'Slides' },
  { id:'zD',   fx:0.65, fy:0.88, kind:'zone',   label:'🌊', name:'Wave Pool' },
];

const PIPES = [
  { id:0, from:'src', to:'r1', cap:3 },
  { id:1, from:'src', to:'r3', cap:3 },
  { id:2, from:'src', to:'r5', cap:2 },
  { id:3, from:'r1',  to:'r2', cap:2 },
  { id:4, from:'r1',  to:'r3', cap:1 },
  { id:5, from:'r2',  to:'r4', cap:1 },
  { id:6, from:'r2',  to:'zA', cap:2 },
  { id:7, from:'r3',  to:'r4', cap:2 },
  { id:8, from:'r3',  to:'r5', cap:1 },
  { id:9, from:'r4',  to:'zB', cap:2 },
  { id:10,from:'r4',  to:'r6', cap:1 },
  { id:11,from:'r5',  to:'r6', cap:2 },
  { id:12,from:'r6',  to:'zC', cap:2 },
  { id:13,from:'r6',  to:'zD', cap:1 },
];

const ZONE_IDS   = ['zA','zB','zC','zD'];
const ZONE_NEED  = 8;   // packets needed per zone to "fill" it
const TOTAL_TIME = 75;
const BASE_SPAWN = 0.35;
const SURGE_AT   = 20;
const SURGE_DUR  = 18;
const BLOB_SPEED = 0.25;

export function launch(app, state, onComplete) {
  const shell = makeGameShell(app, { bgColor: '#001828' });
  const { root, canvas, ctx: getCtx, W, H, destroy, canvasXY } = shell;
  const hud = makeHUD(root, { color: '#44ccff' });

  // ── State ─────────────────────────────────────────────────────────────────
  let nodes = NODES.map(n => ({ ...n, open: n.kind !== 'router' })); // routers start closed
  let pipes = PIPES.map(p => ({ ...p, load: 0, upgFlash: 0 }));
  let blobs       = [];
  let particles   = [];
  let floaters    = [];
  let zoneFill    = { zA:0, zB:0, zC:0, zD:0 };
  let delivered   = 0;
  let spawnTimer  = 0;
  let gameTime    = 0;
  let surgeActive = false;
  let ended       = false;
  let lastNow     = null;
  let rafId;
  let hintShown   = false;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const nodeById = id => nodes.find(n => n.id === id);
  const nodePos  = id => { const n = nodeById(id); return { x: n.fx * W(), y: n.fy * H() }; };
  const pipeMid  = p  => { const a = nodePos(p.from), b = nodePos(p.to); return { x:(a.x+b.x)/2, y:(a.y+b.y)/2 }; };

  // BFS: find ALL paths from src to a given zone (through open routers)
  function bfsPath(fromId, toId) {
    const visited = new Set([fromId]);
    const queue = [{ node: fromId, path: [] }];
    while (queue.length) {
      const { node, path } = queue.shift();
      if (node === toId) return path;
      for (const p of pipes) {
        let next = null;
        if (p.from === node) next = p.to;
        else if (p.to === node) next = p.from; // bidirectional? no — directed only
        if (p.from !== node) continue;
        next = p.to;
        if (visited.has(next)) continue;
        const nNode = nodeById(next);
        if (!nNode) continue;
        if (nNode.kind === 'router' && !nNode.open) continue;
        visited.add(next);
        queue.push({ node: next, path: [...path, p.id] });
      }
    }
    return null;
  }

  // Pick one active zone to target (least-filled reachable zone)
  function pickTarget() {
    const reachable = ZONE_IDS.filter(zid => {
      if (zoneFill[zid] >= ZONE_NEED) return false;
      return bfsPath('src', zid) !== null;
    });
    if (!reachable.length) return null;
    reachable.sort((a, b) => zoneFill[a] - zoneFill[b]);
    return reachable[0];
  }

  function spawnBlob() {
    const target = pickTarget();
    if (!target) return;
    const route = bfsPath('src', target);
    if (!route || !route.length) return;
    blobs.push({ route, routePos: 0, pipeId: route[0], t: 0, target, stuck: false, wobble: 0 });
  }

  function getPipe(id) { return pipes.find(p => p.id === id); }

  // ── Particles ─────────────────────────────────────────────────────────────
  function sparkle(x, y, color = null) {
    for (let i = 0; i < 5; i++) {
      const a = Math.random() * Math.PI * 2, s = 30 + Math.random() * 60;
      particles.push({
        x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s,
        life: 1, decay: 1.8 + Math.random(),
        r: 2 + Math.random() * 3,
        color: color || `hsl(${180+Math.random()*60},100%,${60+Math.random()*30}%)`,
      });
    }
  }

  function floatText(x, y, txt) {
    floaters.push({ x, y, vy: -55, life: 1, txt });
  }

  // ── Update ────────────────────────────────────────────────────────────────
  function update(dt) {
    gameTime += dt;
    surgeActive = gameTime >= SURGE_AT && gameTime < SURGE_AT + SURGE_DUR;
    const interval = surgeActive ? BASE_SPAWN * 0.45 : BASE_SPAWN;

    spawnTimer += dt;
    while (spawnTimer >= interval) { spawnTimer -= interval; spawnBlob(); }

    // load count
    pipes.forEach(p => { p.load = 0; });
    blobs.forEach(b => { const p = getPipe(b.pipeId); if (p) p.load++; });

    // move blobs
    blobs = blobs.filter(blob => {
      const pipe = getPipe(blob.pipeId);
      if (!pipe) return false;
      const congested = pipe.load > pipe.cap;
      blob.stuck = congested;
      blob.wobble = congested ? blob.wobble + dt * 9 : 0;
      const a = nodePos(pipe.from), b = nodePos(pipe.to);
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const speed = (congested ? BLOB_SPEED * 0.28 : BLOB_SPEED) * (200 / Math.max(len, 1));
      blob.t += speed * dt;
      if (blob.t >= 1) {
        blob.routePos++;
        if (blob.routePos >= blob.route.length) {
          // arrived at zone
          zoneFill[blob.target] = Math.min(ZONE_NEED, (zoneFill[blob.target] || 0) + 1);
          delivered++;
          const zPos = nodePos(blob.target);
          sparkle(zPos.x, zPos.y, '#44ffcc');
          if (zoneFill[blob.target] === ZONE_NEED) {
            floatText(zPos.x, zPos.y - 30, '✅ Full!');
            sfx.win();
          } else {
            sfx.pop();
          }
          return false;
        }
        blob.pipeId = blob.route[blob.routePos];
        blob.t = 0;
      }
      return true;
    });

    pipes.forEach(p => { if (p.upgFlash > 0) p.upgFlash -= dt; });

    particles = particles.filter(p => {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 80 * dt;
      p.life -= p.decay * dt;
      return p.life > 0;
    });
    floaters = floaters.filter(f => { f.y += f.vy * dt; f.life -= 1.4 * dt; return f.life > 0; });

    // congestion warning
    pipes.forEach(p => {
      if (p.load > p.cap && Math.random() < dt * 2) {
        const m = pipeMid(p);
        floatText(m.x + (Math.random()-0.5)*30, m.y - 10, '🔴');
      }
      if (p.load > 0 && p.load <= p.cap && Math.random() < dt * 2) {
        const m = pipeMid(p);
        const a = nodePos(p.from), b = nodePos(p.to);
        const t2 = Math.random();
        sparkle(a.x+(b.x-a.x)*t2, a.y+(b.y-a.y)*t2);
      }
    });

    // hint after 8s if nothing flowing
    if (!hintShown && gameTime > 8 && delivered === 0) {
      hintShown = true;
      floatText(W() * 0.4, H() * 0.4, '👆 Tap routers to open!');
    }

    if (gameTime >= TOTAL_TIME && !ended) endGame();
  }

  // ── Draw ──────────────────────────────────────────────────────────────────
  function draw() {
    const ctx = getCtx();
    const w = W(), h = H();

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#001828');
    bg.addColorStop(1, '#002a3a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Subtle wave lines
    ctx.strokeStyle = 'rgba(0,100,180,0.15)';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 50) {
        ctx.quadraticCurveTo(x+12, y-5, x+25, y);
        ctx.quadraticCurveTo(x+37, y+5, x+50, y);
      }
      ctx.stroke();
    }

    // ── Pipes ──────────────────────────────────────────────────────────────
    pipes.forEach(pipe => {
      const a = nodePos(pipe.from), b = nodePos(pipe.to);
      const congested = pipe.load > pipe.cap;
      const baseW = 6 + (pipe.cap - 1) * 4;

      ctx.lineCap = 'round';

      // shadow
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = baseW + 4;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();

      // body
      if (pipe.upgFlash > 0) {
        ctx.strokeStyle = `rgba(255,255,255,${pipe.upgFlash * 3})`;
      } else if (congested) {
        ctx.strokeStyle = `hsl(${10 + Math.sin(gameTime*8)*10},100%,50%)`;
      } else if (pipe.load > 0) {
        ctx.strokeStyle = '#00ccff';
      } else {
        ctx.strokeStyle = '#003a55';
      }
      ctx.lineWidth = baseW;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();

      // inner shine
      if (!congested && pipe.load > 0) {
        ctx.strokeStyle = 'rgba(140,240,255,0.4)';
        ctx.lineWidth = Math.max(2, baseW * 0.3);
        const len = Math.hypot(b.x-a.x, b.y-a.y);
        const nx = -(b.y-a.y)/len * baseW * 0.18, ny = (b.x-a.x)/len * baseW * 0.18;
        ctx.beginPath(); ctx.moveTo(a.x+nx, a.y+ny); ctx.lineTo(b.x+nx, b.y+ny); ctx.stroke();
      }

      // capacity dots on pipe
      const mid = pipeMid(pipe);
      ctx.fillStyle = congested ? '#ff6633' : 'rgba(0,200,255,0.8)';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const dots = '●'.repeat(pipe.cap);
      ctx.fillText(dots, mid.x, mid.y - baseW * 0.65 - 3);
    });

    // ── Blobs ──────────────────────────────────────────────────────────────
    blobs.forEach(blob => {
      const pipe = getPipe(blob.pipeId);
      if (!pipe) return;
      const a = nodePos(pipe.from), b = nodePos(pipe.to);
      const x = a.x + (b.x-a.x)*blob.t + (blob.stuck ? Math.sin(blob.wobble)*4 : 0);
      const y = a.y + (b.y-a.y)*blob.t;
      const cong = pipe.load > pipe.cap;

      // trail
      if (!cong) {
        const dx = b.x-a.x, dy = b.y-a.y, len = Math.hypot(dx,dy)||1;
        const tx = dx/len, ty = dy/len;
        for (let i = 1; i <= 4; i++) {
          ctx.beginPath();
          ctx.arc(x - tx*i*4, y - ty*i*4, 7-i*1.4, 0, Math.PI*2);
          ctx.fillStyle = `rgba(0,180,255,${0.12-i*0.025})`;
          ctx.fill();
        }
      }

      // body
      const g = ctx.createRadialGradient(x-2, y-2, 1, x, y, 9);
      g.addColorStop(0, cong ? 'rgba(255,200,80,1)' : 'rgba(150,245,255,1)');
      g.addColorStop(1, cong ? 'rgba(255,80,30,0.7)' : 'rgba(0,150,255,0.6)');
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI*2);
      ctx.fillStyle = g;
      ctx.fill();

      if (cong) {
        ctx.font = '10px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐟', x, y);
      }
    });

    // ── Nodes ──────────────────────────────────────────────────────────────
    nodes.forEach(n => {
      const pos = nodePos(n.id);
      const isRouter = n.kind === 'router';
      const closed = isRouter && !n.open;

      // zone fill arc
      if (n.kind === 'zone') {
        const fill = zoneFill[n.id] / ZONE_NEED;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 28, -Math.PI/2, -Math.PI/2 + fill * Math.PI * 2);
        ctx.lineTo(pos.x, pos.y);
        ctx.fillStyle = fill >= 1 ? 'rgba(0,255,180,0.3)' : 'rgba(0,150,255,0.2)';
        ctx.fill();
      }

      // outer ring
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, n.kind === 'zone' ? 28 : 22, 0, Math.PI*2);
      const bg2 =
        n.kind === 'src'    ? '#004488' :
        n.kind === 'zone'   ? (zoneFill[n.id] >= ZONE_NEED ? '#004422' : '#002244') :
        closed              ? '#222233' : '#003366';
      ctx.fillStyle = bg2;
      ctx.fill();

      const stroke =
        n.kind === 'src'  ? '#44aaff' :
        n.kind === 'zone' ? (zoneFill[n.id] >= ZONE_NEED ? '#00ff88' : '#44ccff') :
        closed            ? '#445566' : '#44ccff';
      ctx.strokeStyle = stroke;
      ctx.lineWidth = n.kind === 'zone' ? 3 : 2;
      ctx.stroke();

      // glow on open routers with flow
      if (isRouter && n.open) {
        ctx.save();
        ctx.shadowColor = '#44ccff';
        ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 22, 0, Math.PI*2);
        ctx.strokeStyle = '#44ccff88'; ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();
      }

      // icon / label
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (n.kind === 'src' || n.kind === 'zone') {
        ctx.font = '20px serif';
        ctx.fillText(n.label, pos.x, pos.y);
      } else if (closed) {
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#667';
        ctx.fillText('✕', pos.x, pos.y);
      } else {
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#44ccff';
        ctx.fillText(n.label, pos.x, pos.y);
      }

      // zone name + fill bar
      if (n.kind === 'zone') {
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#8ab';
        ctx.textAlign = 'center';
        ctx.fillText(n.name, pos.x, pos.y + 40);
        // fill bar
        const bw = 50, bh = 6, bx = pos.x - bw/2, by = pos.y + 46;
        ctx.fillStyle = '#002244';
        ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 3); ctx.fill();
        const ratio = Math.min(1, zoneFill[n.id] / ZONE_NEED);
        ctx.fillStyle = ratio >= 1 ? '#00ff88' : '#00aaff';
        ctx.beginPath(); ctx.roundRect(bx, by, bw * ratio, bh, 3); ctx.fill();
      }
    });

    // ── Particles / floaters ───────────────────────────────────────────────
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = p.color; ctx.fill();
      ctx.restore();
    });
    floaters.forEach(f => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, f.life);
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(f.txt, f.x, f.y);
      ctx.restore();
    });

    // ── HUD ────────────────────────────────────────────────────────────────
    const rem = Math.max(0, Math.ceil(TOTAL_TIME - gameTime));
    const filled = ZONE_IDS.filter(z => zoneFill[z] >= ZONE_NEED).length;
    hud.setLeft(`<span style="cursor:pointer" id="m2back">◀</span>`);
    hud.setCenter(surgeActive
      ? `<span style="color:#ff6644">🌊 SURGE WAVE!</span> &nbsp; ⏱ ${rem}s`
      : `⏱ ${rem}s`);
    hud.setRight(`✅ ${filled}/4 zones &nbsp; 💧 ${delivered}`);

    const back = root.querySelector('#m2back');
    if (back && !back._b) { back._b = true; back.addEventListener('click', () => { cleanup(); onComplete(0,0); }); }
  }

  // ── End ───────────────────────────────────────────────────────────────────
  function endGame() {
    if (ended) return;
    ended = true;
    cancelAnimationFrame(rafId);
    const filled = ZONE_IDS.filter(z => zoneFill[z] >= ZONE_NEED).length;
    const stars = filled >= 4 ? 3 : filled >= 2 ? 2 : filled >= 1 ? 1 : 0;
    const coins = [0, 25, 50, 80][stars];
    stars >= 2 ? sfx.win() : sfx.fail();
    showStarResult(root, {
      stars, color: '#44ccff',
      title: ['No Flow 😢','Partial Flow 🌊','Good Routing! 💧','Master Router! 🏆'][stars],
      lines: [
        `Zones filled: ${filled}/4`,
        `Packets delivered: ${delivered}`,
        `💡 You just practiced <b>load balancing</b>!`,
        `Real routers split traffic across paths to prevent congestion.`,
      ],
      coins,
      onContinue: s => { cleanup(); onComplete(stars, coins); },
    });
  }

  // ── Loop ──────────────────────────────────────────────────────────────────
  function loop(now) {
    if (ended) return;
    if (lastNow === null) lastNow = now;
    const dt = Math.min((now - lastNow) / 1000, 0.05);
    lastNow = now;
    update(dt);
    draw();
    rafId = requestAnimationFrame(loop);
  }

  // ── Click ─────────────────────────────────────────────────────────────────
  function onClick(e) {
    if (ended) return;
    const { x: cx, y: cy } = canvasXY(e);
    // Toggle router nodes
    for (const n of nodes) {
      if (n.kind !== 'router') continue;
      const p = nodePos(n.id);
      if (Math.hypot(cx-p.x, cy-p.y) < 26) {
        n.open = !n.open;
        sfx.click();
        // kill blobs now blocked
        blobs = blobs.filter(b => {
          const pipe = getPipe(b.pipeId);
          if (!pipe) return false;
          const toN = nodeById(pipe.to);
          if (toN && toN.kind === 'router' && !toN.open) return false;
          return true;
        });
        return;
      }
    }
  }
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('touchend', e => { e.preventDefault(); onClick(e); }, { passive: false });

  function cleanup() {
    cancelAnimationFrame(rafId);
    canvas.removeEventListener('click', onClick);
    destroy();
  }

  // ── Lesson + intro ────────────────────────────────────────────────────────
  showLessonBanner(root, {
    concept: 'Packet Routing & Load Balancing',
    detail: 'Routers decide which path data takes. Opening multiple paths spreads load and prevents congestion.',
    color: '#44ccff',
  });

  showIntro(root, {
    emoji: '💧',
    title: 'Water Park Router',
    concept: 'Routers direct data packets to their destination. Too many packets on one path causes congestion — spread the load!',
    howto: 'Tap routers (R1–R6) to open them. Water flows from 💦 to all 4 zones. Fill every zone bar to win! Surge waves hit at 20s.',
    color: '#44ccff',
    onStart: () => { rafId = requestAnimationFrame(loop); },
  });
}
