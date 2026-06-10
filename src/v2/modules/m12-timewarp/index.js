import { makeGameShell, makeHUD, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';

const CONTINENTS = [
  [[0.04,0.22],[0.18,0.18],[0.27,0.20],[0.30,0.28],[0.28,0.38],[0.22,0.45],[0.18,0.52],[0.12,0.55],[0.06,0.50],[0.04,0.42],[0.02,0.32]],
  [[0.40,0.22],[0.48,0.20],[0.55,0.22],[0.57,0.30],[0.53,0.35],[0.48,0.36],[0.42,0.33],[0.39,0.27]],
  [[0.55,0.18],[0.72,0.15],[0.88,0.18],[0.92,0.28],[0.90,0.38],[0.85,0.44],[0.78,0.48],[0.70,0.50],[0.62,0.48],[0.58,0.40],[0.55,0.30]],
  [[0.46,0.44],[0.52,0.42],[0.56,0.46],[0.57,0.56],[0.53,0.65],[0.48,0.68],[0.44,0.65],[0.42,0.55],[0.43,0.47]],
  [[0.24,0.55],[0.30,0.53],[0.34,0.58],[0.33,0.68],[0.28,0.74],[0.22,0.72],[0.20,0.64],[0.21,0.57]],
  [[0.80,0.62],[0.88,0.60],[0.92,0.65],[0.91,0.72],[0.84,0.74],[0.78,0.70],[0.78,0.64]],
];
const CITIES = [
  { name:'New York',  fx:0.18, fy:0.35, color:'#74b9ff' },
  { name:'London',    fx:0.45, fy:0.28, color:'#ffd700' },
  { name:'Paris',     fx:0.47, fy:0.30, color:'#fd79a8' },
  { name:'Tokyo',     fx:0.82, fy:0.33, color:'#ff9f43' },
  { name:'Sydney',    fx:0.83, fy:0.70, color:'#55efc4' },
  { name:'Mumbai',    fx:0.65, fy:0.45, color:'#ff7675' },
  { name:'Cairo',     fx:0.52, fy:0.45, color:'#fdcb6e' },
  { name:'São Paulo', fx:0.28, fy:0.62, color:'#a29bfe' },
  { name:'Lagos',     fx:0.46, fy:0.52, color:'#e17055' },
  { name:'Beijing',   fx:0.78, fy:0.30, color:'#00cec9' },
];
const ROUNDS = [
  { hops:2, target:2000, boosters:1 },
  { hops:3, target:1800, boosters:2 },
  { hops:4, target:1500, boosters:3 },
];
const BG_STARS = Array.from({length:180}, () => ({
  fx:Math.random(), fy:Math.random(), r:Math.random()*1.2+0.3, a:0.4+Math.random()*0.6,
}));

export function launch(app, state, onComplete) {
  const shell = makeGameShell(app, { bgColor: '#05050f' });
  const { root, canvas, ctx, W, H, destroy, canvasXY } = shell;
  const hud = makeHUD(root, { color: '#a29bfe' });

  const backBtn = document.createElement('button');
  backBtn.style.cssText = `position:absolute;top:8px;left:16px;z-index:70;
    background:rgba(0,0,0,0.5);border:1px solid #a29bfe66;border-radius:10px;
    color:#a29bfe;font-size:13px;font-weight:700;cursor:pointer;padding:6px 12px;font-family:inherit;`;
  backBtn.textContent = '← Missions';
  backBtn.addEventListener('click', () => { cleanup(); onComplete(0, 0); });
  root.appendChild(backBtn);

  let roundIdx=0, roundsWon=0, raf=null, phase='setup';
  let sourceIdx=0, destIdx=0, route=[], boosters=[], boostersLeft=0;
  let signal=null, elapsedMs=0, flashAlpha=0, flashColor='#fff', dashOffset=0;

  const cfg = () => ROUNDS[roundIdx];
  const cityX = i => CITIES[i].fx * W();
  const cityY = i => CITIES[i].fy * H();

  function initRound() {
    boostersLeft = cfg().boosters;
    route = []; boosters = []; signal = null;
    elapsedMs = 0; flashAlpha = 0; phase = 'setup';
    sourceIdx = Math.floor(Math.random() * CITIES.length);
    let farthest = 0, maxDist = 0;
    for (let i = 0; i < CITIES.length; i++) {
      if (i === sourceIdx) continue;
      const d = Math.hypot(CITIES[i].fx - CITIES[sourceIdx].fx, CITIES[i].fy - CITIES[sourceIdx].fy);
      if (d > maxDist) { maxDist = d; farthest = i; }
    }
    destIdx = farthest;
    route = [sourceIdx];
    updateHUD();
  }

  function updateHUD() {
    hud.setLeft(`Round ${roundIdx+1}/3 | 📡 ${CITIES[sourceIdx].name} → 🎯 ${CITIES[destIdx].name}`);
    hud.setCenter(phase==='sending'
      ? `<span style="color:#ffd700">${Math.round(elapsedMs)}ms</span>`
      : `Target: <span style="color:#ffd700">${cfg().target}ms</span>`);
    hud.setRight(`⚡: ${'⚡'.repeat(boostersLeft)}${'·'.repeat(Math.max(0,cfg().boosters-boostersLeft))}`);
  }

  function segSpeed(seg) {
    const ax=cityX(route[seg]), ay=cityY(route[seg]);
    const bx=cityX(route[seg+1]), by=cityY(route[seg+1]);
    const mx=(ax+bx)/2, my=(ay+by)/2;
    return boosters.some(b => Math.hypot(b.x-mx, b.y-my) < Math.hypot(bx-ax,by-ay)*0.6) ? 300 : 200;
  }

  function showMsg(txt, col) {
    const el = document.createElement('div');
    el.style.cssText = `position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
      color:${col};font-size:22px;font-weight:700;pointer-events:none;z-index:80;
      text-shadow:0 0 20px ${col};font-family:inherit;`;
    el.textContent = txt;
    root.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }

  function handleCityClick(i) {
    if (i === sourceIdx || route[route.length-1] === i) return;
    if (route.includes(i) && i !== destIdx) return;
    if (phase === 'setup') phase = 'routing';
    route.push(i);
    updateHUD();
    if (i === destIdx) {
      if (route.length - 1 >= cfg().hops) {
        phase = 'sending'; elapsedMs = 0;
        signal = { segIdx:0, t:0, active:true };
        sfx.launch(); updateHUD();
      } else {
        route.pop();
        showMsg(`Need ${cfg().hops}+ hops!`, '#ff7675');
      }
    }
  }

  canvas.style.cursor = 'crosshair';
  function onCanvasClick(e) {
    if (phase !== 'routing' && phase !== 'setup') return;
    const { x: mx, y: my } = canvasXY(e);
    for (let i = 0; i < CITIES.length; i++) {
      if (Math.hypot(mx - cityX(i), my - cityY(i)) < 26) { handleCityClick(i); sfx.click(); return; }
    }
    if (boostersLeft > 0 && phase === 'routing') {
      boosters.push({x:mx, y:my}); boostersLeft--; sfx.pop(); updateHUD();
    }
  }
  canvas.addEventListener('click', onCanvasClick);

  function finishRound(won) {
    if (roundIdx < 2) { roundIdx++; initRound(); return; }
    const stars = roundsWon === 3 ? 3 : roundsWon >= 2 ? 2 : 1;
    const coins = stars * 15;
    cleanup();
    showStarResult(app, {
      stars, maxStars:3,
      title: stars===3 ? 'Speed of Light!' : stars===2 ? 'Fast Signal' : 'Signal Sent',
      lines: [`Rounds beaten: ${roundsWon}/3`, 'Latency · Propagation Delay · Repeaters'],
      coins, color:'#a29bfe',
      onContinue: s => onComplete(s, coins),
    });
  }

  let last = 0;
  function loop(ts) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min((ts - last) / 1000, 0.05);
    last = ts;
    dashOffset -= dt * 60;
    if (flashAlpha > 0) flashAlpha -= dt * 2;

    if (phase === 'sending' && signal?.active) {
      elapsedMs += dt * 1000;
      updateHUD();
      const nodes = route.map(i => ({x:cityX(i), y:cityY(i)}));
      const seg = signal.segIdx;
      if (seg < nodes.length - 1) {
        const len = Math.hypot(nodes[seg+1].x-nodes[seg].x, nodes[seg+1].y-nodes[seg].y);
        signal.t += (segSpeed(seg) * dt) / len;
        if (signal.t >= 1) {
          signal.segIdx++; signal.t = 0; sfx.swipe();
          if (signal.segIdx >= nodes.length - 1) {
            signal.active = false;
            const won = elapsedMs <= cfg().target;
            flashColor = won ? '#a29bfe' : '#ff3333'; flashAlpha = 1;
            if (won) { sfx.win(); showMsg(`Arrived in ${Math.round(elapsedMs)}ms! ✓`, '#a29bfe'); roundsWon++; }
            else     { sfx.fail(); showMsg(`Too slow! ${Math.round(elapsedMs)}ms`, '#ff7675'); }
            phase = 'result';
            setTimeout(() => finishRound(won), 2200);
          }
        }
      }
    }
    draw();
  }

  function draw() {
    const c = ctx(), w = W(), h = H();
    c.clearRect(0, 0, w, h);
    c.fillStyle = '#05050f'; c.fillRect(0, 0, w, h);

    for (const s of BG_STARS) {
      c.globalAlpha = s.a; c.fillStyle = '#fff';
      c.beginPath(); c.arc(s.fx*w, s.fy*h, s.r, 0, Math.PI*2); c.fill();
    }
    c.globalAlpha = 1;

    c.fillStyle = '#1a2a1a'; c.strokeStyle = '#2a3a2a'; c.lineWidth = 1;
    for (const poly of CONTINENTS) {
      c.beginPath();
      poly.forEach(([fx,fy],i) => i===0 ? c.moveTo(fx*w,fy*h) : c.lineTo(fx*w,fy*h));
      c.closePath(); c.fill(); c.stroke();
    }

    if (route.length >= 2) {
      c.save(); c.strokeStyle='#a29bfe'; c.lineWidth=2;
      c.setLineDash([8,6]); c.lineDashOffset=dashOffset; c.globalAlpha=0.7;
      c.beginPath();
      for (let i=0; i<route.length-1; i++) {
        c.moveTo(cityX(route[i]), cityY(route[i]));
        c.lineTo(cityX(route[i+1]), cityY(route[i+1]));
      }
      c.stroke(); c.setLineDash([]); c.globalAlpha=1; c.restore();
    }

    for (const b of boosters) {
      c.save(); c.shadowColor='#a29bfe'; c.shadowBlur=18;
      c.font='18px serif'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('⚡', b.x, b.y);
      c.globalAlpha=0.22; c.fillStyle='#a29bfe';
      c.beginPath(); c.arc(b.x,b.y,14,0,Math.PI*2); c.fill();
      c.globalAlpha=1; c.restore();
    }

    const t = performance.now() / 1000;
    for (let i = 0; i < CITIES.length; i++) {
      const city=CITIES[i], cx2=cityX(i), cy2=cityY(i);
      const isSrc=i===sourceIdx, isDst=i===destIdx, inR=route.includes(i);
      c.save();
      if (inR||isSrc||isDst) { c.shadowColor=city.color; c.shadowBlur=isDst?24:14; }
      if (isSrc) {
        const p=(Math.sin(t*3)+1)/2;
        c.beginPath(); c.arc(cx2,cy2,14+p*10,0,Math.PI*2);
        c.strokeStyle='#fff'; c.globalAlpha=0.4-p*0.3; c.lineWidth=2; c.stroke(); c.globalAlpha=1;
      }
      if (isDst) {
        const p=(Math.sin(t*2.5+1)+1)/2;
        c.beginPath(); c.arc(cx2,cy2,16+p*8,0,Math.PI*2);
        c.strokeStyle='#ffd700'; c.globalAlpha=0.5-p*0.3; c.lineWidth=2; c.stroke(); c.globalAlpha=1;
      }
      c.fillStyle=city.color; c.beginPath(); c.arc(cx2,cy2,8,0,Math.PI*2); c.fill();
      const rp=route.indexOf(i);
      if (rp>=0) { c.fillStyle='#fff'; c.font='bold 9px monospace'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(rp+1,cx2,cy2); }
      c.shadowBlur=0; c.restore();
      c.fillStyle=inR?'#fff':'#8899aa'; c.font=(inR?'bold ':'')+'11px monospace';
      c.textAlign='center'; c.textBaseline='top'; c.fillText(city.name,cx2,cy2+11);
      if (isSrc||isDst) { c.font='14px serif'; c.textBaseline='bottom'; c.fillText(isSrc?'📡':'🎯',cx2,cy2-10); }
    }

    if (phase==='sending' && signal?.active) {
      const nodes=route.map(i=>({x:cityX(i),y:cityY(i)}));
      const seg=signal.segIdx;
      if (seg < nodes.length-1) {
        const a=nodes[seg], b=nodes[seg+1];
        const px=a.x+(b.x-a.x)*signal.t, py=a.y+(b.y-a.y)*signal.t;
        c.save(); c.shadowColor='#fff'; c.shadowBlur=22; c.fillStyle='#fff';
        c.beginPath(); c.arc(px,py,6,0,Math.PI*2); c.fill();
        for (let tr=1;tr<=4;tr++) {
          const f=signal.t-tr*0.04; if(f<0) break;
          c.globalAlpha=0.12*(5-tr)/5;
          c.beginPath(); c.arc(a.x+(b.x-a.x)*f, a.y+(b.y-a.y)*f, 6-tr, 0, Math.PI*2); c.fill();
        }
        c.globalAlpha=1; c.restore();
      }
    }

    if (flashAlpha > 0) {
      c.globalAlpha=flashAlpha*0.35; c.fillStyle=flashColor; c.fillRect(0,0,w,h); c.globalAlpha=1;
    }

    if (phase==='setup'||phase==='routing') {
      const needed=cfg().hops, chosen=route.length-1;
      const msg = phase==='setup'
        ? `Click cities to route signal (need ${needed}+ hops to ${CITIES[destIdx].name})`
        : chosen<needed
          ? `Add ${needed-chosen} more hop${needed-chosen>1?'s':''}… then click ${CITIES[destIdx].name}`
          : `Now click ${CITIES[destIdx].name} to send!`;
      c.fillStyle='rgba(0,0,0,0.55)'; c.fillRect(0,h-36,w,36);
      c.fillStyle='#a29bfe'; c.font='13px monospace'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(msg,w/2,h-18);
    }
  }

  function cleanup() {
    if (raf) cancelAnimationFrame(raf);
    canvas.removeEventListener('click', onCanvasClick);
    destroy();
  }

  showLessonBanner(root, {
    concept: 'Latency & Propagation Delay',
    detail: 'Signal speed is limited by physics. Longer cables = more delay. Routing via closer nodes reduces latency.',
    color: '#a29bfe',
  });

  showIntro(root, {
    emoji: '⏱️',
    title: 'Time Traveler',
    concept: 'Latency is the time data takes to travel. Distance matters! Routing through nearby servers reduces delay.',
    howto: 'Select cities to route your signal. Avoid long hops — the shorter your path, the lower the latency!',
    color: '#a29bfe',
    onStart: () => {
      initRound();
      last = performance.now();
      raf = requestAnimationFrame(loop);
    },
  });
}
