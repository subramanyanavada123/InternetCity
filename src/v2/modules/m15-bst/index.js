import { makeGameShell, makeHUD, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';
import { t } from '../../shared/i18n.js';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 15 — BINARY SEARCH TREE
// Concept: BST insertion + search. Player drags numbers onto the tree.
// Wow: watching BST search skip half the tree at every step (binary search).
// Rounds: 1-Insert, 2-Search, 3-Beat the BST (find in fewest steps)
// ─────────────────────────────────────────────────────────────────────────────

const NODE_R   = 22;
const V_GAP    = 68;
const ANIM_SPD = 4;   // tree build animation speed

// ── BST data structure ───────────────────────────────────────────────────────
function newNode(val) {
  return { val, left: null, right: null, x: 0, y: 0, insertAnim: 1 };
}

function insertBST(root, val) {
  if (!root) return newNode(val);
  if (val < root.val) root.left  = insertBST(root.left,  val);
  else if (val > root.val) root.right = insertBST(root.right, val);
  return root;
}

function searchPath(root, target) {
  const path = [];
  let node = root;
  while (node) {
    path.push(node.val);
    if (target === node.val) break;
    node = target < node.val ? node.left : node.right;
  }
  return path;
}

// Lay out BST nodes with x,y for drawing
function layoutBST(node, x, y, spread) {
  if (!node) return;
  node.x = x; node.y = y;
  layoutBST(node.left,  x - spread, y + V_GAP, spread / 2);
  layoutBST(node.right, x + spread, y + V_GAP, spread / 2);
}

// Collect all nodes in array (for drawing)
function collectNodes(root, out = []) {
  if (!root) return out;
  out.push(root);
  collectNodes(root.left, out);
  collectNodes(root.right, out);
  return out;
}

// ── Rounds ───────────────────────────────────────────────────────────────────
const ROUND1_VALS = [50, 30, 70, 20, 40, 60, 80];    // insert these in order
const ROUND2_SEARCHES = [40, 80, 20, 60];              // search for these
const ROUND3_VALS = [45, 25, 65, 15, 35, 55, 75, 10]; // player must find fast

export function launch(app, state, onComplete) {
  const shell = makeGameShell(app, { bgColor: '#0a1a0a' });
  const { root, canvas, ctx: getCtx, W, H, destroy, canvasXY } = shell;
  const hud = makeHUD(root, { color: '#69db7c' });

  const backBtn = document.createElement('button');
  backBtn.style.cssText = `position:absolute;top:8px;left:16px;z-index:70;
    background:rgba(0,0,0,0.5);border:1px solid #69db7c66;border-radius:10px;
    color:#69db7c;font-size:13px;font-weight:700;cursor:pointer;
    padding:6px 12px;font-family:inherit;`;
  backBtn.textContent = t('btn.back');
  backBtn.addEventListener('click', () => { cleanup(); onComplete(0, 0); });
  root.appendChild(backBtn);

  // ── State ──────────────────────────────────────────────────────────────────
  let round     = 1;
  let bst       = null;
  let insertQueue = [];   // values queued to insert with animation
  let insertIdx = 0;      // which value we've inserted so far
  let searchIdx = 0;
  let searchPath_ = [];
  let searchHighlight = -1;  // index into searchPath
  let searchTimer = 0;
  let searching = false;
  let score     = 0;        // round 3: how many compares player did
  let bestScore = 0;
  let playerPath = [];      // round 3: nodes player clicked
  let r3Target  = 0;
  let r3Done    = false;
  let animT     = 0;
  let floaters  = [];
  let ended     = false;
  let rafId     = null;
  let lastNow   = null;
  let hint      = '';
  let hintT     = 0;

  function showHint(msg, dur = 2) { hint = msg; hintT = dur; }

  // ── Round 1: Insert ────────────────────────────────────────────────────────
  function startRound1() {
    round = 1;
    bst = null;
    insertQueue = [...ROUND1_VALS];
    insertIdx = 0;
    animT = 0;
    showHint(`Insert ${insertQueue[0]} — tap the number below or wait`, 3);
    buildInsertBtn();
  }

  let insertBtn = null;
  function buildInsertBtn() {
    if (insertBtn) insertBtn.remove();
    if (insertIdx >= insertQueue.length) {
      showHint('Tree complete! 🌳 Now search begins...', 2);
      setTimeout(() => startRound2(), 2200);
      return;
    }
    insertBtn = document.createElement('button');
    insertBtn.style.cssText = `
      position:absolute;bottom:18px;left:50%;transform:translateX(-50%);
      z-index:60;padding:10px 28px;border-radius:12px;
      border:2px solid #69db7c;background:rgba(105,219,124,0.18);
      color:#69db7c;font-size:18px;font-weight:700;cursor:pointer;
      font-family:inherit;min-height:48px;
    `;
    insertBtn.textContent = `Insert ${insertQueue[insertIdx]} →`;
    insertBtn.addEventListener('click', doInsert);
    root.appendChild(insertBtn);
    setTimeout(doInsert, 1800);  // auto-insert after 1.8s
  }

  function doInsert() {
    if (insertIdx >= insertQueue.length) return;
    const val = insertQueue[insertIdx++];
    bst = insertBST(bst, val);
    relayout();
    sfx.pop();
    floaters.push({ x: W()*0.5, y: H()*0.5 - 40, txt: `+${val}`, color:'#69db7c', vy:-60, life:1 });
    if (insertBtn) insertBtn.remove();
    insertBtn = null;
    setTimeout(buildInsertBtn, 400);
  }

  // ── Round 2: Search ────────────────────────────────────────────────────────
  function startRound2() {
    round = 2;
    searchIdx = 0;
    doNextSearch();
  }

  function doNextSearch() {
    if (searchIdx >= ROUND2_SEARCHES.length) {
      setTimeout(() => startRound3(), 1000);
      return;
    }
    const target = ROUND2_SEARCHES[searchIdx++];
    searchPath_ = searchPath(bst, target);
    searchHighlight = -1;
    searching = true;
    searchTimer = 0;
    showHint(`Searching for ${target}... watch the path!`, 0.5);
  }

  // ── Round 3: Beat the BST ─────────────────────────────────────────────────
  function startRound3() {
    round = 3;
    // Build fresh BST with round3 values
    bst = null;
    ROUND3_VALS.forEach(v => { bst = insertBST(bst, v); });
    relayout();
    r3Target = ROUND3_VALS[Math.floor(Math.random() * ROUND3_VALS.length)];
    playerPath = [];
    r3Done = false;
    showHint(`Find ${r3Target}! Tap nodes to search`, 3);
  }

  function onNodeTap(x, y) {
    if (round !== 3 || r3Done) return;
    const nodes = collectNodes(bst);
    for (const n of nodes) {
      if (Math.hypot(n.x - x, n.y - y) < NODE_R + 6) {
        playerPath.push(n.val);
        sfx.coin();
        if (n.val === r3Target) {
          r3Done = true;
          const bstPath = searchPath(bst, r3Target);
          const extra = playerPath.length - bstPath.length;
          const stars = extra <= 0 ? 3 : extra <= 2 ? 2 : 1;
          score = playerPath.length;
          bestScore = bstPath.length;
          sfx.win();
          setTimeout(() => endGame(stars), 600);
        } else {
          const dir = r3Target < n.val ? 'left' : 'right';
          showHint(`${r3Target} < ${n.val} ? Go ${dir}!`, 1.5);
        }
        return;
      }
    }
  }

  function endGame(stars) {
    ended = true;
    const coins = [0, 30, 60, 100][stars];
    showStarResult(root, {
      stars, color: '#69db7c',
      title: ['Try Again!', 'Good Search!', 'Fast Search!', '🌳 BST Master!'][stars],
      lines: [
        `You found ${r3Target} in ${score} steps`,
        `Optimal BST search: ${bestScore} steps`,
        '─────────────────────────',
        '💡 Each step skips HALF the remaining values.',
        '10 nodes → max 4 steps. 1M nodes → max 20 steps!',
        '📦 Used in every database: MongoDB, MySQL...',
      ],
      coins,
      onContinue: (action) => { cleanup(); if(action!=='retry') onComplete(stars,coins); else launch(app,state,onComplete); },
    });
  }

  // ── Layout ──────────────────────────────────────────────────────────────────
  function relayout() {
    if (!bst) return;
    const spread = Math.min(W() * 0.28, 120);
    layoutBST(bst, W() / 2, 80, spread);
  }

  relayout();

  // ── Update ──────────────────────────────────────────────────────────────────
  function update(dt) {
    animT += dt;
    if (hintT > 0) hintT -= dt;

    // Animate search highlight
    if (searching) {
      searchTimer += dt;
      if (searchTimer > 0.55) {
        searchTimer = 0;
        searchHighlight++;
        if (searchHighlight < searchPath_.length) sfx.pop();
        if (searchHighlight >= searchPath_.length) {
          searching = false;
          showHint(`Found in ${searchPath_.length} steps! Binary search ⚡`, 2);
          setTimeout(() => doNextSearch(), 2200);
        }
      }
    }

    // Animate node insertion
    const nodes = collectNodes(bst);
    nodes.forEach(n => { if (n.insertAnim > 0) n.insertAnim -= dt * ANIM_SPD; });

    floaters = floaters.filter(f => {
      f.y += f.vy * dt; f.life -= dt * 1.2; return f.life > 0;
    });
  }

  // ── Draw ────────────────────────────────────────────────────────────────────
  function drawTree(ctx, node, parent = null) {
    if (!node) return;
    // Edge to parent
    if (parent) {
      ctx.save();
      ctx.strokeStyle = '#1a4a1a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(parent.x, parent.y);
      ctx.lineTo(node.x, node.y);
      ctx.stroke();
      ctx.restore();
    }
    drawTree(ctx, node.left, node);
    drawTree(ctx, node.right, node);

    // Node circle
    const isSearched = round === 2 && searching && searchPath_.slice(0, searchHighlight + 1).includes(node.val);
    const isFound    = round === 2 && !searching && searchPath_.includes(node.val);
    const isPlayer   = round === 3 && playerPath.includes(node.val);
    const isTarget   = round === 3 && node.val === r3Target && r3Done;
    const scale = Math.max(0, 1 - node.insertAnim * 0.8);

    ctx.save();
    ctx.translate(node.x, node.y);
    ctx.scale(scale, scale);

    ctx.beginPath();
    ctx.arc(0, 0, NODE_R, 0, Math.PI * 2);

    if (isTarget)        { ctx.fillStyle = '#ffd43b'; ctx.shadowColor = '#ffd43b'; ctx.shadowBlur = 20; }
    else if (isSearched) { ctx.fillStyle = '#74c0fc44'; ctx.shadowColor = '#74c0fc'; ctx.shadowBlur = 12; }
    else if (isPlayer)   { ctx.fillStyle = '#ff9f4344'; ctx.shadowColor = '#ff9f43'; ctx.shadowBlur = 10; }
    else if (isFound)    { ctx.fillStyle = '#69db7c33'; }
    else                 { ctx.fillStyle = '#1a3a1a'; }
    ctx.fill();

    ctx.strokeStyle = isTarget   ? '#ffd43b'
                    : isSearched ? '#74c0fc'
                    : isPlayer   ? '#ff9f43'
                    : isFound    ? '#69db7c'
                    : '#2d6a2d';
    ctx.lineWidth = isSearched || isTarget ? 3 : 2;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.val, 0, 0);

    ctx.restore();
  }

  function draw() {
    const ctx = getCtx();
    const w = W(), h = H();
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid
    ctx.strokeStyle = 'rgba(0,60,0,0.2)'; ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 60) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    for (let y = 0; y < h; y += 60) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

    drawTree(ctx, bst);

    // Search path arrow for round 2
    if (round === 2 && searching && searchHighlight >= 0 && searchHighlight < searchPath_.length) {
      const target = searchPath_[searchHighlight];
      const nodes = collectNodes(bst);
      const n = nodes.find(nd => nd.val === target);
      if (n) {
        ctx.save();
        ctx.font = '22px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        const pulse = 0.6 + 0.4 * Math.sin(animT * 8);
        ctx.globalAlpha = pulse;
        ctx.fillText('👆', n.x, n.y - NODE_R - 4);
        ctx.restore();
      }
    }

    // Round 3 target display
    if (round === 3 && !r3Done) {
      ctx.save();
      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = '#ffd43b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`🎯 Find: ${r3Target}`, w / 2, 14);
      ctx.restore();
    }

    // Player path breadcrumb
    if (round === 3 && playerPath.length > 0) {
      const trail = playerPath.join(' → ');
      ctx.font = '11px monospace';
      ctx.fillStyle = '#ff9f43';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`Your path: ${trail}`, w / 2, 36);
    }

    // Hint
    if (hintT > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, hintT);
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = '#69db7c';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(hint, w / 2, h * 0.88);
      ctx.restore();
    }

    // Floaters
    floaters.forEach(f => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, f.life);
      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = f.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.txt, f.x, f.y);
      ctx.restore();
    });

    // HUD
    const roundNames = ['', 'Round 1: Insert', 'Round 2: Watch Search', 'Round 3: You Search!'];
    hud.setCenter(roundNames[round] || '');
    hud.setRight(round === 3 && !r3Done ? `Steps: ${playerPath.length}` : '');
  }

  // ── Loop ────────────────────────────────────────────────────────────────────
  function loop(now) {
    if (lastNow === null) lastNow = now;
    const dt = Math.min((now - lastNow) / 1000, 0.05);
    lastNow = now;
    update(dt);
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function onTap(e) {
    e.preventDefault();
    const { x, y } = canvasXY(e);
    onNodeTap(x, y);
  }

  canvas.addEventListener('click', onTap);
  canvas.addEventListener('touchend', onTap, { passive: false });

  function cleanup() {
    cancelAnimationFrame(rafId);
    if (insertBtn) insertBtn.remove();
    canvas.removeEventListener('click', onTap);
    canvas.removeEventListener('touchend', onTap);
    destroy();
  }

  showLessonBanner(root, {
    concept: t('m15.title'),
    detail: t('m15.banner'),
    color: '#69db7c',
  });

  showIntro(root, {
    emoji: '🌳',
    title: t('m15.title'),
    concept: t('m15.concept'),
    howto: t('m15.howto'),
    color: '#69db7c',
    onStart: () => {
      rafId = requestAnimationFrame(loop);
      startRound1();
    },
  });
}
