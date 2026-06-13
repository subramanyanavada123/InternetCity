import { makeGameShell, makeHUD, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';
import { t } from '../../shared/i18n.js';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 4 — MONSTER ATTACK  (redesign)
// 3 escalating waves. Clear tutorial: node selection highlighted,
// backup link counter always visible, "TAP TWO NODES" shown on canvas.
// Wave 1: 1 monster, Wave 2: 2 monsters, Wave 3: 3 monsters + MEGA.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_BL  = 5;
const BUILD_T = 35;   // seconds to add backup links

export function launch(app, state, onComplete) {
  const shell = makeGameShell(app, { bgColor:'#0a0014' });
  const { root, canvas, ctx, W, H, destroy, canvasXY } = shell;
  const hud = makeHUD(root, { color:'#c9b6ff' });

  const backBtn = document.createElement('button');
  backBtn.style.cssText = `position:absolute;top:8px;left:16px;z-index:70;
    background:rgba(0,0,0,0.5);border:1px solid #c9b6ff55;border-radius:10px;
    color:#c9b6ff;font-size:13px;font-weight:700;cursor:pointer;
    padding:6px 12px;font-family:inherit;`;
  backBtn.textContent = t('btn.back');
  backBtn.onclick = () => done(0,0);
  root.appendChild(backBtn);

  // ── Layout ──────────────────────────────────────────────────────────────────
  function buildLayout(){
    const cx=W()/2, cy=H()/2;
    const tr=Math.min(W(),H())*0.26, br=Math.min(W(),H())*0.42;
    const dc={ id:'dc', type:'dc', x:cx, y:cy, alive:true };
    const tAngles=[0.25,0.75,1.25,1.75].map(v=>v*Math.PI);
    const towers=tAngles.map((a,i)=>({
      id:`t${i}`, type:'tower', alive:true,
      x:cx+Math.cos(a)*tr, y:cy+Math.sin(a)*tr,
    }));
    const buildings=[];
    towers.forEach((t,ti)=>{
      [-0.22,0.22].forEach((off,bi)=>{
        const a=tAngles[ti]+off;
        buildings.push({ id:`b${ti}_${bi}`, type:'building', alive:true,
          x:cx+Math.cos(a)*br, y:cy+Math.sin(a)*br, towerId:t.id });
      });
    });
    return { dc, towers, buildings };
  }

  let { dc, towers, buildings } = buildLayout();
  const backupLinks=[], coreLinks=[];
  towers.forEach(t=>coreLinks.push({a:'dc',b:t.id}));
  buildings.forEach(b=>coreLinks.push({a:b.towerId,b:b.id}));

  let selected=null, phase='build';
  let buildStart=performance.now();
  let monsters=[], particles=[], floaters=[];
  let wave=0, wavesDone=0;
  let totalOnline=8;
  let phaseMsg=null;
  let rafId=null;
  let ended=false;
  let tutStep=0;  // 0=initial, 1=first node selected, 2=first link done

  const allNodes=()=>[dc,...towers,...buildings];
  const nodeById=id=>allNodes().find(n=>n.id===id);

  // ── BFS reachability ─────────────────────────────────────────────────────
  function bfsOnline(){
    const adj={}; allNodes().forEach(n=>{adj[n.id]=[];});
    [...coreLinks,...backupLinks].forEach(({a,b})=>{
      const na=nodeById(a),nb=nodeById(b);
      if(na&&nb&&(na.alive||na.type==='dc')&&(nb.alive||nb.type==='dc')){
        adj[a].push(b); adj[b].push(a);
      }
    });
    const vis=new Set(['dc']),q=['dc'];
    while(q.length){
      const cur=q.shift(),node=nodeById(cur);
      if(!node||(!node.alive&&node.type!=='dc')) continue;
      for(const nb of adj[cur]){
        if(!vis.has(nb)){
          const nbn=nodeById(nb);
          if(nbn&&(nbn.alive||nbn.type==='dc')){ vis.add(nb); q.push(nb); }
        }
      }
    }
    return vis;
  }

  // ── Particles / floaters ───────────────────────────────────────────────────
  function explode(x,y){
    const cols=['#ff4400','#ff8800','#ffcc00','#ff0000','#ff6600'];
    for(let i=0;i<28;i++){
      const a=Math.random()*6.28,sp=2+Math.random()*4;
      particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:2+Math.random()*5,life:1,color:cols[i%5]});
    }
  }
  function savedFloat(x,y){ floaters.push({x,y,txt:'✨ SAVED!',color:'#44ff88',vy:-1.2,life:1}); }
  function offlineFloat(x,y){ floaters.push({x,y,txt:'💀 OFFLINE',color:'#ff4444',vy:-1.2,life:1}); }

  // ── Drawing ────────────────────────────────────────────────────────────────
  function drawScene(ts){
    const c=ctx(),w=W(),h=H();
    c.fillStyle='#0a0014'; c.fillRect(0,0,w,h);

    // Stars
    c.fillStyle='#fff';
    for(let i=0;i<70;i++){
      c.globalAlpha=0.15+(i%7)*0.08;
      c.beginPath(); c.arc((i*173+37)%w,(i*97+13)%(h*0.85),1,0,6.28); c.fill();
    }
    c.globalAlpha=1;

    const online=phase==='build'?new Set(allNodes().map(n=>n.id)):bfsOnline();

    // Draw core links
    coreLinks.forEach(({a,b})=>{
      const na=nodeById(a),nb=nodeById(b); if(!na||!nb) return;
      const on=na.alive&&nb.alive&&(online.has(a)||a==='dc')&&online.has(b);
      c.save(); c.beginPath(); c.moveTo(na.x,na.y); c.lineTo(nb.x,nb.y);
      c.strokeStyle=on?'#ffffff22':'#ffffff0a'; c.lineWidth=1.5; c.stroke(); c.restore();
    });

    // Draw backup links
    backupLinks.forEach(({a,b})=>{
      const na=nodeById(a),nb=nodeById(b); if(!na||!nb) return;
      c.save(); c.beginPath(); c.moveTo(na.x,na.y); c.lineTo(nb.x,nb.y);
      c.strokeStyle='#ffd700'; c.lineWidth=2.5; c.setLineDash([7,4]);
      c.shadowColor='#ffd700'; c.shadowBlur=8; c.stroke(); c.restore();
    });

    // Draw buildings
    buildings.forEach(b=>{
      const on=b.alive&&online.has(b.id);
      c.save();
      if(on){ c.shadowColor='#c9b6ff'; c.shadowBlur=8; }
      c.fillStyle=on?'#c9b6ff':'#333';
      c.fillRect(b.x-10,b.y-14,20,28);
      for(let r=0;r<2;r++) for(let col=0;col<2;col++){
        c.fillStyle=on?'#ffe87a':'#222';
        c.fillRect(b.x-7+col*9,b.y-9+r*9,5,5);
      }
      c.restore();
      // Online indicator dot
      c.beginPath(); c.arc(b.x,b.y-20,4,0,6.28);
      c.fillStyle=on?'#44ff88':'#ff4444'; c.fill();
    });

    // Draw towers
    towers.forEach(t=>{
      c.save();
      if(t.alive){ c.shadowColor='#7fd8ff'; c.shadowBlur=14; }
      c.beginPath();
      c.moveTo(t.x-7,t.y+18); c.lineTo(t.x+7,t.y+18); c.lineTo(t.x,t.y-18);
      c.closePath(); c.fillStyle=t.alive?'#7fd8ff':'#444'; c.fill();
      if(t.alive){
        c.beginPath(); c.arc(t.x,t.y-22,5,0,6.28);
        c.fillStyle='#fff'; c.fill();
        // Wifi ring
        c.strokeStyle='rgba(127,216,255,0.4)'; c.lineWidth=1.5;
        [10,18].forEach(r=>{
          c.beginPath(); c.arc(t.x,t.y-22,r+Math.sin(ts/600+r)*2,0,Math.PI);
          c.stroke();
        });
      }
      c.restore();
    });

    // Draw data center
    c.save(); c.shadowColor='#7fd8ff'; c.shadowBlur=22;
    c.beginPath();
    for(let i=0;i<6;i++){
      const a=(Math.PI/3)*i-Math.PI/6;
      i===0?c.moveTo(dc.x+30*Math.cos(a),dc.y+30*Math.sin(a)):c.lineTo(dc.x+30*Math.cos(a),dc.y+30*Math.sin(a));
    }
    c.closePath(); c.fillStyle='#0a2240'; c.fill();
    c.strokeStyle='#7fd8ff'; c.lineWidth=2.5; c.stroke();
    c.fillStyle='#7fd8ff'; c.font='bold 11px monospace';
    c.textAlign='center'; c.textBaseline='middle'; c.fillText('DC',dc.x,dc.y);
    c.restore();

    // Selected ring (pulsing gold)
    if(selected){
      c.save();
      const p=0.5+0.5*Math.sin(ts/100);
      c.strokeStyle=`rgba(255,215,0,${0.6+p*0.4})`; c.lineWidth=3; c.setLineDash([5,4]);
      c.shadowColor='#ffd700'; c.shadowBlur=12;
      c.beginPath(); c.arc(selected.x,selected.y,30,0,6.28); c.stroke(); c.restore();
    }

    // Tutorial overlay — "TAP TWO NODES TO LINK"
    if(phase==='build'&&tutStep<2&&backupLinks.length===0){
      c.save();
      c.font='bold 13px monospace'; c.textAlign='center'; c.textBaseline='top';
      const msg=selected?'✅ Now tap a second node':'👆 Tap any node to start a link';
      c.fillStyle='rgba(0,0,0,0.65)';
      c.beginPath(); c.roundRect(w/2-160,h-52,320,36,10); c.fill();
      c.fillStyle='#ffd700'; c.fillText(msg,w/2,h-44);
      c.restore();
    }

    // Monsters
    monsters.forEach(m=>{
      const yb=m.y+Math.sin(ts/200)*4;
      c.save(); c.shadowColor=m.color; c.shadowBlur=20;
      const mr=m.mega?34:22;
      c.beginPath(); c.arc(m.x,yb,mr,0,6.28);
      c.fillStyle=m.color; c.fill(); c.shadowBlur=0;
      const er=m.mega?9:6;
      [[-9,-7],[9,-7]].forEach(([ex,ey])=>{
        c.beginPath(); c.arc(m.x+ex,yb+ey,er,0,6.28); c.fillStyle='#fff'; c.fill();
        c.beginPath(); c.arc(m.x+ex+1,yb+ey+1,er*0.55,0,6.28); c.fillStyle='#111'; c.fill();
      });
      c.beginPath(); c.arc(m.x,yb+8,m.mega?10:7,0,Math.PI);
      c.strokeStyle='#111'; c.lineWidth=2.5; c.stroke();
      if(!m.done){
        const stomps=Math.sin(ts/100)*5;
        c.strokeStyle=m.color; c.lineWidth=4; c.lineCap='round';
        c.beginPath(); c.moveTo(m.x-10,yb+mr); c.lineTo(m.x-10,yb+mr+stomps); c.stroke();
        c.beginPath(); c.moveTo(m.x+10,yb+mr); c.lineTo(m.x+10,yb+mr-stomps); c.stroke();
      }
      // Progress bar to target
      if(!m.done&&m.target){
        const tot=Math.hypot(m.target.x-m.startX,m.target.y-m.startY)||1;
        const rem=Math.hypot(m.target.x-m.x,m.target.y-m.y);
        const pct=1-rem/tot;
        c.fillStyle='rgba(0,0,0,0.5)';
        c.beginPath(); c.roundRect(m.x-24,yb-mr-16,48,8,4); c.fill();
        c.fillStyle=m.color;
        c.beginPath(); c.roundRect(m.x-24,yb-mr-16,48*pct,8,4); c.fill();
      }
      c.restore();
    });

    // Particles
    particles.forEach(p=>{
      c.save(); c.globalAlpha=p.life; c.fillStyle=p.color;
      c.beginPath(); c.arc(p.x,p.y,p.r,0,6.28); c.fill(); c.restore();
    });

    // Floaters
    floaters.forEach(f=>{
      c.save(); c.globalAlpha=Math.max(0,f.life);
      c.font='bold 13px monospace'; c.textAlign='center'; c.textBaseline='top';
      c.fillStyle=f.color; c.fillText(f.txt,f.x,f.y); c.restore();
    });

    // Phase text
    if(phaseMsg){
      phaseMsg.alpha-=0.01; phaseMsg.y-=0.5;
      if(phaseMsg.alpha>0){
        c.save(); c.globalAlpha=Math.min(1,phaseMsg.alpha);
        c.fillStyle=phaseMsg.color||'#ff4444';
        c.font=`bold ${phaseMsg.size||28}px monospace`;
        c.textAlign='center'; c.shadowColor=phaseMsg.color||'#ff0000'; c.shadowBlur=18;
        c.fillText(phaseMsg.text,w/2,phaseMsg.y); c.restore();
      } else phaseMsg=null;
    }
  }

  // ── RAF ─────────────────────────────────────────────────────────────────────
  rafId=requestAnimationFrame(function tick(ts){
    particles.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=0.12; p.life-=0.02; });
    particles=particles.filter(p=>p.life>0);
    floaters.forEach(f=>{ f.y+=f.vy; f.life-=0.015; });
    floaters=floaters.filter(f=>f.life>0);
    monsters.forEach(m=>{
      if(m.done) return;
      const dx=m.target.x-m.x,dy=m.target.y-m.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<3){ m.x=m.target.x; m.y=m.target.y; m.done=true; }
      else { m.x+=dx/d*m.speed; m.y+=dy/d*m.speed; }
    });
    if(phase==='build'){
      const elapsed=(ts-buildStart)/1000;
      const rem=Math.max(0,BUILD_T-elapsed);
      const online=bfsOnline();
      const onCount=buildings.filter(b=>online.has(b.id)).length;
      hud.setCenter(`⚡ TAP 2 NODES TO LINK &nbsp; ⏱ ${Math.ceil(rem)}s`);
      hud.setRight(`🔗 ${backupLinks.length}/${MAX_BL} &nbsp; 🏙 ${onCount}/8`);
      if(rem<=0) startWave1();
    }
    drawScene(ts);
    rafId=requestAnimationFrame(tick);
  });

  // ── Click ─────────────────────────────────────────────────────────────────
  function handleTap(mx,my){
    if(phase!=='build') return;
    const hit=allNodes().find(n=>Math.hypot(n.x-mx,n.y-my)<36);
    if(!hit){ selected=null; return; }
    sfx.coin();
    if(!selected){ selected=hit; tutStep=Math.max(tutStep,1); return; }
    if(selected.id===hit.id){ selected=null; return; }
    const dup=backupLinks.some(l=>(l.a===selected.id&&l.b===hit.id)||(l.b===selected.id&&l.a===hit.id));
    const isCore=coreLinks.some(l=>(l.a===selected.id&&l.b===hit.id)||(l.b===selected.id&&l.a===hit.id));
    if(!dup&&!isCore&&backupLinks.length<MAX_BL){
      backupLinks.push({a:selected.id,b:hit.id});
      sfx.pop(); tutStep=2;
    } else { sfx.block(); }
    selected=null;
  }

  let lastTouch=0;
  canvas.addEventListener('click',e=>{
    // Ignore clicks synthesised within 400ms of a touch (avoid double-fire)
    if(performance.now()-lastTouch<400) return;
    const {x,y}=canvasXY(e); handleTap(x,y);
  });
  canvas.addEventListener('touchend',e=>{
    e.preventDefault();
    lastTouch=performance.now();
    const {x,y}=canvasXY(e); handleTap(x,y);
  },{passive:false});

  // ── Wave system ───────────────────────────────────────────────────────────
  function spawnMonster(towerId,color,mega,delayMs){
    const target=towers.find(t=>t.id===towerId); if(!target) return;
    const w=W(),h=H();
    const edges=[{x:-50,y:h*0.3},{x:w+50,y:h*0.5},{x:w*0.5,y:-50},{x:-50,y:h*0.7},{x:w+50,y:h*0.25}];
    const e=edges[Math.floor(Math.random()*edges.length)];
    setTimeout(()=>{
      const m={x:e.x,y:e.y,startX:e.x,startY:e.y,target,speed:mega?1.4:1.8,color,mega,done:false};
      monsters.push(m);
      const iv=setInterval(()=>{
        if(!m.done) return;
        clearInterval(iv);
        stompTower(towerId);
        setTimeout(()=>{ const i=monsters.indexOf(m); if(i>=0) monsters.splice(i,1); },1500);
      },50);
    },delayMs);
  }

  function stompTower(tid){
    const tower=towers.find(t=>t.id===tid); if(!tower||!tower.alive) return;
    sfx.boom(); tower.alive=false; explode(tower.x,tower.y);
    phaseMsg={text:'💥 TOWER DOWN!',alpha:2,y:H()*0.4,color:'#ff4444',size:26};
    const online=bfsOnline();
    buildings.forEach(b=>{
      if(b.towerId!==tid) return;
      if(online.has(b.id)) savedFloat(b.x,b.y-24);
      else { b.alive=false; offlineFloat(b.x,b.y-24); }
    });
  }

  function startWave1(){
    if(phase!=='build') return;
    phase='wave1'; selected=null;
    wavesDone=0;
    hud.setCenter('👾 WAVE 1 — 1 MONSTER!'); hud.setRight('');
    phaseMsg={text:'👾 WAVE 1!',alpha:2.5,y:H()/2,color:'#44ff88',size:32};
    const shuffled=[...towers].sort(()=>Math.random()-0.5);
    spawnMonster(shuffled[0].id,'#44dd44',false,800);
    setTimeout(()=>{ checkWaveEnd('wave1','wave2'); },5500);
  }

  function startWave2(){
    phase='wave2';
    hud.setCenter('👾👾 WAVE 2 — 2 MONSTERS!'); hud.setRight('');
    phaseMsg={text:'👾 WAVE 2!',alpha:2.5,y:H()/2,color:'#ff8833',size:32};
    const shuffled=[...towers].filter(t=>t.alive).sort(()=>Math.random()-0.5);
    spawnMonster(shuffled[0]?.id||towers[0].id,'#ff8833',false,600);
    spawnMonster(shuffled[1]?.id||towers[1].id,'#cc55ff',false,1600);
    setTimeout(()=>{ checkWaveEnd('wave2','wave3'); },7000);
  }

  function startWave3(){
    phase='wave3';
    hud.setCenter('👾👾👾 WAVE 3 — MEGA MONSTER!'); hud.setRight('');
    phaseMsg={text:'🔥 FINAL WAVE!',alpha:2.5,y:H()/2,color:'#ff4444',size:32};
    const alive=towers.filter(t=>t.alive).sort(()=>Math.random()-0.5);
    spawnMonster(alive[0]?.id||towers[0].id,'#ff3333',false,600);
    spawnMonster(alive[1]?.id||towers[1].id,'#ff9900',false,1600);
    if(alive.length>=3) spawnMonster(alive[2].id,'#cc00ff',true,2600);  // MEGA
    setTimeout(showResults,8000);
  }

  function checkWaveEnd(curPhase,nextFn){
    if(phase!==curPhase) return;
    wavesDone++;
    setTimeout(()=>{
      if(nextFn==='wave2') startWave2();
      else if(nextFn==='wave3') startWave3();
      else showResults();
    },1200);
  }

  function showResults(){
    if(ended) return;
    ended=true; phase='done';
    const online=bfsOnline();
    const onlineCount=buildings.filter(b=>online.has(b.id)).length;
    const stars=onlineCount>=8?3:onlineCount>=6?2:onlineCount>=4?1:0;
    const coins=[0,20,45,80][stars];
    sfx[stars>=2?'win':'fail']();
    hud.setCenter('');
    showStarResult(root,{
      stars,maxStars:3,color:'#ffd700',
      title:['City Offline 😞','Partial Redundancy 🌐','Good Redundancy! 🛡️','Perfect Redundancy! 🏆'][stars],
      lines:[
        `🏙 Buildings online: ${onlineCount}/8`,
        `🔗 Backup links built: ${backupLinks.length}/${MAX_BL}`,
        '─────────────────────────',
        stars===3?'★ Every building had an alternate path!':
        stars===2?'Backup links saved most buildings!':
        stars===1?'Some survived via backups, many went dark.':
        'No backup paths → single point of failure!',
        '─────────────────────────',
        '📡 Real internet backbone cables are fully redundant.',
        'When a router fails, BGP reroutes packets in milliseconds.',
      ],
      coins,
      onContinue:(action)=>action==='retry'?(cleanup(),launch(app,state,onComplete)):done(stars,coins),
    });
  }

  function done(stars,coins){ cancelAnimationFrame(rafId); destroy(); onComplete(stars,coins); }

  function cleanup(){ cancelAnimationFrame(rafId); destroy(); }

  showLessonBanner(root,{ concept:t('m4.concept'), detail:t('m4.banner'), color:'#c9b6ff' });
  showIntro(root,{
    emoji:'👾', title:t('m4.title'), concept:t('m4.concept'), howto:t('m4.howto'), color:'#c9b6ff',
    onStart:()=>{
      buildStart=performance.now();
      hud.setCenter('⚡ TAP 2 NODES TO LINK &nbsp; ⏱ '+BUILD_T+'s');
      hud.setRight(`🔗 0/${MAX_BL} &nbsp; 🏙 8/8`);
    },
  });
}
