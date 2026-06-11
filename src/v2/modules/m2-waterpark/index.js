import { makeGameShell, makeHUD, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';
import { t } from '../../shared/i18n.js';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 2 — PIPE BUILDER
// Concept: Bandwidth = how many packets can travel at once.
// Game:    Packets spawn at SOURCE. Player taps a PIPE to add a lane (upgrade).
//          Each pipe shows its current load vs capacity visually.
//          4 DESTINATION pools need to be filled. Congested pipes glow red
//          and drop packets. Player wins by filling all 4 pools in time.
// ─────────────────────────────────────────────────────────────────────────────

const POOLS = [
  { id:'A', label:'🏖️', name:'Beach',    x:0.88, y:0.18, color:'#ffcc44' },
  { id:'B', label:'🏊', name:'Pool',     x:0.88, y:0.42, color:'#44aaff' },
  { id:'C', label:'🎢', name:'Slides',   x:0.88, y:0.65, color:'#ff6644' },
  { id:'D', label:'🌊', name:'Waves',    x:0.72, y:0.88, color:'#44ffcc' },
];

// Fixed pipe network — player upgrades capacity, doesn't toggle open/close
const PIPE_DEFS = [
  { id:'p0', from:{x:0.08,y:0.50}, to:{x:0.30,y:0.28}, cap:1, toPool:null, toNode:'n1' },
  { id:'p1', from:{x:0.08,y:0.50}, to:{x:0.30,y:0.72}, cap:1, toPool:null, toNode:'n2' },
  { id:'p2', from:{x:0.30,y:0.28}, to:{x:0.55,y:0.18}, cap:1, toPool:'A',  toNode:null },
  { id:'p3', from:{x:0.30,y:0.28}, to:{x:0.55,y:0.42}, cap:1, toPool:'B',  toNode:null },
  { id:'p4', from:{x:0.30,y:0.72}, to:{x:0.55,y:0.65}, cap:1, toPool:'C',  toNode:null },
  { id:'p5', from:{x:0.30,y:0.72}, to:{x:0.55,y:0.88}, cap:1, toPool:'D',  toNode:null },
  { id:'p6', from:{x:0.30,y:0.28}, to:{x:0.30,y:0.72}, cap:1, toPool:null, toNode:'cross' }, // cross-link
];

const NEED_PER_POOL = 15;   // packets to fill a pool
const SPAWN_RATE    = 0.28; // seconds between spawns
const TOTAL_TIME    = 70;
const MAX_CAP       = 4;
const UPGRADE_COST  = 1;    // in "points" — freely upgradeable to keep focus on learning
const PACKET_SPEED  = 180;  // px/sec (constant, no normalization confusion)
const SURGE_AT      = 25;
const SURGE_DUR     = 15;

export function launch(app, state, onComplete) {
  const shell = makeGameShell(app, { bgColor: '#001020' });
  const { root, canvas, ctx: getCtx, W, H, destroy, canvasXY } = shell;
  const hud = makeHUD(root, { color: '#44ccff' });

  // ── State ─────────────────────────────────────────────────────────────────
  let pipes = PIPE_DEFS.map(p => ({ ...p, cap: p.cap, load: 0, upgFlash: 0 }));
  let packets   = [];
  let particles = [];
  let floaters  = [];
  let poolFill  = { A:0, B:0, C:0, D:0 };
  let dropped   = 0;
  let delivered = 0;
  let spawnT    = 0;
  let gameTime  = 0;
  let surge     = false;
  let ended     = false;
  let lastNow   = null;
  let rafId;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function wp(fx, fy) { return { x: fx * W(), y: fy * H() }; }
  function poolPos(pid) { const p = POOLS.find(p => p.id === pid); return wp(p.x, p.y); }

  function pipeWorld(pipe) {
    return { ax: pipe.from.x*W(), ay: pipe.from.y*H(), bx: pipe.to.x*W(), by: pipe.to.y*H() };
  }

  function distToSegment(cx, cy, ax, ay, bx, by) {
    const dx=bx-ax, dy=by-ay, len2=dx*dx+dy*dy;
    if (!len2) return Math.hypot(cx-ax, cy-ay);
    const t = Math.max(0, Math.min(1, ((cx-ax)*dx+(cy-ay)*dy)/len2));
    return Math.hypot(cx-(ax+t*dx), cy-(ay+t*dy));
  }

  // Pick which pool to target — least filled, prefer pools with capacity
  function pickPool() {
    const unfilled = POOLS.filter(p => poolFill[p.id] < NEED_PER_POOL);
    if (!unfilled.length) return null;
    // Prefer pool reachable via less-congested pipes
    unfilled.sort((a, b) => poolFill[a.id] - poolFill[b.id]);
    return unfilled[0].id;
  }

  // Find pipe route from source to pool
  // Simple: src → junction → pool pipe
  function routeToPool(poolId) {
    if (poolId === 'A' || poolId === 'B') {
      // via p0 (src→top junction), then p2 or p3
      const junction = pipes.find(p => p.id === 'p0');
      const last     = pipes.find(p => p.toPool === poolId);
      return [junction, last].filter(Boolean);
    } else {
      // via p1 (src→bottom junction), then p4 or p5
      const junction = pipes.find(p => p.id === 'p1');
      const last     = pipes.find(p => p.toPool === poolId);
      return [junction, last].filter(Boolean);
    }
  }

  function spawnPacket() {
    const pool = pickPool();
    if (!pool) return;
    const route = routeToPool(pool);
    if (!route.length) return;
    const first = route[0];
    const { ax, ay } = pipeWorld(first);
    packets.push({
      pool, route, routeIdx: 0,
      x: ax, y: ay,
      tx: first.to.x*W(), ty: first.to.y*H(),
      dropped: false,
    });
  }

  // ── Particles ─────────────────────────────────────────────────────────────
  function burst(x, y, color, n=6) {
    for (let i=0;i<n;i++) {
      const a=Math.random()*Math.PI*2, s=40+Math.random()*80;
      particles.push({ x, y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, r:2+Math.random()*3, color, life:1, decay:1.5+Math.random() });
    }
  }
  function float(x, y, txt, color='#fff') {
    floaters.push({ x, y, vy:-50, life:1, txt, color });
  }

  // ── Update ────────────────────────────────────────────────────────────────
  function update(dt) {
    gameTime += dt;
    surge = gameTime >= SURGE_AT && gameTime < SURGE_AT+SURGE_DUR;
    const interval = surge ? SPAWN_RATE*0.45 : SPAWN_RATE;

    spawnT += dt;
    while (spawnT >= interval) { spawnT -= interval; spawnPacket(); }

    // Count load per pipe
    pipes.forEach(p => { p.load = 0; });
    packets.forEach(pk => {
      if (!pk.dropped) {
        const pipe = pk.route[pk.routeIdx];
        if (pipe) pipe.load++;
      }
    });

    // Move packets
    packets = packets.filter(pk => {
      if (pk.dropped) {
        pk.y += 120 * dt;
        pk.life = (pk.life||1) - dt*2;
        return (pk.life||0) > 0;
      }

      const pipe = pk.route[pk.routeIdx];
      if (!pipe) return false;

      // Drop if congested (load > cap) — this is the key teaching moment
      if (pipe.load > pipe.cap) {
        pk.dropped = true;
        pk.life = 1;
        dropped++;
        const col = POOLS.find(p=>p.id===pk.pool)?.color || '#f00';
        burst(pk.x, pk.y, '#ff4444', 4);
        float(pk.x, pk.y-20, '💔 dropped', '#ff6644');
        sfx.block?.();
        return true;
      }

      // Move toward target
      const dx = pk.tx - pk.x, dy = pk.ty - pk.y;
      const dist = Math.hypot(dx, dy);
      const step = PACKET_SPEED * dt;

      if (dist <= step) {
        // Arrived at waypoint
        pk.x = pk.tx; pk.y = pk.ty;
        pk.routeIdx++;
        if (pk.routeIdx >= pk.route.length) {
          // Delivered to pool
          poolFill[pk.pool] = Math.min(NEED_PER_POOL, poolFill[pk.pool]+1);
          delivered++;
          const pos = poolPos(pk.pool);
          const col = POOLS.find(p=>p.id===pk.pool)?.color||'#4f4';
          burst(pos.x, pos.y, col, 5);
          if (poolFill[pk.pool] === NEED_PER_POOL) {
            float(pos.x, pos.y-40, '✅ FULL!', col);
            sfx.win();
          } else {
            sfx.pop();
          }
          return false;
        }
        // Next pipe segment
        const nextPipe = pk.route[pk.routeIdx];
        pk.tx = nextPipe.to.x*W();
        pk.ty = nextPipe.to.y*H();
      } else {
        pk.x += (dx/dist)*step;
        pk.y += (dy/dist)*step;
      }
      return true;
    });

    pipes.forEach(p => { if (p.upgFlash>0) p.upgFlash -= dt*3; });

    particles = particles.filter(p => {
      p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=100*dt; p.life-=p.decay*dt; return p.life>0;
    });
    floaters = floaters.filter(f => { f.y+=f.vy*dt; f.life-=1.2*dt; return f.life>0; });

    if (gameTime >= TOTAL_TIME && !ended) endGame();
  }

  // ── Draw ──────────────────────────────────────────────────────────────────
  function draw() {
    const ctx = getCtx();
    const w=W(), h=H();

    // Background
    ctx.fillStyle='#001020'; ctx.fillRect(0,0,w,h);

    // Subtle grid
    ctx.strokeStyle='rgba(0,60,100,0.2)'; ctx.lineWidth=1;
    for(let x=0;x<w;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=0;y<h;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}

    // ── Pipes ──────────────────────────────────────────────────────────────
    pipes.forEach(pipe => {
      const {ax,ay,bx,by} = pipeWorld(pipe);
      const cong = pipe.load > pipe.cap;
      const laneW = 6 + (pipe.cap-1)*5; // visually grows with capacity

      // shadow
      ctx.lineCap='round';
      ctx.strokeStyle='rgba(0,0,0,0.5)';
      ctx.lineWidth=laneW+6;
      ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke();

      // lanes (draw cap number of parallel lines)
      for (let lane=0; lane<pipe.cap; lane++) {
        const offset = (lane-(pipe.cap-1)/2) * 4;
        const len=Math.hypot(bx-ax,by-ay)||1;
        const nx=(-(by-ay)/len)*offset, ny=((bx-ax)/len)*offset;
        const active = lane < pipe.load;
        ctx.strokeStyle = cong ? `rgba(255,${60+lane*30},30,0.9)` :
                          active ? '#00ccff' : 'rgba(0,80,120,0.5)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(ax+nx, ay+ny);
        ctx.lineTo(bx+nx, by+ny);
        ctx.stroke();
      }

      // upgrade flash
      if (pipe.upgFlash > 0) {
        ctx.strokeStyle = `rgba(255,255,100,${pipe.upgFlash})`;
        ctx.lineWidth = laneW+2;
        ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke();
      }

      // congestion pulse
      if (cong) {
        const pulse = 0.5+0.5*Math.sin(gameTime*12);
        ctx.strokeStyle = `rgba(255,50,30,${0.4*pulse})`;
        ctx.lineWidth = laneW+8;
        ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke();
      }

      // capacity label — key teaching element
      const mid = { x:(ax+bx)/2, y:(ay+by)/2 };
      const len = Math.hypot(bx-ax, by-ay)||1;
      const nx2 = -(by-ay)/len * 14, ny2 = (bx-ax)/len * 14;
      ctx.save();
      ctx.fillStyle = cong ? '#ff6644' : '#44ccff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${pipe.load}/${pipe.cap}`, mid.x+nx2, mid.y+ny2);

      // tap hint on congested pipes
      if (cong) {
        ctx.font = '10px monospace';
        ctx.fillStyle = '#ffcc44';
        ctx.fillText('TAP ▲', mid.x+nx2, mid.y+ny2+14);
      }
      ctx.restore();
    });

    // ── Packets ────────────────────────────────────────────────────────────
    packets.forEach(pk => {
      const col = POOLS.find(p=>p.id===pk.pool)?.color || '#44ccff';
      if (pk.dropped) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pk.life||0);
        ctx.font='16px serif';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText('💔', pk.x, pk.y);
        ctx.restore();
        return;
      }
      // Square packet with color
      ctx.save();
      ctx.fillStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(pk.x-6, pk.y-6, 12, 12, 3);
      ctx.fill();
      ctx.restore();
    });

    // ── SOURCE node ────────────────────────────────────────────────────────
    const src = wp(0.08, 0.50);
    ctx.beginPath(); ctx.arc(src.x, src.y, 26, 0, Math.PI*2);
    ctx.fillStyle='#002244'; ctx.fill();
    ctx.strokeStyle='#44ccff'; ctx.lineWidth=3; ctx.stroke();
    ctx.font='22px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('💻', src.x, src.y);
    ctx.font='bold 9px monospace'; ctx.fillStyle='#44ccff';
    ctx.fillText('SERVER', src.x, src.y+34);

    // Junction dots
    [[0.30,0.28],[0.30,0.72]].forEach(([fx,fy]) => {
      const p=wp(fx,fy);
      ctx.beginPath(); ctx.arc(p.x,p.y,10,0,Math.PI*2);
      ctx.fillStyle='#003355'; ctx.fill();
      ctx.strokeStyle='#44ccff88'; ctx.lineWidth=2; ctx.stroke();
    });

    // ── POOLS ──────────────────────────────────────────────────────────────
    POOLS.forEach(pool => {
      const pos = poolPos(pool.id);
      const fill = poolFill[pool.id]/NEED_PER_POOL;
      const full = fill >= 1;

      // glow when full
      if (full) {
        ctx.save();
        ctx.shadowColor = pool.color; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(pos.x,pos.y,32,0,Math.PI*2);
        ctx.strokeStyle=pool.color; ctx.lineWidth=3; ctx.stroke();
        ctx.restore();
      }

      // fill arc
      ctx.beginPath();
      ctx.moveTo(pos.x,pos.y);
      ctx.arc(pos.x,pos.y,28,-Math.PI/2,-Math.PI/2+fill*Math.PI*2);
      ctx.closePath();
      ctx.fillStyle = pool.color + '33';
      ctx.fill();

      // border
      ctx.beginPath(); ctx.arc(pos.x,pos.y,28,0,Math.PI*2);
      ctx.strokeStyle = full ? pool.color : pool.color+'88';
      ctx.lineWidth = full ? 3 : 2;
      ctx.stroke();
      ctx.fillStyle='#001020'; ctx.fill();
      ctx.beginPath(); ctx.arc(pos.x,pos.y,28,0,Math.PI*2);
      ctx.fillStyle = pool.color+'22'; ctx.fill();

      // emoji
      ctx.font='24px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(pool.label, pos.x, pos.y);

      // name + fill bar below
      ctx.font='bold 10px monospace'; ctx.fillStyle=pool.color;
      ctx.textAlign='center';
      ctx.fillText(pool.name, pos.x, pos.y+38);

      const bw=52, bh=7, bx=pos.x-bw/2, by=pos.y+46;
      ctx.fillStyle='#002244';
      ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,3); ctx.fill();
      ctx.fillStyle=full?pool.color:pool.color+'bb';
      ctx.beginPath(); ctx.roundRect(bx,by,bw*fill,bh,3); ctx.fill();

      ctx.font='bold 9px monospace'; ctx.fillStyle='#fff';
      ctx.fillText(`${poolFill[pool.id]}/${NEED_PER_POOL}`, pos.x, by+bh+9);
    });

    // ── Particles / floaters ───────────────────────────────────────────────
    particles.forEach(p => {
      ctx.save(); ctx.globalAlpha=Math.max(0,p.life);
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.color; ctx.fill(); ctx.restore();
    });
    floaters.forEach(f => {
      ctx.save(); ctx.globalAlpha=Math.max(0,f.life);
      ctx.font='12px monospace'; ctx.fillStyle=f.color;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(f.txt, f.x, f.y); ctx.restore();
    });

    // ── HUD ────────────────────────────────────────────────────────────────
    const rem = Math.max(0,Math.ceil(TOTAL_TIME-gameTime));
    const filled = POOLS.filter(p=>poolFill[p.id]>=NEED_PER_POOL).length;
    hud.setLeft(`<span style="cursor:pointer" id="m2b">◀</span>`);
    hud.setCenter(surge
      ? `<span style="color:#ff6644;font-weight:700">⚡ SURGE! ⚡</span> &nbsp; ⏱ ${rem}s`
      : `⏱ ${rem}s`);
    hud.setRight(`✅ ${filled}/4 &nbsp; 💔 dropped: ${dropped}`);
    const bk=root.querySelector('#m2b');
    if(bk&&!bk._b){bk._b=true;bk.addEventListener('click',()=>{cleanup();onComplete(0,0);});}
  }

  // ── Click — upgrade pipe capacity ─────────────────────────────────────────
  function onClick(e) {
    if (ended) return;
    const { x:cx, y:cy } = canvasXY(e);
    for (const pipe of pipes) {
      const {ax,ay,bx,by} = pipeWorld(pipe);
      if (distToSegment(cx,cy,ax,ay,bx,by) < 16) {
        if (pipe.cap < MAX_CAP) {
          pipe.cap++;
          pipe.upgFlash = 1;
          const mid = {x:(ax+bx)/2, y:(ay+by)/2};
          burst(mid.x, mid.y, '#ffff44', 5);
          float(mid.x, mid.y-20, `+1 lane → ${pipe.cap} lanes`, '#ffcc44');
          sfx.coin();
        } else {
          float(cx, cy-20, 'MAX lanes!', '#ff6644');
          sfx.block?.();
        }
        return;
      }
    }
  }
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('touchend', e=>{ e.preventDefault(); onClick(e); }, {passive:false});

  // ── End ───────────────────────────────────────────────────────────────────
  function endGame() {
    if (ended) return;
    ended = true;
    cancelAnimationFrame(rafId);
    const filled = POOLS.filter(p=>poolFill[p.id]>=NEED_PER_POOL).length;
    const stars = filled>=4 ? 3 : filled>=2 ? 2 : filled>=1 ? 1 : 0;
    const coins = [0,25,50,80][stars];
    stars>=2 ? sfx.win() : sfx.fail();
    showStarResult(root, {
      stars, color:'#44ccff',
      title: ['All Dropped 😢','Partial Flow','Good Bandwidth!','Network Master! 🏆'][stars],
      lines: [
        `Pools filled: ${filled}/4`,
        `Packets delivered: ${delivered} &nbsp; Dropped: ${dropped}`,
        `💡 <b>Bandwidth = lanes on a highway.</b>`,
        `More lanes = more packets at once = no drops.`,
        `Real networks upgrade links the same way!`,
      ],
      coins,
      onContinue: s => { cleanup(); onComplete(stars, coins); },
    });
  }

  // ── Loop ──────────────────────────────────────────────────────────────────
  function loop(now) {
    if (ended) return;
    if (lastNow===null) lastNow=now;
    const dt = Math.min((now-lastNow)/1000, 0.05);
    lastNow=now;
    update(dt);
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function cleanup() {
    cancelAnimationFrame(rafId);
    canvas.removeEventListener('click', onClick);
    destroy();
  }

  // ── Lesson + intro ────────────────────────────────────────────────────────
  showLessonBanner(root, {
    concept: t('m2.concept'),
    detail: 'More bandwidth = more packets can travel at once. Congested links drop packets. Tap pipes to add lanes!',
    color: '#44ccff',
  });

  showIntro(root, {
    emoji: '💧',
    title: t('m2.title'),
    concept: t('m2.concept'),
    howto: t('m2.howto'),
    color: '#44ccff',
    onStart: () => { rafId = requestAnimationFrame(loop); },
  });
}
