import { makeGameShell, makeHUD, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';
import { t } from '../../shared/i18n.js';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 2 — BANDWIDTH BUILDER  (exciting rewrite)
// Concept: Bandwidth = lanes on a highway.
// Visual upgrade: animated water waves in pools, splash particles,
// pipe heat-glow on congestion, 3 surge events, fireworks on full pools.
// ─────────────────────────────────────────────────────────────────────────────

const POOLS = [
  { id:'A', emoji:'🏖️', name:'Beach',  fx:0.82, fy:0.14, color:'#ffcc44', phase:0   },
  { id:'B', emoji:'🏊', name:'Pool',   fx:0.82, fy:0.38, color:'#44aaff', phase:0.8 },
  { id:'C', emoji:'🎢', name:'Slides', fx:0.82, fy:0.62, color:'#ff6644', phase:1.6 },
  { id:'D', emoji:'🌊', name:'Waves',  fx:0.82, fy:0.86, color:'#44ffcc', phase:2.4 },
];

const PIPE_DEFS = [
  { id:'p0', fx1:0.10,fy1:0.50, fx2:0.38,fy2:0.22, toPool:null },
  { id:'p1', fx1:0.10,fy1:0.50, fx2:0.38,fy2:0.78, toPool:null },
  { id:'p2', fx1:0.38,fy1:0.22, fx2:0.72,fy2:0.14, toPool:'A' },
  { id:'p3', fx1:0.38,fy1:0.22, fx2:0.72,fy2:0.38, toPool:'B' },
  { id:'p4', fx1:0.38,fy1:0.78, fx2:0.72,fy2:0.62, toPool:'C' },
  { id:'p5', fx1:0.38,fy1:0.78, fx2:0.72,fy2:0.86, toPool:'D' },
];

const ROUTES  = { A:['p0','p2'], B:['p0','p3'], C:['p1','p4'], D:['p1','p5'] };
const NEED_PER_POOL = 12;
const SPAWN_INTERVAL = 0.7;
const TOTAL_TIME     = 90;
const MAX_CAP        = 5;
const PACKET_SPEED   = 220;
const HIT_DIST       = 26;

const SURGES = [
  { at:20, dur:10, label:'⚡ SUMMER RUSH!',  color:'#ff9944' },
  { at:48, dur:12, label:'🎉 PARTY WAVE!',   color:'#ff44aa' },
  { at:72, dur:10, label:'🔥 FINAL SURGE!',  color:'#ff4444' },
];

export function launch(app, state, onComplete) {
  const shell = makeGameShell(app, { bgColor: '#001428' });
  const { root, canvas, ctx: getCtx, W, H, destroy, canvasXY } = shell;
  const hud = makeHUD(root, { color: '#44ccff' });

  const backBtn = document.createElement('button');
  backBtn.style.cssText = `position:absolute;top:8px;left:16px;z-index:70;
    background:rgba(0,0,0,0.5);border:1px solid #44ccff66;border-radius:10px;
    color:#44ccff;font-size:13px;font-weight:700;cursor:pointer;
    padding:6px 12px;font-family:inherit;`;
  backBtn.textContent = t('btn.back');
  backBtn.addEventListener('click', () => { cleanup(); onComplete(0,0); });
  root.appendChild(backBtn);

  let pipes      = PIPE_DEFS.map(d => ({ ...d, cap:d.toPool===null?2:1, load:0, upgFlash:0, heat:0 }));
  let packets    = [];
  let particles  = [];
  let splashes   = [];
  let floaters   = [];
  let poolFill   = { A:0, B:0, C:0, D:0 };
  let dropped    = 0, delivered = 0;
  let spawnT     = 0, gameTime  = 0;
  let surge      = null;
  let ended      = false;
  let lastNow    = null, rafId  = null;
  let nextPoolIdx = 0;
  let congestionTutShown = false; // first-congestion tutorial flag

  const wx = fx => fx * W();
  const wy = fy => fy * H();
  const pipeEnds = p => ({ x1:wx(p.fx1),y1:wy(p.fy1),x2:wx(p.fx2),y2:wy(p.fy2) });
  const poolPos  = id => { const p=POOLS.find(p=>p.id===id); return {x:wx(p.fx),y:wy(p.fy)}; };
  const pipeById = id => pipes.find(p=>p.id===id);
  function distToSeg(px,py,ax,ay,bx,by){
    const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy;
    if(!l2) return Math.hypot(px-ax,py-ay);
    const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/l2));
    return Math.hypot(px-(ax+t*dx),py-(ay+t*dy));
  }
  function pickPool(){
    const u=POOLS.filter(p=>poolFill[p.id]<NEED_PER_POOL);
    if(!u.length) return null;
    const p=u[nextPoolIdx%u.length]; nextPoolIdx++; return p.id;
  }

  function burst(x,y,color,n=6){
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2,s=50+Math.random()*80;
      particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-30,r:2+Math.random()*3,color,life:1,decay:1.8+Math.random()});
    }
  }
  function doSplash(x,y,color){
    for(let i=0;i<8;i++){
      const a=(i/8)*Math.PI*2;
      splashes.push({x,y,vx:Math.cos(a)*30,vy:Math.sin(a)*30-20,r:4,color,life:1,decay:2.5,ring:false});
    }
    splashes.push({x,y,r:0,color,life:1,decay:1.6,ring:true});
  }
  function float(x,y,txt,color='#fff'){
    floaters.push({x,y,vy:-55,life:1,txt,color});
  }
  function fireworks(x,y,color){
    for(let i=0;i<22;i++){
      const a=Math.random()*Math.PI*2,s=90+Math.random()*130;
      particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:3+Math.random()*4,color,life:1,decay:1.1});
    }
  }

  function spawnPacket(){
    const poolId=pickPool(); if(!poolId) return;
    const route=ROUTES[poolId].map(id=>pipeById(id));
    const e=pipeEnds(route[0]);
    packets.push({poolId,route,seg:0,x:e.x1,y:e.y1,tx:e.x2,ty:e.y2,dropped:false,dropLife:0});
  }

  function update(dt){
    gameTime+=dt;
    surge=SURGES.find(s=>gameTime>=s.at&&gameTime<s.at+s.dur)||null;
    const interval=surge?SPAWN_INTERVAL*0.35:SPAWN_INTERVAL;
    spawnT+=dt;
    while(spawnT>=interval){ spawnT-=interval; spawnPacket(); }

    pipes.forEach(p=>p.load=0);
    packets.forEach(pk=>{ if(!pk.dropped&&pk.seg<pk.route.length) pk.route[pk.seg].load++; });
    pipes.forEach(p=>{
      if(p.load>p.cap) p.heat=Math.min(1,p.heat+dt*4);
      else p.heat=Math.max(0,p.heat-dt*2);
      if(p.upgFlash>0) p.upgFlash-=dt*3;
    });

    // First-congestion tutorial: show hint when a pipe first overloads
    if(!congestionTutShown && pipes.some(p=>p.load>p.cap)){
      congestionTutShown=true;
      const hotPipe=pipes.find(p=>p.load>p.cap);
      const {x1,y1,x2,y2}=pipeEnds(hotPipe);
      float((x1+x2)/2,(y1+y2)/2-55,'👆 TAP RED PIPE to add a lane!','#ffd700');
    }

    packets=packets.filter(pk=>{
      if(pk.dropped){ pk.dropLife-=dt*2.5; pk.y-=40*dt; return pk.dropLife>0; }
      const step=PACKET_SPEED*dt;
      if(pk.seg>=pk.route.length){
        const pos=poolPos(pk.poolId);
        const dx=pk.tx-pk.x,dy=pk.ty-pk.y,dist=Math.hypot(dx,dy);
        if(dist<=step+2){
          poolFill[pk.poolId]=Math.min(NEED_PER_POOL,poolFill[pk.poolId]+1);
          delivered++;
          const col=POOLS.find(p=>p.id===pk.poolId).color;
          doSplash(pos.x,pos.y,col);
          if(poolFill[pk.poolId]===NEED_PER_POOL){ float(pos.x,pos.y-52,'🎉 FULL!',col); fireworks(pos.x,pos.y,col); sfx.win(); }
          else sfx.pop();
          return false;
        }
        pk.x+=(dx/dist)*step; pk.y+=(dy/dist)*step; return true;
      }
      const pipe=pk.route[pk.seg]; if(!pipe) return false;
      if(pipe.load>pipe.cap){
        pk.dropped=true; pk.dropLife=1; dropped++;
        burst(pk.x,pk.y,'#ff4444',4);
        float(pk.x,pk.y-20,'💔','#ff6644');
        sfx.block();
        pipe.load=Math.max(0,pipe.load-1);
        return true;
      }
      const dx=pk.tx-pk.x,dy=pk.ty-pk.y,dist=Math.hypot(dx,dy);
      if(dist<=step){
        pk.x=pk.tx; pk.y=pk.ty; pk.seg++;
        if(pk.seg>=pk.route.length){ const pos=poolPos(pk.poolId); pk.tx=pos.x; pk.ty=pos.y; }
        else { const ne=pipeEnds(pk.route[pk.seg]); pk.tx=ne.x2; pk.ty=ne.y2; }
      } else { pk.x+=(dx/dist)*step; pk.y+=(dy/dist)*step; }
      return true;
    });

    particles=particles.filter(p=>{ p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=160*dt; p.life-=p.decay*dt; return p.life>0; });
    splashes=splashes.filter(s=>{
      if(s.ring){ s.r+=65*dt; s.life-=s.decay*dt; return s.life>0; }
      s.x+=s.vx*dt; s.y+=s.vy*dt; s.vy+=120*dt; s.life-=s.decay*dt; return s.life>0;
    });
    floaters=floaters.filter(f=>{ f.y+=f.vy*dt; f.life-=1.2*dt; return f.life>0; });

    if(gameTime>=TOTAL_TIME&&!ended) endGame();
    if(!ended&&POOLS.every(p=>poolFill[p.id]>=NEED_PER_POOL)) endGame();
  }

  function draw(){
    const ctx=getCtx(),w=W(),h=H();

    // Background sky gradient
    const sky=ctx.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,surge?'#1a0828':'#001428');
    sky.addColorStop(1,surge?'#0a1828':'#001e3c');
    ctx.fillStyle=sky; ctx.fillRect(0,0,w,h);

    // Water shimmer at bottom
    for(let i=0;i<3;i++){
      const y=h*0.62+Math.sin(gameTime*0.5+i)*6;
      const g=ctx.createLinearGradient(0,y,0,h);
      g.addColorStop(0,'rgba(0,80,160,0.06)'); g.addColorStop(1,'rgba(0,40,100,0.1)');
      ctx.fillStyle=g; ctx.fillRect(0,y,w,h);
    }

    // Grid
    ctx.strokeStyle='rgba(0,80,140,0.1)'; ctx.lineWidth=1;
    for(let x=0;x<w;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=0;y<h;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}

    // Surge flash overlay
    if(surge){
      ctx.save();
      ctx.fillStyle=`rgba(255,60,0,${0.05+0.04*Math.sin(gameTime*8)})`;
      ctx.fillRect(0,0,w,h);
      ctx.restore();
    }

    // ── Pipes ───────────────────────────────────────────────────────────────
    pipes.forEach(pipe=>{
      const {x1,y1,x2,y2}=pipeEnds(pipe);
      const cong=pipe.load>pipe.cap;
      const laneW=5+(pipe.cap-1)*4;
      ctx.save(); ctx.lineCap='round';
      ctx.strokeStyle='rgba(0,0,0,0.6)'; ctx.lineWidth=laneW+10;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      const len=Math.hypot(x2-x1,y2-y1)||1;
      const nx=-(y2-y1)/len,ny=(x2-x1)/len;
      for(let lane=0;lane<pipe.cap;lane++){
        const off=(lane-(pipe.cap-1)/2)*4;
        const ox=nx*off,oy=ny*off;
        ctx.strokeStyle=cong?`rgba(255,${60+lane*30},20,0.95)`:lane<pipe.load?'#00ccff':'rgba(0,100,160,0.35)';
        ctx.lineWidth=3.5;
        ctx.beginPath(); ctx.moveTo(x1+ox,y1+oy); ctx.lineTo(x2+ox,y2+oy); ctx.stroke();
      }
      if(pipe.heat>0){
        const hp=pipe.heat*(0.4+0.3*Math.sin(gameTime*16));
        ctx.strokeStyle=`rgba(255,50,0,${hp*0.65})`;
        ctx.lineWidth=laneW+18; ctx.shadowColor='#ff3300'; ctx.shadowBlur=24;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        ctx.shadowBlur=0;
      }
      if(pipe.upgFlash>0){
        ctx.strokeStyle=`rgba(255,255,80,${pipe.upgFlash})`;
        ctx.lineWidth=laneW+8;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      }
      ctx.restore();
      // Label
      const mx=(x1+x2)/2,my=(y1+y2)/2,lx=mx+nx*16,ly=my+ny*16;
      ctx.save(); ctx.font='bold 11px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillStyle=cong?'rgba(180,30,10,0.9)':'rgba(0,40,80,0.85)';
      ctx.beginPath(); ctx.roundRect(lx-22,ly-9,44,18,5); ctx.fill();
      ctx.fillStyle=cong?'#ff8866':'#44ccff';
      ctx.fillText(`${pipe.load}/${pipe.cap}`,lx,ly);
      if(cong&&pipe.cap<MAX_CAP){ ctx.font='bold 9px monospace'; ctx.fillStyle='#ffdd44'; ctx.fillText('TAP!',lx,ly+14); }
      ctx.restore();
    });

    // ── Splashes ──────────────────────────────────────────────────────────
    splashes.forEach(s=>{
      ctx.save(); ctx.globalAlpha=Math.max(0,s.life*0.8);
      if(s.ring){ ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.strokeStyle=s.color; ctx.lineWidth=2.5; ctx.stroke(); }
      else { ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fillStyle=s.color; ctx.fill(); }
      ctx.restore();
    });

    // ── Packets ───────────────────────────────────────────────────────────
    packets.forEach(pk=>{
      if(pk.dropped){
        ctx.save(); ctx.globalAlpha=Math.max(0,pk.dropLife);
        ctx.font='16px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText('💔',pk.x,pk.y); ctx.restore(); return;
      }
      const col=POOLS.find(p=>p.id===pk.poolId)?.color||'#44ccff';
      ctx.save();
      ctx.fillStyle=col; ctx.shadowColor=col; ctx.shadowBlur=16;
      ctx.beginPath(); ctx.arc(pk.x,pk.y,7,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;
      ctx.fillStyle='rgba(255,255,255,0.45)';
      ctx.beginPath(); ctx.arc(pk.x-2,pk.y-2,2.5,0,Math.PI*2); ctx.fill();
      ctx.restore();
    });

    // ── SERVER ────────────────────────────────────────────────────────────
    const sx=wx(0.10),sy=wy(0.50);
    const pulse=0.3+0.3*Math.sin(gameTime*4);
    ctx.save(); ctx.strokeStyle=`rgba(68,204,255,${pulse})`; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(sx,sy,34,0,Math.PI*2); ctx.stroke(); ctx.restore();
    ctx.beginPath(); ctx.arc(sx,sy,24,0,Math.PI*2);
    ctx.fillStyle='#002244'; ctx.fill(); ctx.strokeStyle='#44ccff'; ctx.lineWidth=2.5; ctx.stroke();
    ctx.font='20px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('💻',sx,sy);
    ctx.font='bold 9px monospace'; ctx.fillStyle='#44ccff'; ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillText('SERVER',sx,sy+27);

    // ── Junction nodes ────────────────────────────────────────────────────
    [[0.38,0.22],[0.38,0.78]].forEach(([fx,fy])=>{
      const jx=wx(fx),jy=wy(fy);
      ctx.beginPath(); ctx.arc(jx,jy,12,0,Math.PI*2);
      ctx.fillStyle='#003355'; ctx.fill(); ctx.strokeStyle='#44ccff88'; ctx.lineWidth=2; ctx.stroke();
      ctx.beginPath(); ctx.arc(jx,jy,6,0,Math.PI*2);
      ctx.fillStyle='#44ccff33'; ctx.fill();
    });

    // ── Pools ─────────────────────────────────────────────────────────────
    POOLS.forEach(pool=>{
      const px=wx(pool.fx),py=wy(pool.fy);
      const fill=poolFill[pool.id]/NEED_PER_POOL;
      const full=fill>=1;
      const r=28;

      if(full){
        ctx.save(); ctx.shadowColor=pool.color; ctx.shadowBlur=30;
        ctx.beginPath(); ctx.arc(px,py,r+9,0,Math.PI*2);
        ctx.strokeStyle=pool.color; ctx.lineWidth=3; ctx.stroke(); ctx.restore();
      }

      // Animated water fill
      if(fill>0){
        ctx.save(); ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2); ctx.clip();
        const waterY=py+r-fill*r*2;
        ctx.beginPath(); ctx.moveTo(px-r,waterY);
        for(let xi=-r;xi<=r;xi+=2){
          ctx.lineTo(px+xi, waterY+Math.sin((xi*0.14)+gameTime*2+pool.phase)*4.5*(0.3+fill*0.7));
        }
        ctx.lineTo(px+r,py+r+4); ctx.lineTo(px-r,py+r+4); ctx.closePath();
        ctx.fillStyle=full?pool.color:pool.color+'bb'; ctx.fill();
        ctx.restore();
      }

      ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2);
      ctx.strokeStyle=full?pool.color:pool.color+'77';
      ctx.lineWidth=full?3:2; ctx.stroke();

      // Emoji floats on water
      ctx.font='20px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(pool.emoji,px,full?py-r*0.3:py);

      ctx.font='bold 9px monospace'; ctx.fillStyle=pool.color;
      ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillText(pool.name,px,py+r+5);
      ctx.font='bold 8px monospace'; ctx.fillStyle='#fff';
      ctx.fillText(`${poolFill[pool.id]}/${NEED_PER_POOL}`,px,py+r+17);
    });

    // ── Particles / floaters ─────────────────────────────────────────────
    particles.forEach(p=>{
      ctx.save(); ctx.globalAlpha=Math.max(0,p.life);
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.color; ctx.fill(); ctx.restore();
    });
    floaters.forEach(f=>{
      ctx.save(); ctx.globalAlpha=Math.max(0,f.life);
      ctx.font='bold 13px monospace'; ctx.fillStyle=f.color;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(f.txt,f.x,f.y); ctx.restore();
    });

    const rem=Math.max(0,Math.ceil(TOTAL_TIME-gameTime));
    const filled=POOLS.filter(p=>poolFill[p.id]>=NEED_PER_POOL).length;
    if(surge){
      hud.setCenter(`<span style="color:${surge.color};font-weight:900">${surge.label}</span> &nbsp; ⏱ ${rem}s`);
    } else {
      hud.setCenter(`⏱ ${rem}s`);
    }
    hud.setRight(`🏊 ${filled}/4 &nbsp; 💔 ${dropped}`);
  }

  function onTap(e){
    if(ended) return;
    const {x:cx,y:cy}=canvasXY(e);
    for(const pipe of pipes){
      const {x1,y1,x2,y2}=pipeEnds(pipe);
      if(distToSeg(cx,cy,x1,y1,x2,y2)<HIT_DIST){
        if(pipe.cap<MAX_CAP){
          pipe.cap++; pipe.upgFlash=1;
          const mx=(x1+x2)/2,my=(y1+y2)/2;
          burst(mx,my,'#ffff44',6); float(mx,my-30,`+1 LANE → ${pipe.cap}×`,'#ffcc44'); sfx.coin();
        } else { float(cx,cy-20,'MAX!','#ff6644'); sfx.block(); }
        return;
      }
    }
  }
  canvas.addEventListener('click',onTap);
  canvas.addEventListener('touchend',e=>{e.preventDefault();onTap(e);},{passive:false});

  function endGame(){
    if(ended) return;
    ended=true; cancelAnimationFrame(rafId);
    const filled=POOLS.filter(p=>poolFill[p.id]>=NEED_PER_POOL).length;
    const stars=filled>=4?3:filled>=2?2:filled>=1?1:0;
    const coins=[0,25,50,80][stars];
    stars>=2?sfx.win():sfx.fail();
    showStarResult(root,{
      stars,color:'#44ccff',
      title:['Dry Pools 😢','Partial Flow 🌊','Good Flow! 💧','Water Master! 🏆'][stars],
      lines:[
        `Pools filled: ${filled}/4`,
        `Delivered: ${delivered}   Dropped: ${dropped}`,
        '─────────────────────────',
        '💡 Bandwidth = lanes on a highway.',
        'More lanes = more packets = no drops.',
        '📡 Real ISPs upgrade links exactly this way!',
      ],
      coins,
      onContinue:(action)=>{ cleanup(); if(action!=='retry') onComplete(stars,coins); else launch(app,state,onComplete); },
    });
  }

  function loop(now){
    if(ended) return;
    if(lastNow===null) lastNow=now;
    const dt=Math.min((now-lastNow)/1000,0.05);
    lastNow=now;
    update(dt); draw();
    rafId=requestAnimationFrame(loop);
  }

  function cleanup(){
    cancelAnimationFrame(rafId);
    canvas.removeEventListener('click',onTap);
    destroy();
  }

  showLessonBanner(root,{ concept:t('m2.title'), detail:t('m2.banner'), color:'#44ccff' });
  showIntro(root,{
    emoji:'💧', title:t('m2.title'), concept:t('m2.concept'), howto:t('m2.howto'), color:'#44ccff',
    onStart:()=>{ rafId=requestAnimationFrame(loop); },
  });
}
