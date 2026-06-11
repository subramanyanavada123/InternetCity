import { makeGameShell, makeHUD, coinBurst, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';
import { t } from '../../shared/i18n.js';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 1 — DELIVERY KINGDOM  (3 rounds)
//
// Round 1 "Connect the City"   — drag roads, live latency shown on each edge,
//                                score by total latency budget used
// Round 2 "Road Tax"           — budget per road, must use ≤ N-1 edges (MST)
//                                wow: "MINIMUM SPANNING TREE!" flash
// Round 3 "Earthquake!"        — random roads sever; packets reroute live;
//                                redundant roads save isolated nodes
// ─────────────────────────────────────────────────────────────────────────────

const BUILDING_DEFS = [
  { label: 'Palace',  icon: '🏰', color: '#ffd700', isPalace: true },
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
  const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 3;
  return { x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp-2, life:1,
    decay: 0.025+Math.random()*0.015, r: 3+Math.random()*4, color };
}
function makeConfetti(W, color) {
  return { x:Math.random()*W, y:-10, vx:(Math.random()-0.5)*3, vy:2+Math.random()*3,
    life:1, decay:0.006, r:4+Math.random()*5, color,
    rot:Math.random()*Math.PI*2, rotV:(Math.random()-0.5)*0.2 };
}

// ── BFS ───────────────────────────────────────────────────────────────────────
function bfsReachable(buildings, roads) {
  const pal = buildings.findIndex(b => b.isPalace);
  const vis = new Set([pal]), q = [pal];
  while (q.length) {
    const cur = q.shift();
    for (const r of roads) {
      if (r.severed) continue;
      const other = r.a === cur ? r.b : r.b === cur ? r.a : -1;
      if (other >= 0 && !vis.has(other)) { vis.add(other); q.push(other); }
    }
  }
  return vis;
}

// Kruskal MST cost (sum of edge weights for minimum connected spanning tree)
function mstCost(buildings, n) {
  const edges = [];
  for (let i = 0; i < n; i++)
    for (let j = i+1; j < n; j++)
      edges.push({ a:i, b:j, w: Math.hypot(buildings[i].x-buildings[j].x, buildings[i].y-buildings[j].y) });
  edges.sort((a,b)=>a.w-b.w);
  const par = Array.from({length:n},(_,i)=>i);
  function find(x){return par[x]===x?x:par[x]=find(par[x]);}
  let cost=0;
  for(const e of edges){
    const pa=find(e.a),pb=find(e.b);
    if(pa!==pb){par[pa]=pb;cost+=e.w;}
  }
  return cost;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function launch(app, state, onComplete) {
  const shell = makeGameShell(app, { bgColor: '#0d1a00' });
  const { root, canvas, ctx, W, H, destroy, canvasXY } = shell;
  const hud = makeHUD(root, { color: '#ffd700' });

  const backBtn = document.createElement('button');
  backBtn.style.cssText = `position:absolute;top:8px;left:16px;z-index:70;
    background:rgba(0,0,0,0.5);border:1px solid #ffd70066;border-radius:10px;
    color:#ffd700;font-size:13px;font-weight:700;cursor:pointer;
    padding:6px 12px;font-family:inherit;pointer-events:auto;`;
  backBtn.textContent = '← Missions';
  backBtn.addEventListener('click', () => { cleanup(); onComplete(0,0); });
  root.appendChild(backBtn);

  // ── Shared state ──────────────────────────────────────────────────────────
  let buildings=[], roads=[], particles=[], confetti=[];
  let reachable=new Set(), dragFrom=null, dragPos=null, raf=null;
  let bounceSet=new Set(), flashMsgs=[];
  let round=1, totalCoins=0, roundDone=false;

  // round-specific
  let r2Budget=0, r2Spent=0;
  let r3Quakes=[], r3Packets=[], r3QTimer=0, r3EndTimer=0, r3Started=false;

  function buildingRadius() { return Math.min(W(),H()) * 0.048; }
  function diagonal() { return Math.hypot(W(),H()); }

  function initBuildings(count) {
    const w=W(), h=H(), pad=80, cx=w/2, cy=h/2;
    buildings=[];
    buildings.push({...BUILDING_DEFS[0], x:cx, y:cy, connected:true });
    const others = BUILDING_DEFS.slice(1, count);
    const minDist = buildingRadius()*3.2;
    for(let i=0;i<others.length;i++){
      let x,y,tries=0;
      do {
        const angle=(i/others.length)*Math.PI*2+(Math.random()-0.5)*0.9;
        const dist=Math.min(w,h)*0.22+Math.random()*Math.min(w,h)*0.26;
        x=cx+Math.cos(angle)*dist; y=cy+Math.sin(angle)*dist;
        x=Math.max(pad,Math.min(w-pad,x)); y=Math.max(pad+48,Math.min(h-pad,y));
        tries++;
      } while(tries<50&&buildings.some(b=>Math.hypot(b.x-x,b.y-y)<minDist));
      buildings.push({...others[i], x, y, connected:false });
    }
    roads=[]; reachable=new Set([0]);
  }

  function roadLen(r){ const a=buildings[r.a],b=buildings[r.b]; return Math.hypot(b.x-a.x,b.y-a.y); }

  // latency in ms — 1px = ~0.5ms for drama
  function latencyMs(r){ return Math.round(roadLen(r)*0.5); }

  function totalLatency(){ return roads.filter(r=>!r.severed).reduce((s,r)=>s+latencyMs(r),0); }

  function flashMsg(text, color, x, y, big=false) {
    flashMsgs.push({ text, color, x, y, life:1.2, big });
  }

  // ── BFS-based reachability update ─────────────────────────────────────────
  function updateReachable() {
    const newR = bfsReachable(buildings, roads);
    for(const idx of newR) {
      if(!reachable.has(idx) && idx!==0) {
        buildings[idx].connected=true;
        bounceSet.add(idx); setTimeout(()=>bounceSet.delete(idx),700);
        totalCoins+=10; coinBurst(root,buildings[idx].x,buildings[idx].y,10); sfx.coin();
        for(let p=0;p<18;p++) particles.push(makeParticle(buildings[idx].x,buildings[idx].y,buildings[idx].color));
        // latency feedback
        const road = roads.find(r=>!r.severed&&((r.b===idx&&newR.has(r.a))||(r.a===idx&&newR.has(r.b))));
        if(road){
          const ms=latencyMs(road);
          const col=ms<80?'#44ff88':ms<160?'#ffdd44':'#ff6644';
          flashMsg(`${ms}ms`, col, (buildings[road.a].x+buildings[road.b].x)/2, (buildings[road.a].y+buildings[road.b].y)/2);
        }
      }
    }
    for(const idx of reachable){
      if(!newR.has(idx)&&idx!==0){ buildings[idx].connected=false; }
    }
    reachable=newR;
  }

  function allConnected(){ return reachable.size===buildings.length; }

  // ── ROUND 1 ───────────────────────────────────────────────────────────────
  function startRound1() {
    round=1; roundDone=false;
    initBuildings(10);
    hud.setLeft('Round 1/3 — Connect the City');
    hud.setRight('');
    updateHUD1();
  }

  function updateHUD1(){
    const conn=reachable.size-1, total=buildings.length-1;
    const lat=totalLatency();
    const diag=diagonal();
    const pct=Math.round(lat/(diag*3)*100);
    hud.setCenter(`🏙 ${conn}/${total} linked  ⏱ latency: ${lat}ms`);
    hud.setRight(`Budget: ${pct>80?'<span style="color:#ff6644">'+pct+'%</span>':pct+'%'}`);
  }

  function checkWin1() {
    if(!allConnected()||roundDone) return;
    roundDone=true;
    sfx.win();
    const diag=diagonal(), lat=totalLatency();
    const pct=lat/(diag*3);
    const stars=pct<0.45?3:pct<0.65?2:1;
    spawnConfetti();
    flashMsg('NETWORK CONNECTED! 🌐', '#ffd700', W()/2, H()/2, true);
    setTimeout(()=>{
      const mst=mstCost(buildings,buildings.length);
      const myTotal=roads.reduce((s,r)=>s+roadLen(r),0);
      const eff=Math.round((mst/myTotal)*100);
      showBetweenRounds(1, stars,
        [`⏱ Total latency: ${lat}ms`, `📐 Efficiency: ${eff}% of optimal (Minimum Spanning Tree)`,
         eff>=95?'★ Near-perfect MST!':'Hint: fewer, shorter roads = better network',
         '💡 The MINIMUM path that connects all nodes uses exactly N−1 edges'],
        startRound2
      );
    }, 2200);
  }

  // ── ROUND 2 ───────────────────────────────────────────────────────────────
  function startRound2() {
    round=2; roundDone=false;
    initBuildings(10);
    const diag=diagonal();
    r2Budget = Math.round(mstCost(buildings,buildings.length)*1.15); // 15% above MST
    r2Spent=0;
    hud.setLeft('Round 2/3 — Road Tax 💰');
    hud.setCenter('');
    updateHUD2();
  }

  function updateHUD2(){
    const conn=reachable.size-1, total=buildings.length-1;
    const rem=r2Budget-r2Spent;
    const col=rem<50?'#ff6644':rem<100?'#ffdd44':'#44ff88';
    hud.setCenter(`🏙 ${conn}/${total}  Budget: <span style="color:${col}">${Math.round(rem)}px left</span>`);
    const n=buildings.length, edgesUsed=roads.length;
    if(edgesUsed>=n-1){
      hud.setRight(`Edges: ${edgesUsed} (min needed: ${n-1})`);
    } else {
      hud.setRight(`Edges: ${edgesUsed}/${n-1} min`);
    }
  }

  function tryAddRoad2(a,b){
    const dx=buildings[a].x-buildings[b].x, dy=buildings[a].y-buildings[b].y;
    const len=Math.hypot(dx,dy);
    if(r2Spent+len>r2Budget*1.6){
      flashMsg('OVER BUDGET! ❌', '#ff4444', W()/2, H()*0.4, true);
      sfx.block?.() ?? sfx.fail();
      return false;
    }
    roads.push({a,b,severed:false});
    r2Spent+=len;
    sfx.pop();
    updateReachable();
    updateHUD2();
    checkWin2();
    return true;
  }

  function checkWin2(){
    if(!allConnected()||roundDone) return;
    roundDone=true;
    sfx.win();
    spawnConfetti();
    const n=buildings.length, edgesUsed=roads.length;
    const isMST=edgesUsed===n-1;
    if(isMST) {
      flashMsg('MINIMUM SPANNING TREE! 🌳', '#44ffaa', W()/2, H()/2-30, true);
      flashMsg('Exactly N-1 edges! Perfect!', '#ffffff', W()/2, H()/2+20, false);
    } else {
      flashMsg('NETWORK CONNECTED! 🌐', '#ffd700', W()/2, H()/2, true);
    }
    setTimeout(()=>{
      const pct=Math.round((r2Spent/r2Budget)*100);
      const stars=isMST?3:pct<90?2:1;
      totalCoins+=stars*15;
      showBetweenRounds(2, stars,
        [`💰 Budget used: ${Math.round(r2Spent)}/${r2Budget}px (${pct}%)`,
         `🔗 Edges used: ${edgesUsed} (minimum needed: ${n-1})`,
         isMST?'★ PERFECT MST — you found the most efficient network!':'N nodes need exactly N−1 edges to form a spanning tree',
         '💡 MST = cheapest way to connect every node. Used in ISP cable routing!'],
        startRound3
      );
    }, 2200);
  }

  // ── ROUND 3 ───────────────────────────────────────────────────────────────
  function startRound3() {
    round=3; roundDone=false;
    initBuildings(10);
    // Give player 8 seconds to build before earthquakes begin
    r3Quakes=[]; r3Packets=[]; r3QTimer=0; r3EndTimer=0; r3Started=false;
    hud.setLeft('Round 3/3 — Earthquake! 🌍');
    hud.setCenter('Build roads fast! Quake in 8s…');
    hud.setRight('');
    setTimeout(()=>{
      r3Started=true;
      hud.setCenter('💥 EARTHQUAKE HITTING!');
      flashMsg('EARTHQUAKE! 💥', '#ff4400', W()/2, H()/2, true);
      sfx.boom?.() ?? sfx.fail();
      scheduleQuakes();
    }, 8000);
  }

  function scheduleQuakes(){
    // 3 quakes, 1.5s apart — sever random roads
    for(let q=0;q<3;q++){
      setTimeout(()=>{
        const alive=roads.filter(r=>!r.severed);
        if(!alive.length) return;
        const target=alive[Math.floor(Math.random()*alive.length)];
        target.severed=true;
        // particles at midpoint
        const mx=(buildings[target.a].x+buildings[target.b].x)/2;
        const my=(buildings[target.a].y+buildings[target.b].y)/2;
        for(let p=0;p<20;p++) particles.push(makeParticle(mx,my,'#ff6600'));
        sfx.boom?.() ?? sfx.fail();
        // reroute
        const prevR=new Set(reachable);
        updateReachable();
        // show lost nodes
        for(const idx of prevR){
          if(!reachable.has(idx)&&idx!==0){
            flashMsg('☠ OFFLINE', '#ff4444', buildings[idx].x, buildings[idx].y-30);
          }
        }
        // show saved nodes
        for(const idx of reachable){
          if(!prevR.has(idx)&&idx!==0){
            flashMsg('✅ REROUTED!', '#44ff88', buildings[idx].x, buildings[idx].y-30);
          }
        }
        if(q===2){
          // all quakes done — wait 2s then end
          setTimeout(finaliseR3, 2000);
        }
      }, q*1800);
    }
  }

  function spawnPackets(){
    // visual packets flowing on roads
    if(!r3Started) return;
    const liveRoads=roads.filter(r=>!r.severed);
    if(!liveRoads.length) return;
    const r=liveRoads[Math.floor(Math.random()*liveRoads.length)];
    const dir=Math.random()<0.5;
    r3Packets.push({ road:r, t:0, dir, speed:0.012+Math.random()*0.008 });
  }

  function finaliseR3(){
    if(roundDone) return;
    roundDone=true;
    sfx.win();
    spawnConfetti();
    const surviving=reachable.size-1;
    const total=buildings.length-1;
    const stars=surviving===total?3:surviving>=Math.ceil(total*0.7)?2:surviving>=Math.ceil(total*0.4)?1:0;
    totalCoins+=stars*20;
    flashMsg(surviving===total?'ALL NODES SURVIVED! 🏆':'NETWORK PARTIALLY SURVIVED', surviving===total?'#ffd700':'#ffdd44', W()/2, H()/2, true);
    setTimeout(()=>{
      showStarResult(root,{
        stars, maxStars:3,
        title: stars===3?'🏆 Fault-Tolerant Network!':stars>=2?'💪 Mostly Survived':stars===1?'⚡ Partial Survival':'☠ Network Collapsed',
        lines:[
          `🏙 ${surviving}/${total} buildings survived the quake`,
          '─────────────────────────────',
          stars===3?'Your redundant roads automatically rerouted all traffic!':
          stars>=2?'Some redundant paths saved most buildings.':
          stars===1?'Single-connection buildings went dark. Add redundancy next time!':
          'Every building had only one path — when it broke, all went dark.',
          '─────────────────────────────',
          '💡 Internet routers re-route in milliseconds around failures',
          '🌐 The web was designed by DARPA to survive nuclear attacks',
          '📡 Redundancy = multiple paths = fault-tolerant network',
        ],
        coins:totalCoins, color:'#ffd700',
        onContinue:(s)=>{ cleanup(); onComplete(s,totalCoins); }
      });
    }, 2000);
  }

  // ── Between-rounds transition ──────────────────────────────────────────────
  function showBetweenRounds(fromRound, stars, lines, next) {
    const overlay = document.createElement('div');
    overlay.style.cssText=`position:absolute;inset:0;background:rgba(0,0,0,0.85);
      display:flex;align-items:center;justify-content:center;z-index:150;backdrop-filter:blur(6px);`;
    const card = document.createElement('div');
    card.style.cssText=`background:#0d1f0d;border:1px solid #ffd70055;border-radius:20px;
      padding:24px 22px;width:min(380px,92vw);text-align:center;`;
    const starsHtml = '⭐'.repeat(stars)+'☆'.repeat(3-stars);
    card.innerHTML=`
      <div style="font-size:13px;color:#ffd700;letter-spacing:2px;margin-bottom:8px;">ROUND ${fromRound} COMPLETE</div>
      <div style="font-size:32px;margin-bottom:12px;">${starsHtml}</div>
      ${lines.map(l=>l.startsWith('💡')||l.startsWith('🌐')||l.startsWith('📡')||l.startsWith('★')
        ?`<div style="font-size:12px;color:#ffd700;margin-top:6px;text-align:left;">${l}</div>`
        :l==='─────────────────────────────'
          ?`<div style="border-top:1px solid #ffffff22;margin:8px 0;"></div>`
          :`<div style="font-size:13px;color:#ccc;margin-top:4px;text-align:left;">${l}</div>`
      ).join('')}
      <button id="next-round-btn" style="margin-top:18px;width:100%;padding:14px;border-radius:12px;border:none;
        background:#ffd700;color:#000;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;">
        ${fromRound<3?`Round ${fromRound+1} ▶`:'Finish 🏆'}
      </button>
    `;
    overlay.appendChild(card);
    root.appendChild(overlay);
    card.querySelector('#next-round-btn').addEventListener('click',()=>{ overlay.remove(); next(); });
  }

  // ── Input ─────────────────────────────────────────────────────────────────
  function findBuilding(x,y){
    const r=buildingRadius()+12;
    for(let i=0;i<buildings.length;i++)
      if(Math.hypot(buildings[i].x-x,buildings[i].y-y)<r) return i;
    return -1;
  }

  function onDown(e){ e.preventDefault(); const {x,y}=canvasXY(e); const idx=findBuilding(x,y); if(idx>=0){dragFrom=idx;dragPos={x,y};} }
  function onMove(e){ e.preventDefault(); if(dragFrom===null)return; dragPos=canvasXY(e); }
  function onUp(e){
    e.preventDefault(); if(dragFrom===null)return;
    const {x,y}=canvasXY(e); const idx=findBuilding(x,y);
    if(idx>=0&&idx!==dragFrom){
      const dup=roads.some(r=>(r.a===dragFrom&&r.b===idx)||(r.a===idx&&r.b===dragFrom));
      if(!dup){
        if(round===2) tryAddRoad2(dragFrom,idx);
        else {
          roads.push({a:dragFrom,b:idx,severed:false});
          sfx.pop(); updateReachable();
          if(round===1){ updateHUD1(); checkWin1(); }
        }
      }
    }
    dragFrom=null; dragPos=null;
  }

  canvas.addEventListener('mousedown',onDown);
  canvas.addEventListener('mousemove',onMove);
  canvas.addEventListener('mouseup',onUp);
  canvas.addEventListener('touchstart',onDown,{passive:false});
  canvas.addEventListener('touchmove',onMove,{passive:false});
  canvas.addEventListener('touchend',onUp,{passive:false});

  // ── Draw ──────────────────────────────────────────────────────────────────
  function spawnConfetti(){
    const cols=['#ffd700','#ff6b6b','#54a0ff','#1dd1a1','#f368e0','#ff9f43'];
    for(let i=0;i<80;i++) confetti.push(makeConfetti(W(),cols[i%6]));
  }

  function draw(ts){
    const c=ctx(), w=W(), h=H();
    c.clearRect(0,0,w,h);

    // Background grid (graph paper vibe)
    c.fillStyle='#0d1a00'; c.fillRect(0,0,w,h);
    c.strokeStyle='rgba(70,240,100,0.06)'; c.lineWidth=1;
    const gs=40;
    for(let x=0;x<w;x+=gs){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}
    for(let y=0;y<h;y+=gs){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}

    // Roads
    for(const r of roads){
      if(r.severed) continue;
      const a=buildings[r.a], b=buildings[r.b];
      const lat=latencyMs(r);
      const col=lat<80?'#44aa44':lat<160?'#c8a96e':'#c84444';
      c.save();
      c.strokeStyle='rgba(0,0,0,0.3)'; c.lineWidth=9; c.lineCap='round';
      c.beginPath(); c.moveTo(a.x+2,a.y+2); c.lineTo(b.x+2,b.y+2); c.stroke();
      c.strokeStyle=col; c.lineWidth=5; c.lineCap='round'; c.setLineDash([]);
      c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke();
      c.strokeStyle='rgba(255,255,255,0.15)'; c.lineWidth=1.5; c.setLineDash([8,10]);
      c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke();
      c.setLineDash([]);
      // latency label on road
      const mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
      c.fillStyle='rgba(0,0,0,0.55)'; c.beginPath(); c.arc(mx,my,14,0,Math.PI*2); c.fill();
      c.fillStyle=col; c.font='bold 9px monospace'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(lat+'ms',mx,my);
      c.restore();
    }

    // Severed roads (broken, red dashes)
    for(const r of roads){
      if(!r.severed) continue;
      const a=buildings[r.a], b=buildings[r.b];
      c.save(); c.strokeStyle='rgba(255,60,0,0.35)'; c.lineWidth=3;
      c.setLineDash([4,6]); c.lineCap='round';
      c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke();
      c.setLineDash([]); c.restore();
    }

    // R3 flowing packets
    for(const p of r3Packets){
      const r=p.road; if(r.severed)continue;
      const a=buildings[r.a], b=buildings[r.b];
      const px=a.x+(b.x-a.x)*(p.dir?p.t:1-p.t);
      const py=a.y+(b.y-a.y)*(p.dir?p.t:1-p.t);
      c.save(); c.shadowColor='#ffd700'; c.shadowBlur=10;
      c.fillStyle='#ffd700'; c.beginPath(); c.arc(px,py,4,0,Math.PI*2); c.fill();
      c.restore();
    }

    // Drag line
    if(dragFrom!==null&&dragPos){
      const a=buildings[dragFrom];
      const dx=dragPos.x-a.x, dy=dragPos.y-a.y;
      const dist=Math.hypot(dx,dy);
      const lat=Math.round(dist*0.5);
      const col=lat<80?'rgba(68,255,100,0.7)':lat<160?'rgba(255,215,0,0.7)':'rgba(255,100,60,0.7)';
      c.save(); c.setLineDash([6,8]); c.strokeStyle=col; c.lineWidth=3; c.lineCap='round';
      c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(dragPos.x,dragPos.y); c.stroke();
      c.setLineDash([]);
      // preview latency
      c.fillStyle='rgba(0,0,0,0.7)'; c.beginPath(); c.arc((a.x+dragPos.x)/2,(a.y+dragPos.y)/2,16,0,Math.PI*2); c.fill();
      c.fillStyle=col; c.font='bold 10px monospace'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(lat+'ms',(a.x+dragPos.x)/2,(a.y+dragPos.y)/2);
      c.restore();
    }

    // Buildings
    const br=buildingRadius();
    for(let i=0;i<buildings.length;i++){
      const b=buildings[i];
      let dy=0;
      if(!b.connected) dy=Math.sin(ts*0.003+i*1.2)*3;
      else if(bounceSet.has(i)) dy=-Math.abs(Math.sin(ts*0.02))*10;
      c.save(); c.translate(b.x,b.y+dy);
      // shadow
      c.fillStyle='rgba(0,0,0,0.4)'; c.beginPath();
      c.ellipse(2,br*0.6,br*0.7,br*0.25,0,0,Math.PI*2); c.fill();
      // offline tint for R3
      const offline=(round===3&&r3Started&&!reachable.has(i)&&i!==0);
      const bx=-br,by=-br,bw=br*2,bh=br*2;
      c.beginPath(); c.roundRect(bx,by,bw,bh,10);
      c.fillStyle=offline?'#333333':b.color+'cc'; c.fill();
      if(!offline){
        c.strokeStyle=b.color; c.lineWidth=b.connected?2.5:1.5; c.stroke();
        if(b.connected&&i!==0){c.shadowColor=b.color;c.shadowBlur=14;c.stroke();c.shadowBlur=0;}
        if(b.isPalace){c.shadowColor='#ffd700';c.shadowBlur=22;c.strokeStyle='#ffd700';c.lineWidth=3;c.stroke();c.shadowBlur=0;}
      } else {
        c.strokeStyle='#555'; c.lineWidth=1.5; c.stroke();
      }
      c.font=`${br*1.0}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.globalAlpha=offline?0.35:1; c.fillText(b.icon,0,0); c.globalAlpha=1;
      c.font=`bold ${Math.max(9,br*0.42)}px monospace`; c.fillStyle=offline?'#555':'#fff';
      c.textAlign='center'; c.textBaseline='top'; c.fillText(b.label,0,br+4);
      // offline badge
      if(offline){c.font='16px serif';c.textBaseline='middle';c.fillText('☠',0,0);}
      c.restore();
    }

    // Flash messages
    flashMsgs=flashMsgs.filter(m=>m.life>0);
    for(const m of flashMsgs){
      c.save(); c.globalAlpha=Math.min(1,m.life);
      c.fillStyle=m.color; c.textAlign='center'; c.textBaseline='middle';
      if(m.big){c.font='bold 22px monospace';c.shadowColor=m.color;c.shadowBlur=20;}
      else c.font='bold 13px monospace';
      c.fillText(m.text,m.x,m.y-(1-m.life)*30); c.restore();
      m.life-=0.018; m.y-=0.4;
    }

    // Particles
    for(const p of particles){c.globalAlpha=p.life;c.fillStyle=p.color;c.beginPath();c.arc(p.x,p.y,p.r,0,Math.PI*2);c.fill();}
    c.globalAlpha=1;
    for(const p of confetti){c.save();c.globalAlpha=p.life;c.fillStyle=p.color;c.translate(p.x,p.y);c.rotate(p.rot);c.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.6);c.restore();}

    // R2 budget bar
    if(round===2&&buildings.length){
      const bw=Math.min(280,w*0.55);
      const bx=(w-bw)/2, by=h-18;
      const pct=Math.min(1,r2Spent/r2Budget);
      c.fillStyle='rgba(0,0,0,0.5)';c.beginPath();c.roundRect(bx,by,bw,10,5);c.fill();
      c.fillStyle=pct>0.9?'#ff4444':pct>0.7?'#ffdd44':'#44ff88';
      c.beginPath();c.roundRect(bx,by,bw*pct,10,5);c.fill();
      c.fillStyle='#fff';c.font='9px monospace';c.textAlign='center';c.textBaseline='middle';
      c.fillText(`Budget: ${Math.round(r2Spent)}/${r2Budget}px`,w/2,by+5);
    }
  }

  function updateParticles(){
    for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=0.12;p.life-=p.decay;}
    particles=particles.filter(p=>p.life>0);
    for(const p of confetti){p.x+=p.vx;p.y+=p.vy;p.rot+=p.rotV;p.life-=p.decay;}
    confetti=confetti.filter(p=>p.life>0);
    for(const p of r3Packets){p.t+=p.speed;if(p.t>1)p.t=0;}
  }

  // ── Loop ──────────────────────────────────────────────────────────────────
  let packetTimer=0;
  function loop(ts){
    raf=requestAnimationFrame(loop);
    updateParticles();
    if(round===3&&r3Started){
      packetTimer++;
      if(packetTimer%18===0) spawnPackets();
      r3Packets=r3Packets.filter(p=>!p.road.severed);
    }
    draw(ts);
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  showLessonBanner(root,{
    concept:'Graph Theory & Network Design',
    detail:'Nodes = devices. Edges = cables. N nodes need N−1 edges to connect. More edges = redundancy = fault tolerance.',
    color:'#ffd700',
  });

  showIntro(root,{
    emoji:'🏙',
    title:t('m1.title'),
    concept:t('m1.concept'),
    howto:t('m1.howto'),
    color:'#ffd700',
    onStart:()=>{
      startRound1();
      raf=requestAnimationFrame(loop);
    },
  });

  function cleanup(){
    if(raf) cancelAnimationFrame(raf);
    canvas.removeEventListener('mousedown',onDown);
    canvas.removeEventListener('mousemove',onMove);
    canvas.removeEventListener('mouseup',onUp);
    canvas.removeEventListener('touchstart',onDown);
    canvas.removeEventListener('touchmove',onMove);
    canvas.removeEventListener('touchend',onUp);
    destroy();
  }
}
