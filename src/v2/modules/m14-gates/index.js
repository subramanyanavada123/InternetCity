import { makeGameShell, makeHUD, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';
import { t } from '../../shared/i18n.js';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 14 — LOGIC GATES CITY
// Concept: Boolean logic — AND/OR/NOT/XOR gates are the building blocks of all
// computers. Players drag wires to connect inputs → gates → output bulb.
// Levels: NOT, AND, OR, XOR, Half Adder, Full Adder
// Wow: "You just built what's inside a CPU!"
// ─────────────────────────────────────────────────────────────────────────────

const GATE_R  = 28;   // gate circle radius
const WIRE_HIT = 18;  // px for wire hit detection
const NODE_R  = 10;   // input/output node radius

// Truth tables for each gate type
const TRUTH = {
  NOT:  (a)       => a ? 0 : 1,
  AND:  (a, b)    => (a && b) ? 1 : 0,
  OR:   (a, b)    => (a || b) ? 1 : 0,
  XOR:  (a, b)    => (a !== b) ? 1 : 0,
  NAND: (a, b)    => !(a && b) ? 1 : 0,
};

// Each level: switches (inputs), gates, target output, explanation
const LEVELS = [
  {
    name: 'NOT Gate',
    goal: 'Wire the switch through the NOT gate to flip the light.',
    switches: [{ id:'A', val:1, label:'A' }],
    gates: [{ id:'g1', type:'NOT', x:0.5, y:0.5 }],
    wires: [],   // player builds these
    target: [    // required connections for win
      { from:'A', to:'g1.in0' },
      { from:'g1.out', to:'OUT' },
    ],
    explain: 'NOT flips 1→0 and 0→1. A transistor switching off = NOT.',
  },
  {
    name: 'AND Gate',
    goal: 'Both switches ON → light ON. Wire A and B through AND.',
    switches: [{ id:'A', val:1, label:'A' }, { id:'B', val:1, label:'B' }],
    gates: [{ id:'g1', type:'AND', x:0.5, y:0.5 }],
    target: [
      { from:'A', to:'g1.in0' },
      { from:'B', to:'g1.in1' },
      { from:'g1.out', to:'OUT' },
    ],
    explain: 'AND = 1 only when ALL inputs are 1. Used in CPU condition checks.',
  },
  {
    name: 'OR Gate',
    goal: 'EITHER switch ON → light ON. Wire through OR.',
    switches: [{ id:'A', val:1, label:'A' }, { id:'B', val:0, label:'B' }],
    gates: [{ id:'g1', type:'OR', x:0.5, y:0.5 }],
    target: [
      { from:'A', to:'g1.in0' },
      { from:'B', to:'g1.in1' },
      { from:'g1.out', to:'OUT' },
    ],
    explain: 'OR = 1 when ANY input is 1. Used in error detection circuits.',
  },
  {
    name: 'XOR Gate',
    goal: 'EXACTLY ONE switch ON → light ON. Wire through XOR.',
    switches: [{ id:'A', val:1, label:'A' }, { id:'B', val:0, label:'B' }],
    gates: [{ id:'g1', type:'XOR', x:0.5, y:0.5 }],
    target: [
      { from:'A', to:'g1.in0' },
      { from:'B', to:'g1.in1' },
      { from:'g1.out', to:'OUT' },
    ],
    explain: 'XOR = 1 when inputs DIFFER. The key gate in binary addition!',
  },
  {
    name: 'Half Adder',
    goal: 'Build a 1-bit adder: Sum = A XOR B, Carry = A AND B.',
    switches: [{ id:'A', val:1, label:'A' }, { id:'B', val:1, label:'B' }],
    gates: [
      { id:'gX', type:'XOR', x:0.45, y:0.38 },
      { id:'gA', type:'AND', x:0.45, y:0.65 },
    ],
    target: [
      { from:'A', to:'gX.in0' }, { from:'B', to:'gX.in1' },
      { from:'A', to:'gA.in0' }, { from:'B', to:'gA.in1' },
      { from:'gX.out', to:'SUM' },
      { from:'gA.out', to:'CARRY' },
    ],
    explain: 'Half Adder adds two bits. 1+1=10 in binary: Sum=0, Carry=1. This is inside every CPU!',
  },
];

export function launch(app, state, onComplete) {
  const shell = makeGameShell(app, { bgColor: '#0a0a1a' });
  const { root, canvas, ctx: getCtx, W, H, destroy, canvasXY } = shell;
  const hud = makeHUD(root, { color: '#ffd43b' });

  const backBtn = document.createElement('button');
  backBtn.style.cssText = `position:absolute;top:8px;left:16px;z-index:70;
    background:rgba(0,0,0,0.5);border:1px solid #ffd43b66;border-radius:10px;
    color:#ffd43b;font-size:13px;font-weight:700;cursor:pointer;
    padding:6px 12px;font-family:inherit;`;
  backBtn.textContent = t('btn.back');
  backBtn.addEventListener('click', () => { cleanup(); onComplete(0, 0); });
  root.appendChild(backBtn);

  // ── Level state ───────────────────────────────────────────────────────────
  let levelIdx = 0;
  let wires    = [];     // { from, to } completed connections
  let dragging = null;   // { fromId, x, y } — current wire being drawn
  let switches = [];     // runtime copy of level switches with positions
  let gates    = [];     // runtime copy with positions
  let outputs  = [];     // output nodes (OUT / SUM / CARRY)
  let flashMsg = '';
  let flashT   = 0;
  let ended    = false;
  let stars    = 0;
  let rafId    = null;
  let lastNow  = null;

  function loadLevel(idx) {
    wires = [];
    dragging = null;
    const lv = LEVELS[idx];
    const w = W(), h = H();

    // Position switches on the left
    switches = lv.switches.map((sw, i) => ({
      ...sw,
      x: w * 0.12,
      y: h * (0.3 + i * 0.22),
    }));

    // Position gates (use fractional from level)
    gates = lv.gates.map(g => ({
      ...g,
      x: g.x * w,
      y: g.y * h,
    }));

    // Position output nodes — SUM/CARRY on right
    const outNames = lv.target.filter(t => ['OUT','SUM','CARRY'].includes(t.to)).map(t => t.to);
    const uniqueOuts = [...new Set(outNames)];
    outputs = uniqueOuts.map((name, i) => ({
      id: name,
      x: w * 0.88,
      y: h * (0.35 + i * 0.22),
      val: 0,
    }));
  }

  loadLevel(0);

  // ── Evaluate circuit ──────────────────────────────────────────────────────
  function evalCircuit() {
    // Compute signal at each node by following wires
    const sig = {};
    switches.forEach(sw => { sig[sw.id] = sw.val; });

    // Propagate through gates (one pass — no cycles)
    let changed = true;
    let iters = 0;
    while (changed && iters++ < 20) {
      changed = false;
      gates.forEach(g => {
        const in0wire = wires.find(w => w.to === `${g.id}.in0`);
        const in1wire = wires.find(w => w.to === `${g.id}.in1`);
        const a = in0wire ? sig[in0wire.from] : undefined;
        const b = in1wire ? sig[in1wire.from] : undefined;
        let out;
        if (g.type === 'NOT') out = (a !== undefined) ? TRUTH.NOT(a) : undefined;
        else out = (a !== undefined && b !== undefined) ? TRUTH[g.type](a, b) : undefined;
        if (out !== undefined && sig[`${g.id}.out`] !== out) { sig[`${g.id}.out`] = out; changed = true; }
      });
    }

    // Compute output nodes
    outputs.forEach(o => {
      const wire = wires.find(w => w.to === o.id);
      o.val = wire ? (sig[wire.from] ?? 0) : 0;
    });

    return sig;
  }

  // Check win: all target connections are wired AND output signal matches expected
  function checkWin() {
    const lv = LEVELS[levelIdx];
    const allWired = lv.target.every(req =>
      wires.some(w => w.from === req.from && w.to === req.to)
    );
    return allWired;
  }

  function onWireComplete(fromId, toId) {
    // Prevent duplicate wires
    if (wires.some(w => w.from === fromId && w.to === toId)) return;
    // Each input pin accepts only one wire
    wires = wires.filter(w => w.to !== toId);
    wires.push({ from: fromId, to: toId });
    sfx.pop();

    if (checkWin()) {
      sfx.win();
      flashMsg = '✅ Circuit complete!';
      flashT = 2;
      setTimeout(() => advanceLevel(), 1200);
    }
  }

  function advanceLevel() {
    levelIdx++;
    if (levelIdx >= LEVELS.length) {
      ended = true;
      stars = 3;
      const coins = 100;
      showStarResult(root, {
        stars, color: '#ffd43b',
        title: '🏆 CPU Builder!',
        lines: [
          'You built every logic gate!',
          '─────────────────────────',
          '💡 NOT · AND · OR · XOR',
          '→ Half Adder = 1-bit CPU',
          '→ 32 adders = 32-bit CPU',
          '📱 Your phone has 15 billion gates!',
        ],
        coins,
        onContinue: (action) => { cleanup(); if(action!=='retry') onComplete(stars,coins); else launch(app,state,onComplete); },
      });
    } else {
      loadLevel(levelIdx);
      flashMsg = `Level ${levelIdx + 1}: ${LEVELS[levelIdx].name}`;
      flashT = 2;
    }
  }

  // ── Node position helpers ─────────────────────────────────────────────────
  function switchPos(sw)   { return { x: sw.x, y: sw.y }; }
  function gateInPos(g, i) {
    const dy = g.type === 'NOT' ? 0 : (i === 0 ? -14 : 14);
    return { x: g.x - GATE_R - 2, y: g.y + dy };
  }
  function gateOutPos(g)   { return { x: g.x + GATE_R + 2, y: g.y }; }
  function outputPos(o)    { return { x: o.x, y: o.y }; }

  // All connectable nodes
  function allNodes() {
    const nodes = [];
    switches.forEach(sw => nodes.push({ id: sw.id, ...switchPos(sw), kind:'out' }));
    gates.forEach(g => {
      const ins = g.type === 'NOT' ? 1 : 2;
      for (let i = 0; i < ins; i++) nodes.push({ id:`${g.id}.in${i}`, ...gateInPos(g,i), kind:'in' });
      nodes.push({ id:`${g.id}.out`, ...gateOutPos(g), kind:'out' });
    });
    outputs.forEach(o => nodes.push({ id: o.id, ...outputPos(o), kind:'in' }));
    return nodes;
  }

  function nearestNode(x, y, kind) {
    let best = null, bestD = NODE_R * 2.5;
    allNodes().filter(n => n.kind === kind).forEach(n => {
      const d = Math.hypot(n.x - x, n.y - y);
      if (d < bestD) { bestD = d; best = n; }
    });
    return best;
  }

  // ── Input ──────────────────────────────────────────────────────────────────
  let pointerDownPos = null;

  function onDown(e) {
    e.preventDefault();
    const { x, y } = canvasXY(e);
    pointerDownPos = { x, y };
    // Start wire drag from an output node (allow dragging from switch output too)
    const n = nearestNode(x, y, 'out');
    if (n) dragging = { fromId: n.id, x: n.x, y: n.y, curX: x, curY: y };
  }

  function onMove(e) {
    e.preventDefault();
    if (!dragging) return;
    const { x, y } = canvasXY(e);
    dragging.curX = x;
    dragging.curY = y;
  }

  function onUp(e) {
    e.preventDefault();
    const { x, y } = canvasXY(e);
    const moved = pointerDownPos ? Math.hypot(x - pointerDownPos.x, y - pointerDownPos.y) : 999;
    pointerDownPos = null;

    if (dragging) {
      if (moved > 8) {
        // Treat as wire drag completion
        const n = nearestNode(x, y, 'in');
        if (n) onWireComplete(dragging.fromId, n.id);
      } else {
        // Short tap: toggle switch if near one
        for (const sw of switches) {
          if (Math.hypot(sw.x - x, sw.y - y) < NODE_R + 10) {
            sw.val = sw.val ? 0 : 1;
            sfx.coin();
            break;
          }
        }
      }
      dragging = null;
    } else {
      // No drag started — short tap on switch toggles it
      if (moved <= 8) {
        for (const sw of switches) {
          if (Math.hypot(sw.x - x, sw.y - y) < NODE_R + 10) {
            sw.val = sw.val ? 0 : 1;
            sfx.coin();
            break;
          }
        }
      }
    }
  }

  canvas.addEventListener('mousedown', onDown);
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseup', onUp);
  canvas.addEventListener('touchstart', onDown, { passive: false });
  canvas.addEventListener('touchmove',  onMove, { passive: false });
  canvas.addEventListener('touchend',   onUp,   { passive: false });

  // ── Draw ───────────────────────────────────────────────────────────────────
  function drawGateShape(ctx, g) {
    const { x, y } = g;
    ctx.save();
    ctx.translate(x, y);

    const colors = { NOT:'#ff6b6b', AND:'#ffa94d', OR:'#69db7c', XOR:'#74c0fc', NAND:'#da77f2' };
    const col = colors[g.type] || '#aaa';

    // Gate body
    ctx.beginPath();
    if (g.type === 'NOT') {
      ctx.moveTo(-GATE_R, -GATE_R*0.6);
      ctx.lineTo(GATE_R*0.7, 0);
      ctx.lineTo(-GATE_R, GATE_R*0.6);
      ctx.closePath();
    } else if (g.type === 'AND' || g.type === 'NAND') {
      ctx.moveTo(-GATE_R, -GATE_R);
      ctx.lineTo(0, -GATE_R);
      ctx.arc(0, 0, GATE_R, -Math.PI/2, Math.PI/2);
      ctx.lineTo(-GATE_R, GATE_R);
      ctx.closePath();
    } else if (g.type === 'OR') {
      ctx.moveTo(-GATE_R, -GATE_R);
      ctx.quadraticCurveTo(0, -GATE_R, GATE_R, 0);
      ctx.quadraticCurveTo(0, GATE_R, -GATE_R, GATE_R);
      ctx.quadraticCurveTo(-GATE_R*0.4, 0, -GATE_R, -GATE_R);
    } else if (g.type === 'XOR') {
      ctx.moveTo(-GATE_R*0.8, -GATE_R);
      ctx.quadraticCurveTo(0, -GATE_R, GATE_R, 0);
      ctx.quadraticCurveTo(0, GATE_R, -GATE_R*0.8, GATE_R);
      ctx.quadraticCurveTo(-GATE_R*0.2, 0, -GATE_R*0.8, -GATE_R);
    }

    ctx.fillStyle = col + '33';
    ctx.fill();
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Label
    ctx.fillStyle = col;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(g.type, 0, 0);

    // NOT bubble
    if (g.type === 'NOT') {
      ctx.beginPath();
      ctx.arc(GATE_R*0.7 + 5, 0, 5, 0, Math.PI*2);
      ctx.fillStyle = col + '33'; ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth=2; ctx.stroke();
    }
    ctx.restore();
  }

  function draw() {
    const ctx = getCtx();
    const w = W(), h = H();
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);

    const sig = evalCircuit();

    // Draw completed wires
    wires.forEach(wire => {
      const fromNode = allNodes().find(n => n.id === wire.from);
      const toNode   = allNodes().find(n => n.id === wire.to);
      if (!fromNode || !toNode) return;
      const val = sig[wire.from];
      const col = val ? '#69db7c' : '#555';
      ctx.save();
      ctx.strokeStyle = col;
      ctx.lineWidth = val ? 3 : 2;
      if (val) { ctx.shadowColor = '#69db7c'; ctx.shadowBlur = 8; }
      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      const mx = (fromNode.x + toNode.x) / 2;
      ctx.bezierCurveTo(mx, fromNode.y, mx, toNode.y, toNode.x, toNode.y);
      ctx.stroke();
      ctx.restore();
    });

    // Draw in-progress wire
    if (dragging) {
      const fromNode = allNodes().find(n => n.id === dragging.fromId);
      if (fromNode) {
        ctx.save();
        ctx.strokeStyle = '#ffd43b88';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(dragging.curX, dragging.curY);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Draw gates
    gates.forEach(g => drawGateShape(ctx, g));

    // Draw switches
    switches.forEach(sw => {
      const on = sw.val === 1;
      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, NODE_R + 6, 0, Math.PI*2);
      ctx.fillStyle = on ? '#ffd43b33' : '#22222244';
      ctx.fill();
      ctx.strokeStyle = on ? '#ffd43b' : '#555';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      if (on) { ctx.shadowColor = '#ffd43b'; ctx.shadowBlur = 12; ctx.stroke(); }
      ctx.restore();

      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = on ? '#ffd43b' : '#777';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sw.label, sw.x, sw.y);

      ctx.font = '10px monospace';
      ctx.fillStyle = on ? '#ffd43b' : '#555';
      ctx.fillText(sw.val, sw.x, sw.y + NODE_R + 14);
    });

    // Draw output nodes
    outputs.forEach(o => {
      const on = o.val === 1;
      ctx.save();
      ctx.beginPath();
      ctx.arc(o.x, o.y, NODE_R + 8, 0, Math.PI*2);
      ctx.fillStyle = on ? (o.id === 'CARRY' ? '#ff6b6b33' : '#69db7c33') : '#22222244';
      ctx.fill();
      ctx.strokeStyle = on ? (o.id === 'CARRY' ? '#ff6b6b' : '#69db7c') : '#555';
      ctx.lineWidth = 2.5;
      if (on) { ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 18; }
      ctx.stroke();
      ctx.restore();

      ctx.font = on ? 'bold 18px serif' : '16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(on ? '💡' : '⚫', o.x, o.y);

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = on ? '#69db7c' : '#555';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(o.id, o.x, o.y + NODE_R + 12);
    });

    // Draw connection nodes (small circles on node endpoints)
    allNodes().forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 4, 0, Math.PI*2);
      ctx.fillStyle = n.kind === 'out' ? '#ffd43b88' : '#74c0fc88';
      ctx.fill();
    });

    // Level info
    const lv = LEVELS[levelIdx];
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#ffd43b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`Level ${levelIdx+1}/${LEVELS.length}: ${lv.name}`, w/2, 10);
    ctx.font = '11px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(lv.goal, w/2, 26);

    // Flash message
    if (flashT > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, flashT);
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = '#69db7c';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(flashMsg, w/2, h*0.82);
      ctx.restore();
    }

    // HUD
    hud.setCenter(`Wires: ${wires.length}/${LEVELS[levelIdx].target.length}`);
    hud.setRight(`Level ${levelIdx+1}/${LEVELS.length}`);
  }

  function update(dt) {
    if (flashT > 0) flashT -= dt;
  }

  function loop(now) {
    if (lastNow === null) lastNow = now;
    const dt = Math.min((now - lastNow) / 1000, 0.05);
    lastNow = now;
    update(dt);
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function cleanup() {
    cancelAnimationFrame(rafId);
    canvas.removeEventListener('mousedown', onDown);
    canvas.removeEventListener('mousemove', onMove);
    canvas.removeEventListener('mouseup', onUp);
    canvas.removeEventListener('touchstart', onDown);
    canvas.removeEventListener('touchmove', onMove);
    canvas.removeEventListener('touchend', onUp);
    destroy();
  }

  showLessonBanner(root, {
    concept: t('m14.title'),
    detail: t('m14.banner'),
    color: '#ffd43b',
  });

  showIntro(root, {
    emoji: '⚡',
    title: t('m14.title'),
    concept: t('m14.concept'),
    howto: t('m14.howto'),
    color: '#ffd43b',
    onStart: () => { rafId = requestAnimationFrame(loop); },
  });
}
