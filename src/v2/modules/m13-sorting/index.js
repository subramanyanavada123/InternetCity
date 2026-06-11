import { makeGameShell, makeHUD, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';
import { t } from '../../shared/i18n.js';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 13 — SORTING RACE
// Concept: Algorithm complexity — O(n²) vs O(n log n).
// 5 algorithms race simultaneously on the same shuffled array.
// Player picks array type (random / nearly sorted / reversed) and watches.
// Wow moment: QuickSort destroys Bubble on random; they swap on sorted.
// ─────────────────────────────────────────────────────────────────────────────

const ALGOS = [
  { name: 'Bubble',    color: '#ff6b6b', fn: bubbleSteps },
  { name: 'Selection', color: '#ffa94d', fn: selectionSteps },
  { name: 'Insertion', color: '#ffd43b', fn: insertionSteps },
  { name: 'Merge',     color: '#69db7c', fn: mergeSteps },
  { name: 'Quick',     color: '#74c0fc', fn: quickSteps },
];

const N = 20;
const BAR_GAP = 2;
const STEPS_PER_SEC = 18;  // animation speed (comparisons/swaps shown per second)

// ── Step generators ──────────────────────────────────────────────────────────

function bubbleSteps(arr) {
  const a = [...arr], steps = [];
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < a.length - i - 1; j++) {
      steps.push({ type: 'cmp', i: j, j: j+1, arr: [...a] });
      if (a[j] > a[j+1]) { [a[j],a[j+1]] = [a[j+1],a[j]]; steps.push({ type: 'swap', i: j, j: j+1, arr: [...a] }); }
    }
  steps.push({ type: 'done', arr: [...a] });
  return steps;
}

function selectionSteps(arr) {
  const a = [...arr], steps = [];
  for (let i = 0; i < a.length; i++) {
    let m = i;
    for (let j = i+1; j < a.length; j++) {
      steps.push({ type: 'cmp', i: m, j, arr: [...a] });
      if (a[j] < a[m]) m = j;
    }
    if (m !== i) { [a[i],a[m]] = [a[m],a[i]]; steps.push({ type: 'swap', i, j: m, arr: [...a] }); }
  }
  steps.push({ type: 'done', arr: [...a] });
  return steps;
}

function insertionSteps(arr) {
  const a = [...arr], steps = [];
  for (let i = 1; i < a.length; i++) {
    let j = i;
    while (j > 0) {
      steps.push({ type: 'cmp', i: j-1, j, arr: [...a] });
      if (a[j] < a[j-1]) { [a[j],a[j-1]] = [a[j-1],a[j]]; steps.push({ type: 'swap', i: j, j: j-1, arr: [...a] }); j--; }
      else break;
    }
  }
  steps.push({ type: 'done', arr: [...a] });
  return steps;
}

function mergeSteps(arr) {
  const a = [...arr], steps = [];
  function merge(lo, hi) {
    if (hi - lo < 2) return;
    const mid = (lo + hi) >> 1;
    merge(lo, mid); merge(mid, hi);
    const tmp = a.slice(lo, hi);
    let l = 0, r = mid - lo, k = lo;
    while (l < mid - lo && r < hi - lo) {
      steps.push({ type: 'cmp', i: lo+l, j: lo+r, arr: [...a] });
      if (tmp[l] <= tmp[r]) a[k++] = tmp[l++];
      else a[k++] = tmp[r++];
      steps.push({ type: 'swap', i: k-1, j: -1, arr: [...a] });
    }
    while (l < mid - lo) { a[k++] = tmp[l++]; steps.push({ type: 'swap', i: k-1, j: -1, arr: [...a] }); }
    while (r < hi - lo) { a[k++] = tmp[r++]; steps.push({ type: 'swap', i: k-1, j: -1, arr: [...a] }); }
  }
  merge(0, a.length);
  steps.push({ type: 'done', arr: [...a] });
  return steps;
}

function quickSteps(arr) {
  const a = [...arr], steps = [];
  function qsort(lo, hi) {
    if (lo >= hi) return;
    const pivot = a[hi];
    let p = lo;
    for (let j = lo; j < hi; j++) {
      steps.push({ type: 'cmp', i: j, j: hi, arr: [...a] });
      if (a[j] <= pivot) { [a[p],a[j]] = [a[j],a[p]]; steps.push({ type: 'swap', i: p, j, arr: [...a] }); p++; }
    }
    [a[p],a[hi]] = [a[hi],a[p]]; steps.push({ type: 'swap', i: p, j: hi, arr: [...a] });
    qsort(lo, p-1); qsort(p+1, hi);
  }
  qsort(0, a.length - 1);
  steps.push({ type: 'done', arr: [...a] });
  return steps;
}

// ── Array generators ─────────────────────────────────────────────────────────

function randomArr()    { return Array.from({length:N}, (_,i)=>i+1).sort(()=>Math.random()-0.5); }
function sortedArr()    { return Array.from({length:N}, (_,i)=>i+1); }
function reversedArr()  { return Array.from({length:N}, (_,i)=>N-i); }
function nearlySorted() {
  const a = Array.from({length:N}, (_,i)=>i+1);
  for (let k=0;k<3;k++) { const i=Math.floor(Math.random()*N),j=Math.floor(Math.random()*N); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

const ARRAY_TYPES = [
  { key: 'random',   label: '🎲 Random',        gen: randomArr    },
  { key: 'sorted',   label: '✅ Nearly Sorted',  gen: nearlySorted },
  { key: 'reversed', label: '🔄 Reversed',       gen: reversedArr  },
];

export function launch(app, state, onComplete) {
  const shell = makeGameShell(app, { bgColor: '#0d0d1a' });
  const { root, canvas, ctx: getCtx, W, H, destroy, canvasXY } = shell;
  const hud = makeHUD(root, { color: '#74c0fc' });

  const backBtn = document.createElement('button');
  backBtn.style.cssText = `position:absolute;top:8px;left:16px;z-index:70;
    background:rgba(0,0,0,0.5);border:1px solid #74c0fc66;border-radius:10px;
    color:#74c0fc;font-size:13px;font-weight:700;cursor:pointer;
    padding:6px 12px;font-family:inherit;`;
  backBtn.textContent = t('btn.back');
  backBtn.addEventListener('click', () => { cleanup(); onComplete(0,0); });
  root.appendChild(backBtn);

  // ── State ──────────────────────────────────────────────────────────────────
  let racers = [];       // { steps[], stepIdx, arr[], done, ops }
  let running = false;
  let ended   = false;
  let t_acc   = 0;
  let lastNow = null, rafId = null;
  let winner  = null;
  let arrayType = 0;   // index into ARRAY_TYPES
  let roundsDone = 0;
  let totalStars = 0;

  // ── UI controls ──────────────────────────────────────────────────────────
  const ctrlRow = document.createElement('div');
  ctrlRow.style.cssText = `
    position:absolute;bottom:12px;left:0;right:0;
    display:flex;justify-content:center;gap:8px;z-index:60;flex-wrap:wrap;padding:0 8px;
  `;
  root.appendChild(ctrlRow);

  function buildControls() {
    ctrlRow.innerHTML = '';
    ARRAY_TYPES.forEach((at, idx) => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        padding:8px 14px;border-radius:10px;border:2px solid;font-size:13px;
        font-weight:700;cursor:pointer;font-family:inherit;min-height:44px;
        background:${idx===arrayType?'rgba(116,192,252,0.2)':'rgba(0,0,0,0.4)'};
        border-color:${idx===arrayType?'#74c0fc':'#444'};
        color:${idx===arrayType?'#74c0fc':'#888'};
      `;
      btn.textContent = at.label;
      btn.addEventListener('click', () => {
        if (running) return;
        arrayType = idx;
        buildControls();
        initRace();
      });
      ctrlRow.appendChild(btn);
    });

    if (!running && !ended) {
      const go = document.createElement('button');
      go.style.cssText = `
        padding:8px 20px;border-radius:10px;border:2px solid #69db7c;
        background:rgba(105,219,124,0.2);color:#69db7c;
        font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;min-height:44px;
      `;
      go.textContent = '▶ RACE!';
      go.addEventListener('click', startRace);
      ctrlRow.appendChild(go);
    }
  }

  function initRace() {
    cancelAnimationFrame(rafId);
    running = false;
    winner = null;
    const src = ARRAY_TYPES[arrayType].gen();
    racers = ALGOS.map(a => ({
      name: a.name, color: a.color,
      steps: a.fn(src),
      stepIdx: 0,
      arr: [...src],
      done: false,
      ops: 0,
      finishOps: 0,
      place: 0,
    }));
    t_acc = 0;
    lastNow = null;
  }

  function startRace() {
    if (running) return;
    running = true;
    buildControls();
    lastNow = null;
    rafId = requestAnimationFrame(loop);
  }

  initRace();
  buildControls();

  // ── Update ─────────────────────────────────────────────────────────────────
  let finishCount = 0;

  function update(dt) {
    if (!running) return;
    t_acc += dt * STEPS_PER_SEC;
    const steps = Math.floor(t_acc);
    t_acc -= steps;

    for (let s = 0; s < steps; s++) {
      let allDone = true;
      racers.forEach(r => {
        if (r.done) return;
        allDone = false;
        if (r.stepIdx < r.steps.length) {
          const step = r.steps[r.stepIdx++];
          r.arr = step.arr;
          if (step.type !== 'done') r.ops++;
          if (step.type === 'done') {
            r.done = true;
            r.finishOps = r.ops;
            finishCount++;
            r.place = finishCount;
            if (!winner) {
              winner = r;
              sfx.win();
            } else {
              sfx.pop();
            }
          }
        }
      });
      if (allDone || racers.every(r => r.done)) {
        running = false;
        setTimeout(() => endRound(), 800);
        break;
      }
    }
  }

  function endRound() {
    if (ended) return;
    roundsDone++;
    const w = racers.find(r => r.place === 1);
    const sorted = [...racers].sort((a,b)=>a.place-b.place);
    const stars = roundsDone >= 3 ? 3 : roundsDone >= 2 ? 2 : 1;
    totalStars = Math.max(totalStars, stars);
    const coins = [0,20,40,80][stars];

    sfx.win();
    showStarResult(root, {
      stars: totalStars,
      color: '#74c0fc',
      title: `🏆 ${w?.name} Wins!`,
      lines: [
        `Array: ${ARRAY_TYPES[arrayType].label}`,
        '─────────────────────────────',
        ...sorted.map(r => `${r.place}. ${r.name}: ${r.finishOps} ops`),
        '─────────────────────────────',
        `💡 O(n²): Bubble/Selection/Insertion`,
        `⚡ O(n log n): Merge/Quick`,
        `Try all 3 array types for 3 ⭐!`,
      ],
      coins,
      onContinue: (choice) => {
        if (choice === 'retry' && roundsDone < 3) {
          // remove result overlay and continue
          root.querySelectorAll('.star-result').forEach(el => el.remove());
          ended = false;
          arrayType = (arrayType + 1) % ARRAY_TYPES.length;
          initRace();
          buildControls();
        } else {
          cleanup();
          onComplete(totalStars, coins);
        }
      },
    });
    ended = true;
  }

  // ── Draw ───────────────────────────────────────────────────────────────────
  function draw() {
    const ctx = getCtx();
    const w = W(), h = H();
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, w, h);

    const topPad   = 52;
    const botPad   = 70;
    const laneH    = (h - topPad - botPad) / ALGOS.length;
    const barW     = (w - 40) / N;
    const maxVal   = N;

    racers.forEach((r, ri) => {
      const laneY = topPad + ri * laneH;
      const laneBot = laneY + laneH - 6;
      const barMaxH = laneH - 28;

      // lane background
      ctx.fillStyle = r.done ? `${r.color}18` : 'rgba(255,255,255,0.03)';
      ctx.beginPath();
      ctx.roundRect(16, laneY, w - 32, laneH - 4, 6);
      ctx.fill();

      // bars
      const step = r.stepIdx > 0 ? r.steps[r.stepIdx - 1] : null;
      r.arr.forEach((val, i) => {
        const bh = (val / maxVal) * barMaxH;
        const bx = 20 + i * barW + BAR_GAP;
        const by = laneBot - bh;
        const bwInner = barW - BAR_GAP * 2;

        let color = r.color + '99';
        if (step && !r.done) {
          if (step.i === i || step.j === i) color = '#ffffff';
        }
        if (r.done) color = r.color;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(bx, by, Math.max(1, bwInner), bh, 2);
        ctx.fill();
      });

      // label
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = r.done ? r.color : '#aaa';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const label = r.done
        ? `${r.place === 1 ? '🏆' : r.place + '.'} ${r.name}: ${r.finishOps} ops`
        : `${r.name}: ${r.ops} ops`;
      ctx.fillText(label, 22, laneY + 4);

      // finish line glow
      if (r.done && r.place === 1) {
        ctx.save();
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 14;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(16, laneY, w - 32, laneH - 4, 6);
        ctx.stroke();
        ctx.restore();
      }
    });

    // HUD
    const at = ARRAY_TYPES[arrayType];
    hud.setCenter(running
      ? `⚡ Racing — ${at.label}`
      : winner
        ? `🏆 Winner: ${winner.name} — pick next type!`
        : `Pick array type → RACE`);
    hud.setRight(`Round ${Math.min(roundsDone+1,3)}/3`);
  }

  // ── Loop ──────────────────────────────────────────────────────────────────
  function loop(now) {
    if (lastNow === null) lastNow = now;
    const dt = Math.min((now - lastNow) / 1000, 0.05);
    lastNow = now;
    update(dt);
    draw();
    if (running) rafId = requestAnimationFrame(loop);
    else if (!ended) { draw(); }
  }

  // Run draw loop even when not racing (for static display)
  function idleLoop(now) {
    if (running) return;
    draw();
    rafId = requestAnimationFrame(idleLoop);
  }
  rafId = requestAnimationFrame(idleLoop);

  function cleanup() {
    cancelAnimationFrame(rafId);
    canvas.removeEventListener('click', onTap);
    destroy();
  }

  const onTap = (e) => {
    if (!running && !ended) startRace();
  };
  canvas.addEventListener('click', onTap);
  canvas.addEventListener('touchend', e => { e.preventDefault(); onTap(e); }, { passive: false });

  showLessonBanner(root, {
    concept: t('m13.title'),
    detail: t('m13.banner'),
    color: '#74c0fc',
  });

  showIntro(root, {
    emoji: '🏎️',
    title: t('m13.title'),
    concept: t('m13.concept'),
    howto: t('m13.howto'),
    color: '#74c0fc',
    onStart: () => { cancelAnimationFrame(rafId); buildControls(); rafId = requestAnimationFrame(idleLoop); },
  });
}
