const NODE_R = 24;

const TYPE_COLOR = {
  datacenter: '#46f0c0',
  tower:      '#46f0c0',
  hospital:   '#ff6b6b',
  school:     '#7fd8ff',
  energy:     '#ffb454',
  residential:'#8aa6b4',
  emergency:  '#ff6b6b',
  router:     '#8aa6b4',
};

const TYPE_LABEL = {
  datacenter:  'Data Center',
  tower:       'Signal Tower',
  hospital:    'Hospital',
  school:      'School',
  energy:      'Solar Farm',
  residential: 'Homes',
  emergency:   'Fire Station',
  router:      'Router',
};

export class CityCanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.W = 0; this.H = 0;
    this._t = 0;
    this._hitNodes = [];
    this._hitLinks = [];
    this._lastSnap = null;
    this._lastOpts = {};

    canvas.style.cssText = 'position:absolute;inset:0;display:block;width:100%;height:100%;cursor:pointer;';

    this._ro = new ResizeObserver(() => { this._sync(); this._draw(); });
    this._ro.observe(canvas.parentElement || canvas);
    this._sync();
  }

  _sync() {
    const el = this.canvas.parentElement || this.canvas;
    const w = el.offsetWidth  || window.innerWidth  - 200;
    const h = el.offsetHeight || window.innerHeight;
    if (w === this.W && h === this.H) return;
    this.W = w; this.H = h;
    const d = devicePixelRatio || 1;
    this.canvas.width  = Math.round(w * d);
    this.canvas.height = Math.round(h * d);
  }

  render(snap, _alpha, opts = {}) {
    this._lastSnap = snap;
    this._lastOpts = opts;
    this._sync();
    this._draw();
  }

  _draw() {
    if (!this._lastSnap) return;
    const { nodes = [], links = [], loadMultiplier = 1 } = this._lastSnap;
    const { pendingFrom = null } = this._lastOpts;
    this._t += 0.03;

    const ctx = this.ctx;
    const W = this.W, H = this.H;
    const d = devicePixelRatio || 1;

    ctx.save();
    ctx.scale(d, d);

    // ── Background ─────────────────────────────────────────────────────
    ctx.fillStyle = '#04101a';
    ctx.fillRect(0, 0, W, H);

    // grid
    ctx.strokeStyle = 'rgba(70,240,192,0.04)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 48) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 48) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // pixel positions
    const pos = {};
    nodes.forEach(n => { pos[n.id] = { x: n.x * W, y: n.y * H }; });

    this._hitLinks = [];
    this._hitNodes = [];

    // ── LINKS ───────────────────────────────────────────────────────────
    links.forEach(link => {
      const a = pos[link.a], b = pos[link.b];
      if (!a || !b) return;

      const up = link.up !== false;

      if (!up) {
        // Potential (unbuilt) link — dim dashed to show it CAN be connected
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = 'rgba(70,240,192,0.12)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
        this._hitLinks.push({ a: link.a, b: link.b, ax: a.x, ay: a.y, bx: b.x, by: b.y, up: false });
        return;
      }

      // Active link
      const load = Math.min(1, (loadMultiplier - 1) / 3);
      const stress = load > 0.6 ? '#ff6b6b' : load > 0.2 ? '#ffb454' : '#46f0c0';
      const alpha  = load > 0.6 ? 0.9 : load > 0.2 ? 0.7 : 0.55;
      const lw     = load > 0.6 ? 4 : 2.5;

      // glow under link
      ctx.beginPath();
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = stress.replace('#', 'rgba(').replace(/(..)(..)(..)/, (_,r,g,b2) =>
        `${parseInt(r,16)},${parseInt(g,16)},${parseInt(b2,16)},`) + `${alpha * 0.3})`;
      ctx.lineWidth = lw + 6;
      ctx.stroke();

      // solid line
      ctx.beginPath();
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = stress.replace('#', 'rgba(').replace(/(..)(..)(..)/, (_,r,g,b2) =>
        `${parseInt(r,16)},${parseInt(g,16)},${parseInt(b2,16)},`) + `${alpha})`;
      ctx.lineWidth = lw;
      ctx.stroke();

      // animated data pulse
      const t = (this._t * 0.6) % 1;
      const fx = a.x + (b.x - a.x) * t;
      const fy = a.y + (b.y - a.y) * t;
      ctx.beginPath();
      ctx.arc(fx, fy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#46f0c0';
      ctx.fill();

      // second pulse offset
      const t2 = (this._t * 0.6 + 0.5) % 1;
      const fx2 = a.x + (b.x - a.x) * t2;
      const fy2 = a.y + (b.y - a.y) * t2;
      ctx.beginPath();
      ctx.arc(fx2, fy2, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(70,240,192,0.5)';
      ctx.fill();

      this._hitLinks.push({ a: link.a, b: link.b, ax: a.x, ay: a.y, bx: b.x, by: b.y, up: true });
    });

    // ── NODES ───────────────────────────────────────────────────────────
    nodes.forEach(n => {
      const p = pos[n.id];
      if (!p) return;

      const color   = TYPE_COLOR[n.type] || '#8aa6b4';
      const [cr,cg,cb] = hexToRgb(color);
      const pulse   = 1 + Math.sin(this._t * 2 + n.id) * 0.05;
      const r       = NODE_R * pulse;
      const sel     = pendingFrom === n.id;

      // Check if this node has any unbuilt (up:false) links — it needs connecting
      const needsLink = links.some(l =>
        (l.a === n.id || l.b === n.id) && l.up === false
      );

      // Tap-me pulse ring on nodes that aren't yet connected
      if (needsLink && !sel) {
        const pulseR = r + 10 + Math.sin(this._t * 3) * 5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${0.2 + Math.sin(this._t*3)*0.1})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Selection ring
      if (sel) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 10, 0, Math.PI * 2);
        ctx.strokeStyle = '#46f0c0';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Glow
      const grd = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, r * 2);
      grd.addColorStop(0, `rgba(${cr},${cg},${cb},0.2)`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 2, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();

      // Body
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#071a24'; ctx.fill();
      ctx.strokeStyle = sel ? '#ffffff' : color;
      ctx.lineWidth = sel ? 3 : 2;
      ctx.stroke();

      // Icon
      ctx.fillStyle = sel ? '#ffffff' : color;
      ctx.font = `bold ${Math.round(r)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.emoji || '○', p.x, p.y);

      // Type label above node
      ctx.fillStyle = `rgba(${cr},${cg},${cb},0.7)`;
      ctx.font = `bold 9px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText((TYPE_LABEL[n.type] || n.type).toUpperCase(), p.x, p.y - r - 3);

      // Name label below
      ctx.fillStyle = 'rgba(168,216,200,0.75)';
      ctx.font = `11px monospace`;
      ctx.textBaseline = 'top';
      ctx.fillText(n.label || '', p.x, p.y + r + 4);

      this._hitNodes.push({ id: n.id, x: p.x, y: p.y, r: r + 8 });
    });

    // ── LEGEND: what dots mean ──────────────────────────────────────────
    ctx.fillStyle = 'rgba(70,240,192,0.5)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('● = data flowing', 12, H - 24);
    ctx.strokeStyle = 'rgba(70,240,192,0.12)';
    ctx.setLineDash([5,7]);
    ctx.beginPath(); ctx.moveTo(12, H - 40); ctx.lineTo(80, H - 40); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(70,240,192,0.4)';
    ctx.fillText('- - = can connect', 12, H - 44);

    ctx.restore();
  }

  hitTestNode(cx, cy) {
    const rect = this.canvas.getBoundingClientRect();
    const x = cx - rect.left, y = cy - rect.top;
    for (const n of this._hitNodes) {
      if (Math.hypot(x - n.x, y - n.y) <= n.r) return n.id;
    }
    return null;
  }

  hitTestLink(cx, cy) {
    const rect = this.canvas.getBoundingClientRect();
    const x = cx - rect.left, y = cy - rect.top;
    for (const l of this._hitLinks) {
      const dx = l.bx - l.ax, dy = l.by - l.ay;
      const len2 = dx*dx + dy*dy;
      if (!len2) continue;
      const t = Math.max(0, Math.min(1, ((x-l.ax)*dx+(y-l.ay)*dy)/len2));
      const px = l.ax+t*dx-x, py = l.ay+t*dy-y;
      if (px*px+py*py <= 196) return { a: l.a, b: l.b };
    }
    return null;
  }

  destroy() { this._ro.disconnect(); }
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#',''), 16);
  return [(n>>16)&255,(n>>8)&255,n&255];
}
