import { makeGameShell, makeHUD, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';

export function launch(app, state, onComplete) {
  const shell = makeGameShell(app, { bgColor: '#0a0014' });
  const { root, canvas, ctx, W, H, destroy, canvasXY } = shell;
  const hud = makeHUD(root, { color: '#7fd8ff' });

  const backBtn = document.createElement('button');
  backBtn.textContent = '← Back';
  backBtn.style.cssText = 'position:absolute;top:8px;left:8px;z-index:80;background:rgba(0,0,0,0.5);border:1px solid #7fd8ff55;color:#7fd8ff;padding:6px 14px;border-radius:8px;font-family:inherit;font-size:12px;cursor:pointer;';
  backBtn.onclick = () => done(0, 0);
  root.appendChild(backBtn);

  // ── Layout ──────────────────────────────────────────────────────────────────
  function buildLayout() {
    const cx = W() / 2, cy = H() / 2;
    const tr = Math.min(W(), H()) * 0.28, br = Math.min(W(), H()) * 0.42;
    const dc = { id: 'dc', type: 'dc', x: cx, y: cy, alive: true };
    const tAngles = [0.25, 0.75, 1.25, 1.75].map(v => v * Math.PI);
    const towers = tAngles.map((a, i) => ({
      id: `t${i}`, type: 'tower', alive: true,
      x: cx + Math.cos(a) * tr, y: cy + Math.sin(a) * tr,
    }));
    const buildings = [];
    towers.forEach((t, ti) => {
      [-0.22, 0.22].forEach((off, bi) => {
        const a = tAngles[ti] + off;
        buildings.push({ id: `b${ti}_${bi}`, type: 'building', alive: true, saved: false,
          x: cx + Math.cos(a) * br, y: cy + Math.sin(a) * br, towerId: t.id });
      });
    });
    const coreLinks = [];
    towers.forEach(t => coreLinks.push({ a: 'dc', b: t.id }));
    buildings.forEach(b => coreLinks.push({ a: b.towerId, b: b.id }));
    return { dc, towers, buildings, coreLinks };
  }

  let { dc, towers, buildings, coreLinks } = buildLayout();
  const backupLinks = [], MAX_BL = 5;
  let selected = null, phase = 'build';
  let buildStart = performance.now();
  let monsters = [], particles = [], savedLabels = [], phaseText = null;

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const allNodes = () => [dc, ...towers, ...buildings];
  const nodeById = id => allNodes().find(n => n.id === id);

  function bfsOnline() {
    const adj = {}; allNodes().forEach(n => { adj[n.id] = []; });
    coreLinks.forEach(({ a, b }) => {
      const na = nodeById(a), nb = nodeById(b);
      if (na && nb && (na.alive || na.type === 'dc') && (nb.alive || nb.type === 'dc'))
        { adj[a].push(b); adj[b].push(a); }
    });
    backupLinks.forEach(({ a, b }) => {
      const na = nodeById(a), nb = nodeById(b);
      if (na && nb) { adj[a].push(b); adj[b].push(a); }
    });
    const vis = new Set(['dc']); const q = ['dc'];
    while (q.length) {
      const cur = q.shift(); const node = nodeById(cur);
      if (!node || (!node.alive && node.type !== 'dc')) continue;
      for (const nb of adj[cur]) {
        if (!vis.has(nb)) {
          const nbn = nodeById(nb);
          if (nbn && (nbn.alive || nbn.type === 'dc')) { vis.add(nb); q.push(nb); }
        }
      }
    }
    return vis;
  }

  // ── Drawing ──────────────────────────────────────────────────────────────────
  function drawScene(ts) {
    const c = ctx(), w = W(), h = H();
    c.clearRect(0, 0, w, h);
    c.fillStyle = '#0a0014'; c.fillRect(0, 0, w, h);
    // Stars
    c.fillStyle = '#fff';
    for (let i = 0; i < 60; i++) {
      c.globalAlpha = 0.3 + (i % 5) * 0.12;
      c.beginPath(); c.arc((i * 173 + 37) % w, (i * 97 + 13) % (h * 0.7), 1, 0, 6.28); c.fill();
    }
    c.globalAlpha = 1;

    const online = (phase === 'build') ? new Set(allNodes().map(n => n.id)) : bfsOnline();

    // Links
    coreLinks.forEach(({ a, b }) => drawLink(c, nodeById(a), nodeById(b), false));
    backupLinks.forEach(({ a, b }) => drawLink(c, nodeById(a), nodeById(b), true));

    // Buildings
    buildings.forEach(b => {
      const on = b.alive && online.has(b.id);
      c.fillStyle = on ? '#c9b6ff' : '#333';
      c.fillRect(b.x - 10, b.y - 13, 20, 26);
      for (let r = 0; r < 2; r++) for (let col = 0; col < 2; col++) {
        c.fillStyle = on ? '#ffe87a' : '#222';
        c.fillRect(b.x - 7 + col * 9, b.y - 8 + r * 9, 5, 4);
      }
    });

    // Towers
    towers.forEach(t => {
      c.save();
      if (t.alive) { c.shadowColor = '#7fd8ff'; c.shadowBlur = 12; }
      c.beginPath();
      c.moveTo(t.x - 6, t.y + 16); c.lineTo(t.x + 6, t.y + 16); c.lineTo(t.x, t.y - 16);
      c.closePath(); c.fillStyle = t.alive ? '#7fd8ff' : '#444'; c.fill();
      if (t.alive) {
        c.beginPath(); c.arc(t.x, t.y - 20, 4, 0, 6.28);
        c.fillStyle = '#fff'; c.fill();
      }
      c.restore();
    });

    // Data center
    c.save(); c.shadowColor = '#7fd8ff'; c.shadowBlur = 20;
    c.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      i === 0 ? c.moveTo(dc.x + 28 * Math.cos(a), dc.y + 28 * Math.sin(a))
              : c.lineTo(dc.x + 28 * Math.cos(a), dc.y + 28 * Math.sin(a));
    }
    c.closePath(); c.fillStyle = '#0a2240'; c.fill();
    c.strokeStyle = '#7fd8ff'; c.lineWidth = 2.5; c.stroke();
    c.fillStyle = '#7fd8ff'; c.font = 'bold 11px monospace'; c.textAlign = 'center';
    c.textBaseline = 'middle'; c.fillText('DC', dc.x, dc.y); c.restore();

    // Selected ring
    if (selected) {
      c.save(); c.strokeStyle = '#ffd700'; c.lineWidth = 2.5; c.setLineDash([4, 3]);
      c.shadowColor = '#ffd700'; c.shadowBlur = 10;
      c.beginPath(); c.arc(selected.x, selected.y, 26, 0, 6.28); c.stroke(); c.restore();
    }

    // Particles
    particles.forEach(p => {
      c.save(); c.globalAlpha = p.life; c.fillStyle = p.color;
      c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.28); c.fill(); c.restore();
    });

    // Monsters
    monsters.forEach(m => {
      const yb = m.y + Math.sin(ts / 180) * 3;
      c.save(); c.shadowColor = m.color; c.shadowBlur = 16;
      c.beginPath(); c.arc(m.x, yb, m.mega ? 30 : 20, 0, 6.28);
      c.fillStyle = m.color; c.fill(); c.shadowBlur = 0;
      const er = m.mega ? 7 : 5;
      [[-7, -5], [7, -5]].forEach(([ex, ey]) => {
        c.beginPath(); c.arc(m.x + ex, yb + ey, er, 0, 6.28); c.fillStyle = '#fff'; c.fill();
        c.beginPath(); c.arc(m.x + ex + 1, yb + ey + 1, er * 0.5, 0, 6.28); c.fillStyle = '#111'; c.fill();
      });
      c.beginPath(); c.arc(m.x, yb + 6, 6, 0, Math.PI);
      c.strokeStyle = '#111'; c.lineWidth = 2; c.stroke();
      const lg = m.done ? 6 : Math.sin(ts / 120) * 4;
      c.strokeStyle = m.color; c.lineWidth = 4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(m.x - 8, yb + (m.mega ? 30 : 20)); c.lineTo(m.x - 8, yb + (m.mega ? 30 : 20) + lg); c.stroke();
      c.beginPath(); c.moveTo(m.x + 8, yb + (m.mega ? 30 : 20)); c.lineTo(m.x + 8, yb + (m.mega ? 30 : 20) - lg); c.stroke();
      c.restore();
    });

    // SAVED labels
    const now = performance.now();
    savedLabels = savedLabels.filter(l => now - l.t < 1800);
    savedLabels.forEach(l => {
      const age = now - l.t, alpha = 1 - age / 1800;
      c.save(); c.globalAlpha = alpha; c.fillStyle = '#44ff88';
      c.font = 'bold 13px monospace'; c.textAlign = 'center';
      c.fillText(l.text, l.x, l.y - (age / 1800) * 30); c.restore();
    });

    // Phase text overlay
    if (phaseText) {
      phaseText.alpha -= 0.012; phaseText.y -= 0.4;
      if (phaseText.alpha > 0) {
        c.save(); c.globalAlpha = Math.min(1, phaseText.alpha);
        c.fillStyle = '#ff4444'; c.font = 'bold 32px monospace'; c.textAlign = 'center';
        c.shadowColor = '#ff0000'; c.shadowBlur = 20;
        c.fillText(phaseText.text, w / 2, phaseText.y); c.restore();
      } else phaseText = null;
    }
  }

  function drawLink(c, na, nb, isBackup) {
    if (!na || !nb) return;
    c.save(); c.beginPath(); c.moveTo(na.x, na.y); c.lineTo(nb.x, nb.y);
    if (isBackup) {
      c.strokeStyle = '#ffd700'; c.lineWidth = 2; c.setLineDash([6, 4]);
      c.shadowColor = '#ffd700'; c.shadowBlur = 6;
    } else { c.strokeStyle = '#ffffff22'; c.lineWidth = 1.5; }
    c.stroke(); c.restore();
  }

  function spawnParticles(x, y) {
    const cols = ['#ff4400','#ff8800','#ffcc00','#ff0000'];
    for (let i = 0; i < 24; i++) {
      const a = Math.random() * 6.28, sp = 1.5 + Math.random() * 3;
      particles.push({ x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp,
        r: 2 + Math.random() * 4, life: 1, color: cols[i % 4] });
    }
  }

  // ── RAF loop ─────────────────────────────────────────────────────────────────
  let rafId = requestAnimationFrame(function tick(ts) {
    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life -= 0.025; });
    particles = particles.filter(p => p.life > 0);
    monsters.forEach(m => {
      if (m.done) return;
      const dx = m.tx - m.x, dy = m.ty - m.y, d = Math.sqrt(dx*dx+dy*dy);
      if (d < 3) { m.x = m.tx; m.y = m.ty; m.done = true; }
      else { m.x += dx/d*m.speed; m.y += dy/d*m.speed; }
    });
    if (phase === 'build') {
      const t = Math.max(0, 30 - (ts - buildStart) / 1000);
      hud.setCenter(`⚡ Click 2 nodes to link | ⏱ ${Math.ceil(t)}s`);
      hud.setRight(`🔗 ${backupLinks.length}/${MAX_BL} backup links`);
      if (t <= 0) startAttack();
    }
    drawScene(ts);
    rafId = requestAnimationFrame(tick);
  });

  // ── Click handler ────────────────────────────────────────────────────────────
  canvas.addEventListener('click', e => {
    if (phase !== 'build') return;
    const { x: mx, y: my } = canvasXY(e);
    const hit = allNodes().find(n => Math.hypot(n.x - mx, n.y - my) < 28);
    if (!hit) { selected = null; return; }
    sfx.click();
    if (!selected) { selected = hit; return; }
    if (selected.id === hit.id) { selected = null; return; }
    const dup = backupLinks.some(l => (l.a===selected.id&&l.b===hit.id)||(l.b===selected.id&&l.a===hit.id));
    if (!dup && backupLinks.length < MAX_BL) { backupLinks.push({ a: selected.id, b: hit.id }); sfx.pop(); }
    else sfx.block();
    selected = null;
  });

  // ── Phase 2 ──────────────────────────────────────────────────────────────────
  function stompTower(tid) {
    const t = towers.find(t => t.id === tid); if (!t || !t.alive) return;
    sfx.boom(); t.alive = false; spawnParticles(t.x, t.y);
    const online = bfsOnline();
    buildings.forEach(b => {
      if (b.towerId !== tid) return;
      if (online.has(b.id)) { b.saved = true; savedLabels.push({ x:b.x, y:b.y-20, t:performance.now(), text:'✨ SAVED!' }); sfx.coin(); }
      else b.alive = false;
    });
  }

  function startAttack() {
    if (phase !== 'build') return;
    phase = 'attack'; selected = null;
    hud.setCenter('⚠️ MONSTERS ATTACKING!'); hud.setRight('');
    const online0 = bfsOnline();
    const perfect = buildings.filter(b => online0.has(b.id)).length === 8;
    const shuffled = [...towers].sort(() => Math.random() - 0.5);
    const targets = shuffled.slice(0, 3);
    phaseText = { text: '👾 MONSTER ATTACK!', alpha: 2.5, y: H() / 2 };
    const MCOLS = ['#44dd44','#ff8833','#cc55ff'];
    const edgePts = [{ x:-40, y:H()*0.3 }, { x:W()+40, y:H()*0.5 }, { x:W()*0.5, y:-40 }];

    targets.forEach((tower, i) => {
      setTimeout(() => {
        const m = { x:edgePts[i].x, y:edgePts[i].y, tx:tower.x, ty:tower.y,
          speed:1.6, color:MCOLS[i], towerId:tower.id, done:false };
        monsters.push(m);
        const iv = setInterval(() => { if (m.done) { clearInterval(iv); stompTower(m.towerId); setTimeout(()=>{ const idx=monsters.indexOf(m); if(idx>=0)monsters.splice(idx,1); },1200); } }, 50);
      }, i * 1200 + 800);
    });

    if (perfect && shuffled[3]) {
      setTimeout(() => {
        hud.setCenter('💥 MEGA MONSTER!!');
        const mg = { x:W()/2, y:H()+50, tx:shuffled[3].x, ty:shuffled[3].y,
          speed:1.2, color:'#ff00ff', towerId:shuffled[3].id, done:false, mega:true };
        monsters.push(mg);
        const iv = setInterval(() => { if (mg.done) { clearInterval(iv); stompTower(mg.towerId); } }, 50);
      }, targets.length * 1200 + 2000);
    }

    const totalDelay = (targets.length * 1200 + 800) + 5000 + (perfect ? 4000 : 0);
    setTimeout(showResults, totalDelay);
  }

  function showResults() {
    phase = 'done';
    const online = bfsOnline();
    const onlineCount = buildings.filter(b => online.has(b.id)).length;
    const stars = onlineCount >= 8 ? 3 : onlineCount >= 6 ? 2 : onlineCount >= 4 ? 1 : 0;
    const coins = stars * 15;
    sfx[stars >= 2 ? 'win' : 'fail']();
    hud.setCenter('');
    showStarResult(root, {
      stars, maxStars: 3,
      title: ['City Offline 😞','Partial Redundancy 🌐','Good Redundancy! 🛡️','Perfect Redundancy! 🏆'][stars],
      lines: [
        `🏙 Buildings online: ${onlineCount}/8`,
        `🔗 Backup links used: ${backupLinks.length}/${MAX_BL}`,
        '─────────────────────────',
        stars===3?'★ Redundancy Master! Every building had an alternate path.':
        stars===2?'Backup links saved most buildings — redundancy worked!':
        stars===1?'Some buildings survived via backups, but many were isolated.':
        'No backup paths → single point of failure. City went dark.',
        '─────────────────────────',
        '📡 Real-world: Internet backbone cables have redundant routes.',
        'When a router fails, packets automatically take another path.',
      ],
      coins, color: '#ffd700',
      onContinue: () => done(stars, coins),
    });
  }

  function done(stars, coins) {
    cancelAnimationFrame(rafId); destroy(); onComplete(stars, coins);
  }

  showLessonBanner(root, {
    concept: 'Network Redundancy',
    detail: 'Real internet cables break. Redundancy = extra backup paths so data still flows around failures.',
    color: '#c9b6ff',
  });

  showIntro(root, {
    emoji: '👾',
    title: 'Monster Attack!',
    concept: 'Network Redundancy: The internet was designed to survive nuclear attacks by routing around broken links. Engineers add "backup paths" so if one cable is cut, data takes a different route. Buildings with only one path go dark when that path breaks.',
    howto: 'You have 30 seconds to add up to 5 backup links (gold dashed lines). Then 3 monsters destroy towers. Buildings connected to the DC by ANY path stay online. Goal: keep 6+ buildings online for 2 stars, all 8 for 3 stars.',
    color: '#c9b6ff',
    onStart: () => {
      hud.setLeft('👾 Redundancy');
      const onlineNow = buildings.filter(b => b.alive).length;
      hud.setCenter(`⚡ Add backup links — 30s! | 🏙 ${onlineNow}/8 online`);
      hud.setRight(`🔗 ${backupLinks.length}/${MAX_BL} links`);
    },
  });
}
