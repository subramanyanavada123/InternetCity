import { makeGameShell, makeHUD, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';
import { t } from '../../shared/i18n.js';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 2 — BANDWIDTH BUILDER
// Concept: Bandwidth = how many packets can travel at once (lanes on a highway).
//
// Layout (all in fraction of canvas W×H):
//
//   SERVER(0.10,0.50) ──p0──► NODE_A(0.38,0.22) ──p2──► POOL Beach(0.72,0.14)
//                    │                           └──p3──► POOL Pool (0.72,0.38)
//                    └──p1──► NODE_B(0.38,0.78) ──p4──► POOL Slides(0.72,0.62)
//                                                └──p5──► POOL Waves (0.72,0.86)
//
// Player taps a pipe to add a lane (cap++). Congested pipes glow red and drop
// packets. Win by filling all 4 pools before time runs out.
// ─────────────────────────────────────────────────────────────────────────────

const POOLS = [
  { id:'A', emoji:'🏖️', name:'Beach',  fx:0.82, fy:0.14, color:'#ffcc44' },
  { id:'B', emoji:'🏊', name:'Pool',   fx:0.82, fy:0.38, color:'#44aaff' },
  { id:'C', emoji:'🎢', name:'Slides', fx:0.82, fy:0.62, color:'#ff6644' },
  { id:'D', emoji:'🌊', name:'Waves',  fx:0.82, fy:0.86, color:'#44ffcc' },
];

// Pipe definitions — from/to in fractional coords, which pool they feed (or null for trunk)
const PIPE_DEFS = [
  { id:'p0', fx1:0.10,fy1:0.50, fx2:0.38,fy2:0.22, toPool:null, nodeId:'nA' },
  { id:'p1', fx1:0.10,fy1:0.50, fx2:0.38,fy2:0.78, toPool:null, nodeId:'nB' },
  { id:'p2', fx1:0.38,fy1:0.22, fx2:0.72,fy2:0.14, toPool:'A',  nodeId:null },
  { id:'p3', fx1:0.38,fy1:0.22, fx2:0.72,fy2:0.38, toPool:'B',  nodeId:null },
  { id:'p4', fx1:0.38,fy1:0.78, fx2:0.72,fy2:0.62, toPool:'C',  nodeId:null },
  { id:'p5', fx1:0.38,fy1:0.78, fx2:0.72,fy2:0.86, toPool:'D',  nodeId:null },
];

// Route table: which pipes does a packet take to reach each pool?
const ROUTES = {
  A: ['p0','p2'],
  B: ['p0','p3'],
  C: ['p1','p4'],
  D: ['p1','p5'],
};

const NEED_PER_POOL = 12;
const SPAWN_INTERVAL = 0.32;  // seconds between spawns
const TOTAL_TIME     = 75;
const MAX_CAP        = 5;
const PACKET_SPEED   = 200;   // px/sec
const SURGE_AT       = 28;
const SURGE_DUR      = 14;
const HIT_DIST       = 22;    // px — touch hit area for pipes

export function launch(app, state, onComplete) {
  const shell = makeGameShell(app, { bgColor: '#001828' });
  const { root, canvas, ctx: getCtx, W, H, destroy, canvasXY } = shell;
  const hud = makeHUD(root, { color: '#44ccff' });

  // Back button
  const backBtn = document.createElement('button');
  backBtn.style.cssText = `position:absolute;top:8px;left:16px;z-index:70;
    background:rgba(0,0,0,0.5);border:1px solid #44ccff66;border-radius:10px;
    color:#44ccff;font-size:13px;font-weight:700;cursor:pointer;
    padding:6px 12px;font-family:inherit;`;
  backBtn.textContent = '← Missions';
  backBtn.addEventListener('click', () => { cleanup(); onComplete(0,0); });
  root.appendChild(backBtn);

  // ── State ──────────────────────────────────────────────────────────────────
  // pipes: runtime state for each pipe
  let pipes = PIPE_DEFS.map(d => ({ ...d, cap:1, load:0, upgFlash:0 }));
  let packets   = [];
  let particles = [];
  let floaters  = [];
  let poolFill  = { A:0, B:0, C:0, D:0 };
  let dropped   = 0, delivered = 0;
  let spawnT    = 0, gameTime  = 0;
  let surge     = false, ended  = false;
  let lastNow   = null, rafId   = null;

  // ── Helpers ────────────────────────────────────────────────────────────────
  // World coords from fractional
  function wx(fx){ return fx * W(); }
  function wy(fy){ return fy * H(); }

  function pipeEnds(p){
    return { x1:wx(p.fx1), y1:wy(p.fy1), x2:wx(p.fx2), y2:wy(p.fy2) };
  }

  function poolPos(id){
    const p = POOLS.find(p=>p.id===id);
    return { x: wx(p.fx), y: wy(p.fy) };
  }

  function distToSeg(px,py,ax,ay,bx,by){
    const dx=bx-ax, dy=by-ay, l2=dx*dx+dy*dy;
    if(!l2) return Math.hypot(px-ax,py-ay);
    const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/l2));
    return Math.hypot(px-(ax+t*dx),py-(ay+t*dy));
  }

  function pipeById(id){ return pipes.find(p=>p.id===id); }

  // Decide which pool to feed next — cycle through unfilled ones
  let nextPoolIdx = 0;
  function pickPool(){
    const unfilled = POOLS.filter(p => poolFill[p.id] < NEED_PER_POOL);
    if(!unfilled.length) return null;
    // Round-robin through unfilled pools so all fill somewhat evenly
    const p = unfilled[nextPoolIdx % unfilled.length];
    nextPoolIdx++;
    return p.id;
  }

  // ── Spawn ──────────────────────────────────────────────────────────────────
  function spawnPacket(){
    const poolId = pickPool();
    if(!poolId) return;
    const route = ROUTES[poolId].map(id => pipeById(id));
    const first = route[0];
    const e = pipeEnds(first);
    packets.push({
      poolId,
      route,
      seg: 0,       // which pipe in route we're currently on
      x: e.x1, y: e.y1,
      tx: e.x2, ty: e.y2,
      dropped: false, dropLife: 0,
    });
  }

  // ── Particles ──────────────────────────────────────────────────────────────
  function burst(x,y,color,n=6){
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2, s=40+Math.random()*80;
      particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:2+Math.random()*3,color,life:1,decay:1.5+Math.random()});
    }
  }
  function float(x,y,txt,color='#fff'){
    floaters.push({x,y,vy:-55,life:1,txt,color});
  }

  // ── Update ─────────────────────────────────────────────────────────────────
  function update(dt){
    gameTime += dt;
    surge = gameTime >= SURGE_AT && gameTime < SURGE_AT + SURGE_DUR;
    const interval = surge ? SPAWN_INTERVAL * 0.4 : SPAWN_INTERVAL;

    spawnT += dt;
    while(spawnT >= interval){ spawnT -= interval; spawnPacket(); }

    // Recalculate load: count live (non-dropped) packets on each pipe segment
    pipes.forEach(p => p.load = 0);
    packets.forEach(pk => {
      if(!pk.dropped && pk.seg < pk.route.length){
        pk.route[pk.seg].load++;
      }
    });

    // Move packets
    packets = packets.filter(pk => {
      if(pk.dropped){
        pk.dropLife -= dt * 2.5;
        pk.y -= 40 * dt;
        return pk.dropLife > 0;
      }

      const pipe = pk.route[pk.seg];
      if(!pipe) return false;

      // Drop if this pipe is congested (load exceeds cap)
      // Only drop ONE packet per pipe per frame to avoid cascade wipes
      if(pipe.load > pipe.cap){
        // Mark as dropped but only if this specific packet hasn't been
        // counted as "the excess" yet — use the load check itself
        pk.dropped = true;
        pk.dropLife = 1;
        dropped++;
        burst(pk.x, pk.y, '#ff4444', 4);
        float(pk.x, pk.y-20, '💔', '#ff6644');
        sfx.block();
        pipe.load = Math.max(0, pipe.load - 1); // remove from load immediately
        return true;
      }

      // Move toward target
      const dx = pk.tx - pk.x, dy = pk.ty - pk.y;
      const dist = Math.hypot(dx,dy);
      const step = PACKET_SPEED * dt;

      if(dist <= step){
        pk.x = pk.tx; pk.y = pk.ty;
        pk.seg++;

        if(pk.seg >= pk.route.length){
          // Arrived at pool end — now animate to pool circle
          const pos = poolPos(pk.poolId);
          pk.tx = pos.x; pk.ty = pos.y;
          pk.seg = pk.route.length; // sentinel: traveling to pool center
          return true;
        }

        // Advance to next pipe segment
        const nextPipe = pk.route[pk.seg];
        const ne = pipeEnds(nextPipe);
        pk.tx = ne.x2; pk.ty = ne.y2;
      } else {
        pk.x += (dx/dist)*step;
        pk.y += (dy/dist)*step;
      }

      // Check if we've reached the pool center (sentinel seg)
      if(pk.seg === pk.route.length){
        const pos = poolPos(pk.poolId);
        if(Math.hypot(pk.x-pos.x, pk.y-pos.y) <= step+2){
          poolFill[pk.poolId] = Math.min(NEED_PER_POOL, poolFill[pk.poolId]+1);
          delivered++;
          const col = POOLS.find(p=>p.id===pk.poolId).color;
          burst(pos.x, pos.y, col, 5);
          if(poolFill[pk.poolId] === NEED_PER_POOL){
            float(pos.x, pos.y-44, '✅ FULL!', col);
            sfx.win();
          } else {
            sfx.pop();
          }
          return false;
        }
      }

      return true;
    });

    // Upgrade flash decay
    pipes.forEach(p => { if(p.upgFlash>0) p.upgFlash -= dt*3; });

    particles = particles.filter(p => {
      p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=120*dt; p.life-=p.decay*dt; return p.life>0;
    });
    floaters = floaters.filter(f => {
      f.y+=f.vy*dt; f.life-=1.2*dt; return f.life>0;
    });

    if(gameTime >= TOTAL_TIME && !ended) endGame();

    // Check win early
    if(!ended && POOLS.every(p => poolFill[p.id] >= NEED_PER_POOL)) endGame();
  }

  // ── Draw ───────────────────────────────────────────────────────────────────
  function draw(){
    const ctx = getCtx();
    const w=W(), h=H();

    ctx.fillStyle='#001828'; ctx.fillRect(0,0,w,h);

    // Subtle grid
    ctx.strokeStyle='rgba(0,80,140,0.15)'; ctx.lineWidth=1;
    for(let x=0;x<w;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=0;y<h;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}

    // ── Pipes ────────────────────────────────────────────────────────────────
    pipes.forEach(pipe => {
      const {x1,y1,x2,y2} = pipeEnds(pipe);
      const cong = pipe.load > pipe.cap;
      const laneW = 5 + (pipe.cap-1)*4;

      // pipe shadow
      ctx.save();
      ctx.lineCap='round';
      ctx.strokeStyle='rgba(0,0,0,0.5)';
      ctx.lineWidth=laneW+8;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();

      // lanes — each lane drawn as a parallel line
      const len=Math.hypot(x2-x1,y2-y1)||1;
      const nx=-(y2-y1)/len, ny=(x2-x1)/len; // perpendicular unit vector
      for(let lane=0; lane<pipe.cap; lane++){
        const offset=(lane-(pipe.cap-1)/2)*4;
        const ox=nx*offset, oy=ny*offset;
        const active = lane < pipe.load;
        ctx.strokeStyle = cong
          ? `rgba(255,${80+lane*25},30,0.9)`
          : active ? '#00ccff' : 'rgba(0,100,160,0.4)';
        ctx.lineWidth=3.5;
        ctx.beginPath();
        ctx.moveTo(x1+ox,y1+oy); ctx.lineTo(x2+ox,y2+oy); ctx.stroke();
      }

      // upgrade flash
      if(pipe.upgFlash>0){
        ctx.strokeStyle=`rgba(255,255,80,${pipe.upgFlash})`;
        ctx.lineWidth=laneW+4;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      }

      // congestion glow pulse
      if(cong){
        const pulse=0.4+0.4*Math.sin(gameTime*14);
        ctx.strokeStyle=`rgba(255,40,20,${pulse*0.5})`;
        ctx.lineWidth=laneW+12;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      }
      ctx.restore();

      // load/cap label — offset perpendicular so it doesn't overlap pipe
      const mx=(x1+x2)/2, my=(y1+y2)/2;
      const labelOff=18;
      const lx=mx+nx*labelOff, ly=my+ny*labelOff;

      ctx.save();
      ctx.font='bold 11px monospace';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      // pill background
      ctx.fillStyle=cong?'rgba(180,30,10,0.75)':'rgba(0,40,70,0.75)';
      ctx.beginPath(); ctx.roundRect(lx-20,ly-9,40,18,5); ctx.fill();
      ctx.fillStyle=cong?'#ff8866':'#44ccff';
      ctx.fillText(`${pipe.load}/${pipe.cap}`, lx, ly);
      if(cong && pipe.cap < MAX_CAP){
        ctx.font='9px monospace'; ctx.fillStyle='#ffcc44';
        ctx.fillText('TAP!', lx, ly+13);
      }
      ctx.restore();
    });

    // ── Packets ──────────────────────────────────────────────────────────────
    packets.forEach(pk => {
      if(pk.dropped){
        ctx.save();
        ctx.globalAlpha=Math.max(0,pk.dropLife);
        ctx.font='16px serif';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText('💔',pk.x,pk.y);
        ctx.restore();
        return;
      }
      const col = POOLS.find(p=>p.id===pk.poolId)?.color || '#44ccff';
      ctx.save();
      ctx.fillStyle=col; ctx.shadowColor=col; ctx.shadowBlur=10;
      ctx.beginPath(); ctx.roundRect(pk.x-6,pk.y-6,12,12,3); ctx.fill();
      ctx.restore();
    });

    // ── SOURCE node ──────────────────────────────────────────────────────────
    const sx=wx(0.10), sy=wy(0.50);
    // pulsing ring
    const pulse=0.3+0.3*Math.sin(gameTime*4);
    ctx.save();
    ctx.strokeStyle=`rgba(68,204,255,${pulse})`; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(sx,sy,32,0,Math.PI*2); ctx.stroke();
    ctx.restore();
    ctx.beginPath(); ctx.arc(sx,sy,24,0,Math.PI*2);
    ctx.fillStyle='#002244'; ctx.fill();
    ctx.strokeStyle='#44ccff'; ctx.lineWidth=2.5; ctx.stroke();
    ctx.font='20px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('💻',sx,sy);
    ctx.font='bold 9px monospace'; ctx.fillStyle='#44ccff';
    ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillText('SERVER',sx,sy+27);

    // ── Junction nodes ────────────────────────────────────────────────────────
    [[0.38,0.22],[0.38,0.78]].forEach(([fx,fy])=>{
      const jx=wx(fx),jy=wy(fy);
      ctx.beginPath(); ctx.arc(jx,jy,10,0,Math.PI*2);
      ctx.fillStyle='#003355'; ctx.fill();
      ctx.strokeStyle='#44ccff99'; ctx.lineWidth=2; ctx.stroke();
    });

    // ── Pools ─────────────────────────────────────────────────────────────────
    POOLS.forEach(pool=>{
      const px=wx(pool.fx), py=wy(pool.fy);
      const fill=poolFill[pool.id]/NEED_PER_POOL;
      const full=fill>=1;
      const r=26;

      if(full){
        ctx.save(); ctx.shadowColor=pool.color; ctx.shadowBlur=22;
        ctx.beginPath(); ctx.arc(px,py,r+5,0,Math.PI*2);
        ctx.strokeStyle=pool.color; ctx.lineWidth=2.5; ctx.stroke(); ctx.restore();
      }

      // fill wedge
      ctx.beginPath(); ctx.moveTo(px,py);
      ctx.arc(px,py,r,-Math.PI/2,-Math.PI/2+fill*Math.PI*2);
      ctx.closePath(); ctx.fillStyle=pool.color+'44'; ctx.fill();

      // circle border
      ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2);
      ctx.fillStyle='#001828'; ctx.fill();
      ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2);
      ctx.fillStyle=pool.color+'22'; ctx.fill();
      ctx.strokeStyle=full?pool.color:pool.color+'77';
      ctx.lineWidth=full?3:2; ctx.stroke();

      // emoji
      ctx.font='20px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(pool.emoji,px,py);

      // name
      ctx.font='bold 9px monospace'; ctx.fillStyle=pool.color;
      ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillText(pool.name,px,py+r+5);

      // fill bar
      const bw=48,bh=6,bx=px-bw/2,by=py+r+17;
      ctx.fillStyle='#002244'; ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,3); ctx.fill();
      ctx.fillStyle=full?pool.color:pool.color+'cc';
      ctx.beginPath(); ctx.roundRect(bx,by,bw*fill,bh,3); ctx.fill();
      ctx.font='bold 8px monospace'; ctx.fillStyle='#fff';
      ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillText(`${poolFill[pool.id]}/${NEED_PER_POOL}`,px,by+bh+3);
    });

    // ── Particles / floaters ─────────────────────────────────────────────────
    particles.forEach(p=>{
      ctx.save(); ctx.globalAlpha=Math.max(0,p.life);
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.color; ctx.fill(); ctx.restore();
    });
    floaters.forEach(f=>{
      ctx.save(); ctx.globalAlpha=Math.max(0,f.life);
      ctx.font='bold 12px monospace'; ctx.fillStyle=f.color;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(f.txt,f.x,f.y); ctx.restore();
    });

    // ── HUD update ────────────────────────────────────────────────────────────
    const rem=Math.max(0,Math.ceil(TOTAL_TIME-gameTime));
    const filled=POOLS.filter(p=>poolFill[p.id]>=NEED_PER_POOL).length;
    hud.setCenter(surge
      ? `<span style="color:#ff6644;font-weight:700">⚡ SURGE! ⚡</span> &nbsp; ⏱ ${rem}s`
      : `⏱ ${rem}s`);
    hud.setRight(`✅ ${filled}/4 &nbsp; 💔 ${dropped}`);
  }

  // ── Tap / click — upgrade pipe ────────────────────────────────────────────
  function onTap(e){
    if(ended) return;
    const {x:cx,y:cy}=canvasXY(e);
    for(const pipe of pipes){
      const {x1,y1,x2,y2}=pipeEnds(pipe);
      if(distToSeg(cx,cy,x1,y1,x2,y2) < HIT_DIST){
        if(pipe.cap < MAX_CAP){
          pipe.cap++;
          pipe.upgFlash=1;
          const mx=(x1+x2)/2, my=(y1+y2)/2;
          burst(mx,my,'#ffff44',5);
          float(mx,my-24,`+1 lane → ${pipe.cap}×`, '#ffcc44');
          sfx.coin();
        } else {
          float(cx,cy-20,'MAX!','#ff6644');
          sfx.block();
        }
        return;
      }
    }
  }
  canvas.addEventListener('click', onTap);
  canvas.addEventListener('touchend', e=>{ e.preventDefault(); onTap(e); }, {passive:false});

  // ── End ───────────────────────────────────────────────────────────────────
  function endGame(){
    if(ended) return;
    ended=true;
    cancelAnimationFrame(rafId);
    const filled=POOLS.filter(p=>poolFill[p.id]>=NEED_PER_POOL).length;
    const stars=filled>=4?3:filled>=2?2:filled>=1?1:0;
    const coins=[0,25,50,80][stars];
    stars>=2?sfx.win():sfx.fail();
    showStarResult(root,{
      stars, color:'#44ccff',
      title:['All Dropped 😢','Partial Flow 🌊','Good Bandwidth! 💧','Network Master! 🏆'][stars],
      lines:[
        `Pools filled: ${filled}/4`,
        `Delivered: ${delivered}   Dropped: ${dropped}`,
        '─────────────────────────',
        '💡 Bandwidth = lanes on a highway.',
        'More lanes = more packets at once = no drops.',
        '📡 Real ISPs upgrade links exactly this way!',
      ],
      coins,
      onContinue: () => { cleanup(); onComplete(stars,coins); },
    });
  }

  // ── Loop ──────────────────────────────────────────────────────────────────
  function loop(now){
    if(ended) return;
    if(lastNow===null) lastNow=now;
    const dt=Math.min((now-lastNow)/1000, 0.05);
    lastNow=now;
    update(dt);
    draw();
    rafId=requestAnimationFrame(loop);
  }

  function cleanup(){
    cancelAnimationFrame(rafId);
    canvas.removeEventListener('click', onTap);
    destroy();
  }

  // ── Lesson + Intro ────────────────────────────────────────────────────────
  showLessonBanner(root,{
    concept: 'Bandwidth = Lanes',
    detail: 'More lanes on a pipe = more packets at once. Tap congested pipes to upgrade!',
    color: '#44ccff',
  });

  showIntro(root,{
    emoji: '💧',
    title: t('m2.title'),
    concept: t('m2.concept'),
    howto: t('m2.howto'),
    color: '#44ccff',
    onStart: () => { rafId = requestAnimationFrame(loop); },
  });
}
