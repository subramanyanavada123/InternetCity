// Shared UI helpers used by all modules.

// Full-screen game wrapper — returns { root, canvas, ctx, W, H, destroy }
export function makeGameShell(app, { bgColor = '#0a0a1a' } = {}) {
  const root = document.createElement('div');
  root.style.cssText = `
    position:fixed;inset:0;background:${bgColor};
    display:flex;flex-direction:column;overflow:hidden;z-index:10;
    font-family:'Space Mono',monospace,sans-serif;
  `;
  app.appendChild(root);

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  root.appendChild(canvas);

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = root.clientWidth  * dpr;
    canvas.height = root.clientHeight * dpr;
    canvas.style.width  = root.clientWidth  + 'px';
    canvas.style.height = root.clientHeight + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const ctx = () => canvas.getContext('2d');
  const W   = () => root.clientWidth;
  const H   = () => root.clientHeight;

  // Convert a mouse/touch event to canvas CSS-pixel coordinates (DPR-safe)
  const canvasXY = (e) => {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : (e.changedTouches ? e.changedTouches[0] : e);
    const scaleX = rect.width  ? root.clientWidth  / rect.width  : 1;
    const scaleY = rect.height ? root.clientHeight / rect.height : 1;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  };

  const destroy = () => {
    window.removeEventListener('resize', resize);
    root.remove();
  };

  return { root, canvas, ctx, W, H, destroy, canvasXY };
}

// Overlay card (modal-style) — returns { el, body, remove }
export function makeCard(parent, { title, color = '#46f0c0', width = 'min(440px,92vw)' } = {}) {
  const wrap = document.createElement('div');
  wrap.style.cssText = `
    position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);z-index:100;
  `;
  const el = document.createElement('div');
  el.style.cssText = `
    background:#0d1f2d;border:1px solid ${color}55;border-radius:20px;
    padding:28px 24px;width:${width};max-height:88vh;overflow-y:auto;
    box-shadow:0 8px 48px rgba(0,0,0,0.7),0 0 0 1px ${color}22;
  `;
  if (title) {
    const h = document.createElement('div');
    h.style.cssText = `font-size:11px;color:${color};letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;font-weight:700;`;
    h.textContent = title;
    el.appendChild(h);
  }
  const body = document.createElement('div');
  el.appendChild(body);
  wrap.appendChild(el);
  parent.appendChild(wrap);
  return { el, body, remove: () => wrap.remove() };
}

// Top HUD bar — returns { el, setLeft, setCenter, setRight }
export function makeHUD(parent, { color = '#46f0c0' } = {}) {
  const el = document.createElement('div');
  el.style.cssText = `
    position:absolute;top:0;left:0;right:0;height:48px;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 16px;z-index:60;
    background:linear-gradient(to bottom,rgba(0,0,0,0.6),transparent);
    pointer-events:none;
  `;
  const left   = document.createElement('div');
  const center = document.createElement('div');
  const right  = document.createElement('div');
  [left, center, right].forEach(d => {
    d.style.cssText = `color:${color};font-size:13px;font-weight:700;pointer-events:auto;`;
    el.appendChild(d);
  });
  parent.appendChild(el);
  return {
    el,
    setLeft:   t => { left.innerHTML   = t; },
    setCenter: t => { center.innerHTML = t; },
    setRight:  t => { right.innerHTML  = t; },
    leftEl:  left,
    rightEl: right,
  };
}

// Animated coin burst at a position
export function coinBurst(parent, x, y, amount) {
  const el = document.createElement('div');
  el.style.cssText = `
    position:absolute;left:${x}px;top:${y}px;
    font-size:18px;font-weight:700;color:#ffd700;
    pointer-events:none;z-index:200;
    animation:coinPop 0.9s ease-out forwards;
    text-shadow:0 2px 8px rgba(255,215,0,0.6);
  `;
  el.textContent = `+${amount}🪙`;
  parent.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

// Inject keyframe animations once
(function injectAnimations() {
  if (document.getElementById('ic2-anims')) return;
  const s = document.createElement('style');
  s.id = 'ic2-anims';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
    @keyframes coinPop {
      0%   { transform:translate(-50%,-50%) scale(0.5); opacity:1; }
      60%  { transform:translate(-50%,-120%) scale(1.2); opacity:1; }
      100% { transform:translate(-50%,-180%) scale(1);   opacity:0; }
    }
    @keyframes fadeInUp {
      from { opacity:0; transform:translateY(24px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes shake {
      0%,100% { transform:translateX(0); }
      20%,60% { transform:translateX(-8px); }
      40%,80% { transform:translateX(8px); }
    }
    @keyframes popIn {
      0%   { transform:scale(0.5); opacity:0; }
      70%  { transform:scale(1.15); opacity:1; }
      100% { transform:scale(1); opacity:1; }
    }
    @keyframes spin { to { transform:rotate(360deg); } }
    @keyframes float {
      0%,100% { transform:translateY(0); }
      50%     { transform:translateY(-8px); }
    }
    @keyframes glow {
      0%,100% { box-shadow:0 0 8px currentColor; }
      50%     { box-shadow:0 0 24px currentColor; }
    }
    @keyframes slideInRight {
      from { transform:translateX(120%); opacity:0; }
      to   { transform:translateX(0);   opacity:1; }
    }
    @keyframes slideOutLeft {
      from { transform:translateX(0);    opacity:1; }
      to   { transform:translateX(-120%);opacity:0; }
    }
  `;
  document.head.appendChild(s);
})();

// Lesson banner pinned to bottom of a game shell
export function showLessonBanner(parent, { concept, detail, color = '#46f0c0' }) {
  const el = document.createElement('div');
  el.style.cssText = `
    position:absolute;bottom:0;left:0;right:0;z-index:55;
    background:linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.7) 70%,transparent 100%);
    padding:10px 16px 14px;pointer-events:none;
  `;
  el.innerHTML = `
    <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:${color};font-weight:700;margin-bottom:2px;">💡 You're learning</div>
    <div style="font-size:13px;font-weight:700;color:#fff;">${concept}</div>
    <div style="font-size:11px;color:#8aa6b4;margin-top:1px;line-height:1.4;">${detail}</div>
  `;
  parent.appendChild(el);
  return el;
}

// Intro splash before gameplay — calls onStart when dismissed
export function showIntro(parent, { emoji, title, concept, howto, color = '#46f0c0', onStart }) {
  const wrap = document.createElement('div');
  wrap.style.cssText = `
    position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,0.82);backdrop-filter:blur(8px);z-index:200;padding:20px;
  `;
  wrap.innerHTML = `
    <div style="
      background:#0d1f2d;border:1px solid ${color}44;border-radius:24px;
      padding:28px 24px;width:min(400px,100%);text-align:center;
    ">
      <div style="font-size:52px;margin-bottom:10px;">${emoji}</div>
      <div style="font-size:11px;color:${color};letter-spacing:3px;text-transform:uppercase;font-weight:700;margin-bottom:6px;">Mission</div>
      <div style="font-size:22px;font-weight:700;color:#fff;margin-bottom:14px;">${title}</div>
      <div style="
        background:${color}18;border:1px solid ${color}33;border-radius:12px;
        padding:12px 16px;margin-bottom:16px;text-align:left;
      ">
        <div style="font-size:10px;color:${color};letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:4px;">💡 What you'll learn</div>
        <div style="font-size:13px;color:#e0f4ec;line-height:1.5;">${concept}</div>
      </div>
      <div style="font-size:12px;color:#8aa6b4;margin-bottom:20px;line-height:1.5;">${howto}</div>
      <button id="intro-start" style="
        width:100%;padding:14px;border-radius:12px;border:none;
        background:${color};color:#000;font-size:15px;font-weight:700;
        cursor:pointer;font-family:inherit;
      ">Let's Play ▶</button>
    </div>
  `;
  parent.appendChild(wrap);
  wrap.querySelector('#intro-start').addEventListener('click', () => {
    wrap.remove();
    onStart();
  });
}

// Stars result screen — calls onContinue(stars)
export function showStarResult(parent, { stars, maxStars = 3, title, lines = [], coins = 0, color = '#ffd700', onContinue }) {
  const card = makeCard(parent, { title: '◈ Mission Complete', color });
  card.body.innerHTML = `
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:40px;margin-bottom:8px;">${'⭐'.repeat(stars)}${'☆'.repeat(maxStars - stars)}</div>
      <div style="font-size:22px;font-weight:700;color:#fff;margin-bottom:6px;">${title}</div>
      ${lines.map(l => `<div style="font-size:13px;color:#8aa6b4;margin-top:4px;">${l}</div>`).join('')}
      ${coins ? `<div style="font-size:18px;color:#ffd700;margin-top:12px;font-weight:700;">+${coins} 🪙</div>` : ''}
    </div>
  `;
  const btn = document.createElement('button');
  btn.style.cssText = `
    width:100%;padding:14px;border-radius:12px;border:none;
    background:${color};color:#000;font-size:15px;font-weight:700;
    cursor:pointer;margin-top:8px;font-family:inherit;
  `;
  btn.textContent = stars >= 2 ? 'Continue ▶' : 'Try Again ↺';
  btn.addEventListener('click', () => { card.remove(); onContinue(stars); });
  card.body.appendChild(btn);
}
