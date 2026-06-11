import { makeGameShell, makeHUD, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';
import { t } from '../../shared/i18n.js';

const LANE_COLORS = ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6'];
const FRAGMENTS   = ['THE 🌍','INTERNET 🚀','NEVER 💤','SLEEPS 🔥','ALWAYS 🌐','ON'];
const RACE_MS = 15000;
const N = 6;

function makeConfetti(x, y) {
  const cols = ['#ffd700','#ff6b6b','#54a0ff','#1dd1a1','#f368e0','#ff9f43'];
  return Array.from({length:60}, () => {
    const a = Math.random()*Math.PI*2, s = 2+Math.random()*5;
    return { x,y, vx:Math.cos(a)*s, vy:Math.sin(a)*s-4,
      rot:Math.random()*Math.PI*2, rotV:(Math.random()-0.5)*0.3,
      r:4+Math.random()*6, color:cols[Math.floor(Math.random()*cols.length)],
      life:1, decay:0.012+Math.random()*0.012 };
  });
}

function rrect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x+r,y); c.lineTo(x+w-r,y); c.arcTo(x+w,y,x+w,y+r,r);
  c.lineTo(x+w,y+h-r); c.arcTo(x+w,y+h,x+w-r,y+h,r);
  c.lineTo(x+r,y+h); c.arcTo(x,y+h,x,y+h-r,r);
  c.lineTo(x,y+r); c.arcTo(x,y,x+r,y,r);
  c.closePath();
}

export function launch(app, state, onComplete) {
  const shell = makeGameShell(app, { bgColor:'#001a1a' });
  const { root, canvas, ctx, W, H, destroy, canvasXY } = shell;
  const hud = makeHUD(root, { color:'#46f0c0' });

  const backBtn = document.createElement('button');
  backBtn.textContent = '← Missions';
  backBtn.style.cssText = 'position:absolute;top:8px;left:16px;z-index:70;background:rgba(0,0,0,0.5);border:1px solid #46f0c055;border-radius:10px;color:#46f0c0;font-size:13px;font-weight:700;cursor:pointer;padding:6px 12px;font-family:inherit;';
  backBtn.onclick = () => { cleanup(); onComplete(0,0); };
  root.appendChild(backBtn);

  let raf = null, raceStart = null, confetti = [], wrongAttempts = 0, phase2El = null;

  const runners = Array.from({length:N}, (_,lane) => ({
    lane, fragIdx:lane, bib:lane+1,
    speed: 80 + Math.random()*100,
    x:0, finished:false, legAngle:Math.random()*Math.PI*2,
  }));
  const arrivals = [];

  // ── Race draw ────────────────────────────────────────────────────────────────
  function drawRace(now) {
    if (!raceStart) raceStart = now;
    const elapsed = now - raceStart;
    const c = ctx(), w = W(), h = H();
    c.fillStyle = '#001200';
    c.fillRect(0,0,w,h);

    const trackTop = 56, trackBot = h-80, trackH = trackBot-trackTop;
    const laneH = trackH/N, finishX = w-80, dt = 1/60;

    for (let i=0;i<N;i++) {
      c.fillStyle = i%2===0 ? '#1a2a10' : '#1e3012';
      c.fillRect(60, trackTop+i*laneH, finishX-60, laneH);
    }
    c.strokeStyle='rgba(255,255,255,0.15)'; c.lineWidth=1;
    for (let i=0;i<=N;i++) {
      const ly=trackTop+i*laneH;
      c.beginPath(); c.moveTo(60,ly); c.lineTo(finishX,ly); c.stroke();
    }
    c.strokeStyle='rgba(255,255,255,0.4)'; c.lineWidth=3;
    c.setLineDash([8,6]);
    c.beginPath(); c.moveTo(60,trackTop); c.lineTo(60,trackBot); c.stroke();
    c.setLineDash([]);

    for (let i=0;i<N*4;i++) {
      c.fillStyle = i%2===0 ? '#ffffff' : '#333333';
      c.fillRect(finishX-2, trackTop+i*(trackH/(N*4)), 4, trackH/(N*4));
    }
    c.font='bold 14px "Space Mono",monospace'; c.fillStyle='#ffd700';
    c.textAlign='center'; c.fillText('🏁 FINISH', finishX, trackTop-12);

    let allFinished = true;
    for (const r of runners) {
      const cy = trackTop + r.lane*laneH + laneH/2;
      if (!r.finished) {
        r.x += r.speed*dt; r.legAngle += 0.18;
        if (r.x >= finishX-60) {
          r.finished=true; arrivals.push(r.fragIdx);
          confetti.push(...makeConfetti(finishX, cy)); sfx.pop();
        }
      }
      if (!r.finished) allFinished = false;
      const col = LANE_COLORS[r.lane];
      c.save(); c.translate(60+r.x, cy);
      if (!r.finished) {
        const lo = Math.sin(r.legAngle)*5;
        c.strokeStyle=col; c.lineWidth=2; c.lineCap='round';
        c.beginPath(); c.moveTo(-6,8); c.lineTo(0,0); c.lineTo(6+lo,10); c.stroke();
        c.beginPath(); c.moveTo(6,8);  c.lineTo(0,0); c.lineTo(-6+lo,10); c.stroke();
      }
      c.beginPath(); c.arc(0,0,10,0,Math.PI*2);
      c.fillStyle=col; c.fill(); c.strokeStyle='#fff'; c.lineWidth=r.finished?2:1.5; c.stroke();
      c.font='bold 9px "Space Mono",monospace'; c.fillStyle='#fff';
      c.textAlign='center'; c.textBaseline='middle'; c.fillText(r.bib,0,0);
      c.font='10px "Space Mono",monospace'; c.fillStyle=r.finished?'#aaa':col;
      c.textBaseline='bottom'; c.fillText(FRAGMENTS[r.fragIdx],0,-14);
      c.restore();
    }

    // Arrival strip
    c.fillStyle='#002a2a'; c.fillRect(0,trackBot+4,w,72);
    c.font='11px "Space Mono",monospace'; c.fillStyle='#46f0c0';
    c.textAlign='left'; c.textBaseline='top';
    c.fillText('ARRIVAL ORDER:',12,trackBot+8);
    const cw = w<600?82:100;
    for (let i=0;i<arrivals.length;i++) {
      const fi=arrivals[i], col=LANE_COLORS[runners.find(r=>r.fragIdx===fi).lane];
      const ax=160+i*(cw+8);
      c.fillStyle=col+'cc'; rrect(c,ax,trackBot+4,cw,60,8); c.fill();
      c.strokeStyle=col; c.lineWidth=1.5; c.stroke();
      c.font='bold 11px "Space Mono",monospace'; c.fillStyle='#fff';
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText(FRAGMENTS[fi], ax+cw/2, trackBot+34);
    }

    drawConf(c);
    const tl = Math.max(0,Math.ceil((RACE_MS-elapsed)/1000));
    hud.setCenter(`⏱ ${tl}s  —  PACKET RACE`);

    if (allFinished || elapsed>=RACE_MS) {
      for (const r of runners) if (!r.finished) { r.finished=true; arrivals.push(r.fragIdx); }
      cancelAnimationFrame(raf); raf=null;
      setTimeout(startReassemble, 600);
    }
  }

  function drawConf(c) {
    confetti = confetti.filter(p => {
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.18; p.rot+=p.rotV; p.life-=p.decay;
      return p.life>0;
    });
    for (const p of confetti) {
      c.save(); c.globalAlpha=Math.max(0,p.life); c.fillStyle=p.color;
      c.translate(p.x,p.y); c.rotate(p.rot);
      c.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.55);
      c.restore();
    }
    c.globalAlpha=1;
  }

  function raceLoop(now) { drawRace(now); raf=requestAnimationFrame(raceLoop); }

  // ── Phase 2: DOM reassemble ───────────────────────────────────────────────────
  function startReassemble() {
    hud.setCenter('REASSEMBLE — drag fragments into correct order 1→6');
    canvas.style.display='none';
    phase2El = document.createElement('div');
    phase2El.style.cssText='position:absolute;inset:0;background:#001a1a;display:flex;flex-direction:column;align-items:center;padding:56px 12px 12px;box-sizing:border-box;gap:16px;font-family:"Space Mono",monospace;';
    root.appendChild(phase2El);

    addLabel(phase2El,'Packets arrived out-of-order — sort them 1 → 6','12px','#46f0c0');
    const srcRow = addRow(phase2El);
    addLabel(phase2El,'DROP ZONE — assemble in order','11px','#555');
    const dstRow = addRow(phase2El);

    const cards=[];
    for (let i=0;i<N;i++) {
      const fi=arrivals[i], r=runners.find(r=>r.fragIdx===fi), col=LANE_COLORS[r.lane];
      const card=document.createElement('div');
      card.dataset.fragIdx=fi; card.dataset.bib=r.bib; card.draggable=true;
      card.style.cssText=`width:100px;height:72px;border-radius:12px;border:2px solid ${col};background:${col}33;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:grab;user-select:none;transition:transform .15s,opacity .15s;position:relative;color:#fff;font-weight:700;box-shadow:0 2px 12px ${col}44;`;
      const badge=document.createElement('div');
      badge.style.cssText=`position:absolute;top:4px;right:6px;background:${col};color:#000;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;`;
      badge.textContent=r.bib; card.appendChild(badge);
      const txt=document.createElement('div');
      txt.style.cssText='text-align:center;padding:0 6px;font-size:11px;line-height:1.4;';
      txt.textContent=FRAGMENTS[fi]; card.appendChild(txt);
      card.addEventListener('mouseenter',()=>{ if(!card.dataset.placed) card.style.transform='scale(1.07)'; });
      card.addEventListener('mouseleave',()=>{ card.style.transform=''; });
      card.addEventListener('dragstart', e=>{ draggedCard=e.currentTarget; e.currentTarget.style.opacity='.5'; e.dataTransfer.effectAllowed='move'; });
      srcRow.appendChild(card); cards.push(card);
    }

    for (let i=0;i<N;i++) {
      const slot=document.createElement('div');
      slot.dataset.slot=i+1;
      slot.style.cssText='width:100px;height:72px;border-radius:12px;border:2px dashed #46f0c044;background:#002020;display:flex;align-items:center;justify-content:center;font-size:20px;color:#46f0c044;font-weight:700;transition:border-color .2s,background .2s;';
      slot.textContent=i+1;
      slot.addEventListener('dragover',e=>{ e.preventDefault(); if(!slot.dataset.filled){slot.style.borderColor='#46f0c0';slot.style.background='#004040';} });
      slot.addEventListener('dragleave',()=>{ if(!slot.dataset.filled){slot.style.borderColor='#46f0c044';slot.style.background='#002020';} });
      slot.addEventListener('drop',e=>dropOn(e,slot,cards));
      dstRow.appendChild(slot);
    }
  }

  function addRow(parent) {
    const d=document.createElement('div');
    d.style.cssText='display:flex;gap:8px;flex-wrap:wrap;justify-content:center;';
    parent.appendChild(d); return d;
  }
  function addLabel(parent,text,size,color) {
    const d=document.createElement('div');
    d.style.cssText=`font-size:${size};color:${color};letter-spacing:1px;font-weight:700;text-transform:uppercase;`;
    d.textContent=text; parent.appendChild(d);
  }

  let draggedCard=null;
  function dropOn(e,slot,cards) {
    e.preventDefault();
    slot.style.borderColor='#46f0c044'; slot.style.background='#002020';
    if (!draggedCard||slot.dataset.filled) { if(draggedCard) draggedCard.style.opacity='1'; draggedCard=null; return; }
    draggedCard.style.opacity='1';
    const ok = parseInt(slot.dataset.slot)===parseInt(draggedCard.dataset.bib);
    if (ok) {
      slot.dataset.filled='1'; draggedCard.dataset.placed='1';
      draggedCard.draggable=false; draggedCard.style.cursor='default';
      slot.style.cssText=slot.style.cssText.replace('dashed','solid');
      slot.style.borderColor='#2ecc71'; slot.style.background='#002800';
      slot.innerHTML=''; slot.appendChild(draggedCard); sfx.pop();
      if (cards.filter(c=>c.dataset.placed==='1').length===N) setTimeout(winGame,400);
    } else {
      wrongAttempts++;
      draggedCard.style.animation='shake .35s ease';
      const dc=draggedCard;
      setTimeout(()=>{ if(dc) dc.style.animation=''; },400);
      slot.style.borderColor='#e74c3c';
      setTimeout(()=>{ slot.style.borderColor='#46f0c044'; slot.style.background='#002020'; },500);
      sfx.fail();
    }
    draggedCard=null;
  }

  function winGame() {
    sfx.win();
    const msg=document.createElement('div');
    msg.style.cssText='font-size:clamp(14px,3vw,24px);font-weight:700;color:#ffd700;text-align:center;letter-spacing:2px;animation:popIn .5s ease;margin-top:4px;';
    msg.textContent=FRAGMENTS.join(' '); phase2El.appendChild(msg);
    canvas.style.display='block'; canvas.style.pointerEvents='none';
    confetti.push(...makeConfetti(W()/2,H()/4),...makeConfetti(W()*.2,H()/3),...makeConfetti(W()*.8,H()/3));
    function cl(){ if(!confetti.length) return; const c=ctx(); c.clearRect(0,0,W(),H()); drawConf(c); raf=requestAnimationFrame(cl); }
    raf=requestAnimationFrame(cl);
    const stars=wrongAttempts===0?3:wrongAttempts<4?2:1;
    const coins=[0,20,40,60][stars];
    setTimeout(()=>showStarResult(root,{
      stars, coins, color:'#46f0c0',
      title:['','Reassembled!','Almost Perfect!','Flawless!'][stars],
      lines:[`Wrong placements: ${wrongAttempts}`,'💡 This is TCP/IP packet fragmentation & reassembly!','Data splits into packets, travels any path, then','arrives out-of-order and gets reassembled.'],
      onContinue:()=>{ cleanup(); onComplete(stars,coins); },
    }),1200);
  }

  function cleanup() { if(raf) cancelAnimationFrame(raf); raf=null; destroy(); }

  showLessonBanner(root, {
    concept: t('m10.concept'),
    detail: 'Large messages split into packets, travel different paths, then reassemble in order at the destination — that\'s TCP/IP.',
    color: '#00cec9',
  });

  showIntro(root, {
    emoji: '🏃',
    title: t('m10.title'),
    concept: t('m10.concept'),
    howto: t('m10.howto'),
    color: '#00cec9',
    onStart: () => {
      hud.setCenter('⏱ 15s  —  PACKET RACE');
      raf = requestAnimationFrame(raceLoop);
    },
  });
}
