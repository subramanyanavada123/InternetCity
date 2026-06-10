import { makeGameShell, makeHUD, showStarResult, showIntro, showLessonBanner } from '../../shared/ui.js';
import { sfx } from '../../shared/sfx.js';

const MAZE = [
  [0,0,1,0,0,0,1,0,0],
  [0,1,1,0,1,0,1,0,1],
  [0,0,0,0,1,0,0,0,0],
  [1,1,0,1,1,1,0,1,0],
  [0,0,0,0,0,0,0,1,0],
  [0,1,1,1,0,1,0,0,0],
  [0,0,0,1,0,1,1,1,0],
  [1,0,1,1,0,0,0,1,0],
  [0,0,0,0,0,1,0,0,0],
];
const ROWS = 9, COLS = 9;
const START = [0, 0], END = [8, 8];
const WAYPOINTS = [[2, 0], [4, 4], [6, 8]];

function bfs(sr, sc, er, ec) {
  if (sr === er && sc === ec) return [[sr, sc]];
  const visited = Array.from({length:ROWS}, () => new Array(COLS).fill(false));
  const prev = Array.from({length:ROWS}, () => new Array(COLS).fill(null));
  visited[sr][sc] = true;
  const queue = [[sr, sc]];
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
  let found = false;
  outer: while (queue.length) {
    const [r, c] = queue.shift();
    for (const [dr, dc] of dirs) {
      const nr = r+dr, nc = c+dc;
      if (nr<0||nr>=ROWS||nc<0||nc>=COLS||visited[nr][nc]||MAZE[nr][nc]===1) continue;
      visited[nr][nc] = true; prev[nr][nc] = [r, c];
      if (nr===er && nc===ec) { found = true; break outer; }
      queue.push([nr, nc]);
    }
  }
  if (!found) return null;
  const path = []; let cur = [er, ec];
  while (cur) { path.unshift(cur); const [r,c]=cur; cur=prev[r][c]; }
  return path;
}

function optimalPath() {
  const stops = [START, ...WAYPOINTS, END];
  let full = [stops[0]];
  for (let i = 0; i < stops.length-1; i++) {
    const seg = bfs(stops[i][0],stops[i][1],stops[i+1][0],stops[i+1][1]);
    if (!seg) return null;
    full = full.concat(seg.slice(1));
  }
  return full;
}

function popEmoji(root, x, y, text) {
  const el = document.createElement('div');
  el.style.cssText = `position:absolute;left:${x}px;top:${y}px;font-size:28px;
    pointer-events:none;z-index:200;animation:coinPop 1.1s ease-out forwards;
    transform:translate(-50%,-50%);`;
  el.textContent = text;
  root.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

export function launch(app, state, onComplete) {
  const shell = makeGameShell(app, { bgColor: '#1a1200' });
  const { root, canvas, ctx, W, H, destroy, canvasXY } = shell;
  const hud = makeHUD(root, { color: '#ffd700' });

  const backBtn = document.createElement('button');
  backBtn.style.cssText = `position:absolute;top:8px;left:16px;z-index:70;
    background:rgba(0,0,0,0.55);border:1px solid #ffd70055;border-radius:10px;
    color:#ffd700;font-size:13px;font-weight:700;cursor:pointer;
    padding:6px 12px;font-family:inherit;pointer-events:auto;`;
  backBtn.textContent = '← Missions';
  backBtn.addEventListener('click', () => { cleanup(); onComplete(0, 0); });
  root.appendChild(backBtn);

  const OPTIMAL = optimalPath();
  const OPTIMAL_LEN = OPTIMAL ? OPTIMAL.length - 1 : 99;
  let playerPath = [START];
  const wpCollected = [false, false, false];
  let phase = 'drawing'; // 'drawing' | 'animating' | 'done'
  let postmanPos = null;
  let showOptimal = false;
  let raf = null, lastTs = null;
  let animIdx = 0, animT = 0, animPath = null;

  const HUD_H = 52;
  const getCS = () => Math.floor(Math.min(W(), H()-HUD_H) / COLS);
  const getOX = () => Math.floor((W() - getCS()*COLS) / 2);
  const getOY = () => HUD_H + Math.floor((H()-HUD_H - getCS()*ROWS) / 2);
  const cellToPixel = (r, c) => ({ x: getOX()+c*getCS(), y: getOY()+r*getCS() });
  const cellCenter = (r, c) => { const cs=getCS(); const {x,y}=cellToPixel(r,c); return {x:x+cs/2,y:y+cs/2}; };
  const pixelToCell = (px, py) => {
    const cs=getCS(), ox=getOX(), oy=getOY();
    const c=Math.floor((px-ox)/cs), r=Math.floor((py-oy)/cs);
    if (r<0||r>=ROWS||c<0||c>=COLS) return null;
    return [r, c];
  };
  const isInPath = (r, c) => playerPath.some(([pr,pc])=>pr===r&&pc===c);
  const lastCell = () => playerPath[playerPath.length-1];
  const allWPCollected = () => wpCollected.every(Boolean);

  function drawMaze(now) {
    const c = ctx(), cs = getCS(), ox = getOX(), oy = getOY();
    c.fillStyle = '#1a1200'; c.fillRect(0, 0, W(), H());
    for (let r = 0; r < ROWS; r++) {
      for (let col = 0; col < COLS; col++) {
        const x = ox+col*cs, y = oy+r*cs;
        if (MAZE[r][col] === 1) {
          c.fillStyle='#2a1f0a'; c.fillRect(x,y,cs,cs);
          c.fillStyle='rgba(0,0,0,0.25)';
          for (let i=0;i<3;i++) c.fillRect(x+((r*7+col*13+i*5)%(cs-4))+2, y+((r*11+col*3+i*9)%(cs-4))+2, 2,2);
        } else {
          c.fillStyle='#c8a96e'; c.fillRect(x,y,cs,cs);
          c.fillStyle='rgba(180,140,80,0.3)'; c.fillRect(x+1,y+1,cs-2,cs-2);
        }
        c.strokeStyle='rgba(0,0,0,0.3)'; c.lineWidth=0.5; c.strokeRect(x,y,cs,cs);
      }
    }
    // Player path gold highlight
    for (const [pr,pc] of playerPath) {
      const {x,y} = cellToPixel(pr,pc);
      c.fillStyle='#ffd700'; c.globalAlpha=0.55;
      c.fillRect(x+2,y+2,cs-4,cs-4); c.globalAlpha=1;
    }
    // Optimal path overlay
    if (showOptimal && OPTIMAL) {
      c.save(); c.strokeStyle='#44ff88'; c.lineWidth=3;
      c.setLineDash([6,5]); c.shadowColor='#44ff88'; c.shadowBlur=8;
      c.beginPath();
      OPTIMAL.forEach(([pr,pc],i) => { const {x,y}=cellCenter(pr,pc); i===0?c.moveTo(x,y):c.lineTo(x,y); });
      c.stroke(); c.setLineDash([]); c.restore();
    }
    const fs = Math.max(14, cs-8);
    c.font=`${fs}px serif`; c.textAlign='center'; c.textBaseline='middle';
    // Waypoints
    WAYPOINTS.forEach(([wr,wc],i) => {
      if (!wpCollected[i]) { const {x,y}=cellCenter(wr,wc); c.fillText('📦',x,y); }
    });
    const s=cellCenter(START[0],START[1]); c.fillText('📮',s.x,s.y);
    const e=cellCenter(END[0],END[1]);     c.fillText('🏰',e.x,e.y);
  }

  function drawPostman(now) {
    if (!postmanPos) return;
    const {x,y} = cellCenter(postmanPos.row, postmanPos.col);
    const c = ctx();
    c.save(); c.translate(x,y);
    c.fillStyle='#cc3300'; c.beginPath(); c.arc(0,2,6,0,Math.PI*2); c.fill();
    c.fillStyle='#ffcc99'; c.beginPath(); c.arc(0,-5,5,0,Math.PI*2); c.fill();
    c.fillStyle='#222266'; c.fillRect(-7,-9,14,3); c.fillRect(-4,-16,8,8);
    const bob = Math.sin(now*0.01)*2;
    c.strokeStyle='#222266'; c.lineWidth=2; c.beginPath();
    c.moveTo(-2,7); c.lineTo(-2,12+bob); c.moveTo(2,7); c.lineTo(2,12-bob); c.stroke();
    c.restore();
  }

  function finishGame() {
    const playerLen = playerPath.length - 1;
    let stars = 1;
    if (playerLen <= Math.ceil(OPTIMAL_LEN*1.4)) stars = 2;
    if (playerLen <= Math.ceil(OPTIMAL_LEN*1.1)) stars = 3;
    const coins = stars * 35;
    sfx[stars >= 2 ? 'win' : 'pop']();
    showStarResult(root, {
      stars,
      title: stars===3 ? 'Perfect Route! 🏆' : stars===2 ? 'Great Delivery!' : 'Package Delivered!',
      lines: [`Your route: ${playerLen} steps`, `Optimal: ${OPTIMAL_LEN} steps`,
        stars<2 ? 'Find a shorter path!' : stars<3 ? 'Nearly optimal!' : 'Shortest path found!'],
      coins, color: '#ffd700',
      onContinue: (s) => { cleanup(); onComplete(s, coins); },
    });
  }

  function loop(ts) {
    raf = requestAnimationFrame(loop);
    if (lastTs === null) lastTs = ts;
    const dt = Math.min((ts-lastTs)/1000, 0.1); lastTs = ts;
    const c = ctx(); c.clearRect(0, 0, W(), H());
    drawMaze(ts); drawPostman(ts);
    const cnt = wpCollected.filter(Boolean).length;
    hud.setLeft('📮 Maze Post Office');
    hud.setCenter(`📦 Waypoints: ${cnt}/3`);
    if (phase === 'animating' && animPath) {
      animT += 6 * dt;
      while (animT >= 1 && animIdx < animPath.length-1) { animT -= 1; animIdx++; }
      if (animIdx >= animPath.length-1) {
        postmanPos = { row: animPath[animPath.length-1][0], col: animPath[animPath.length-1][1] };
        phase = 'done'; showOptimal = true;
        setTimeout(() => { showOptimal = false; finishGame(); }, 2000);
      } else {
        const [ar,ac]=animPath[animIdx], [br,bc]=animPath[animIdx+1];
        postmanPos = { row: ar+(br-ar)*animT, col: ac+(bc-ac)*animT };
      }
    }
  }

  function handleClick(e) {
    if (phase !== 'drawing') return;
    const { x: px, y: py } = canvasXY(e);
    const cell = pixelToCell(px, py);
    if (!cell) return;
    const [r, c] = cell;
    if (MAZE[r][c] === 1) { sfx.block(); return; }
    const [lr, lc] = lastCell();
    if (r===lr && c===lc) return;
    if (Math.abs(r-lr)+Math.abs(c-lc) !== 1) { sfx.block(); return; }
    // Backtrack
    if (playerPath.length >= 2) {
      const [sr2,sc2] = playerPath[playerPath.length-2];
      if (sr2===r && sc2===c) { playerPath.pop(); sfx.click(); return; }
    }
    if (isInPath(r, c)) { sfx.block(); return; }
    playerPath.push([r, c]); sfx.pop();
    const wi = WAYPOINTS.findIndex(([wr,wc])=>wr===r&&wc===c);
    if (wi>=0 && !wpCollected[wi]) {
      wpCollected[wi] = true; sfx.coin();
      const {x,y}=cellCenter(r,c);
      popEmoji(root, rect.left+x, rect.top+y, '✅');
    }
    if (r===END[0] && c===END[1] && allWPCollected()) {
      phase = 'animating'; animPath = [...playerPath]; animIdx = 0; animT = 0;
      postmanPos = { row: animPath[0][0], col: animPath[0][1] };
    }
  }

  showLessonBanner(root, {
    concept: 'Shortest Path & Dijkstra\'s Algorithm',
    detail: 'Routers find the fastest route using graph algorithms. Fewer hops = lower latency.',
    color: '#ffec3d',
  });

  showIntro(root, {
    emoji: '🗺️',
    title: 'Maze Post Office',
    concept: 'The internet routes packets through the shortest path. Dijkstra\'s algorithm finds the fastest route between any two points.',
    howto: 'Tap cells to draw your path from START to all delivery points. Shortest path = more stars!',
    color: '#ffec3d',
    onStart: () => {
      canvas.addEventListener('click', handleClick);
      canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleClick(e); }, { passive: false });
      raf = requestAnimationFrame(loop);
    },
  });

  function cleanup() {
    if (raf) cancelAnimationFrame(raf);
    canvas.removeEventListener('click', handleClick);
    destroy();
  }
}
