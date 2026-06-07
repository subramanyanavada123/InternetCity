// Signal aesthetic renderer — ink background, glowing links, particle packets, trails
import { PacketState } from '../sim/packets.js';

const C = {
  bg0:      '#04101a',
  bg1:      '#071a24',
  grid:     'rgba(70,240,192,0.045)',
  link:     'rgba(70,240,192,0.25)',
  linkHot:  'rgba(70,240,192,0.7)',
  linkDown: 'rgba(80,100,110,0.3)',
  linkRule: '#46f0c0',
  node: {
    home:     '#7fd8ff',
    server:   '#c9b6ff',
    router:   '#8aa6b4',
    firewall: '#ffb454',
  },
  nodeGlow: {
    home:     'rgba(127,216,255,0.35)',
    server:   'rgba(201,182,255,0.35)',
    router:   'rgba(138,166,180,0.25)',
    firewall: 'rgba(255,180,84,0.35)',
  },
  packet:  '#46f0c0',
  dying:   '#ff6b6b',
  loop:    '#ffb454',
  trail:   'rgba(70,240,192,0.18)',
  text:    '#a8d8c8',
  textDim: 'rgba(168,216,200,0.45)',
  labelBg: 'rgba(4,16,26,0.72)',
  scopeDim:'rgba(4,16,26,0.72)',
  ruleArrow:'#46f0c0',
};

const NODE_R = 20;

export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this._dpr = window.devicePixelRatio || 1;
    this._w = 0; this._h = 0;
    this.scopeNode = null; // router's-eye view focused node
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    const rect = this.canvas.parentElement?.getBoundingClientRect()
               ?? { width: window.innerWidth, height: window.innerHeight };
    this._w = rect.width  || window.innerWidth;
    this._h = rect.height || window.innerHeight;
    this.canvas.width  = this._w * this._dpr;
    this.canvas.height = this._h * this._dpr;
    this.canvas.style.width  = this._w + 'px';
    this.canvas.style.height = this._h + 'px';
    this.ctx.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);
  }

  // Convert 0..1 node coords to canvas px
  _px(x, y) {
    const pad = 60;
    return {
      x: pad + x * (this._w - pad * 2),
      y: pad + y * (this._h - pad * 2),
    };
  }

  // Get interpolated packet position
  _packetPos(pkt, net) {
    if (pkt.state === PacketState.TRAVELLING && pkt.edge) {
      const edge = net.edges.get(pkt.edge);
      if (!edge) return null;
      const nA = net.nodes.get(edge.a), nB = net.nodes.get(edge.b);
      if (!nA || !nB) return null;
      const pA = this._px(nA.x, nA.y), pB = this._px(nB.x, nB.y);
      const t = pkt.t;
      const src = edge.a === pkt.node ? pA : pB;
      const dst = edge.a === pkt.node ? pB : pA;
      return {
        x: src.x + (dst.x - src.x) * t,
        y: src.y + (dst.y - src.y) * t,
      };
    }
    const node = net.nodes.get(pkt.node);
    if (!node) return null;
    return this._px(node.x, node.y);
  }

  render(net, packets, { scopeNode = null } = {}) {
    const ctx = this.ctx;
    const W = this._w, H = this._h;
    // ── Background ────────────────────────────────────────────────────
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, C.bg0);
    grad.addColorStop(1, C.bg1);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // ── Grid ──────────────────────────────────────────────────────────
    ctx.save();
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 0.5;
    const GRID = 40;
    for (let x = 0; x < W; x += GRID) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += GRID) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.restore();

    // ── Scope dim (router's-eye view) ─────────────────────────────────
    let scopeNeighborIds = null;
    if (scopeNode !== null) {
      const node = net.nodes.get(scopeNode);
      if (node) {
        scopeNeighborIds = new Set([scopeNode]);
        (net.adjList?.get?.(scopeNode) || []).forEach(eid => {
          const e = net.edges.get(eid);
          if (e && e.up) {
            scopeNeighborIds.add(e.a);
            scopeNeighborIds.add(e.b);
          }
        });
      }
    }

    // ── Edges (links) ─────────────────────────────────────────────────
    for (const edge of net.edges.values()) {
      const nA = net.nodes.get(edge.a), nB = net.nodes.get(edge.b);
      if (!nA || !nB) continue;
      const pA = this._px(nA.x, nA.y), pB = this._px(nB.x, nB.y);

      const inScope = !scopeNeighborIds ||
        (scopeNeighborIds.has(edge.a) && scopeNeighborIds.has(edge.b));
      const dimAlpha = (!inScope && scopeNeighborIds) ? 0.15 : 1;

      ctx.save();
      ctx.globalAlpha = dimAlpha;

      if (!edge.up) {
        // Downed link
        ctx.strokeStyle = C.linkDown;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y); ctx.stroke();
        ctx.setLineDash([]);
        // 🚧 badge
        const mx = (pA.x + pB.x) / 2, my = (pA.y + pB.y) / 2;
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('🚧', mx, my);
        ctx.restore();
        continue;
      }

      const load = edge.load ?? 0;
      const cap  = edge.capacity ?? 4;
      const loadRatio = Math.min(load / cap, 1);

      // glow line proportional to load
      const glowAlpha = 0.15 + loadRatio * 0.55;
      const glowW = 2 + loadRatio * 6;

      ctx.strokeStyle = loadRatio > 0.8 ? C.dying : loadRatio > 0.5 ? C.loop : C.link;
      ctx.globalAlpha = dimAlpha * glowAlpha;
      ctx.lineWidth = glowW + 4;
      ctx.filter = `blur(${2 + loadRatio * 4}px)`;
      ctx.beginPath(); ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y); ctx.stroke();
      ctx.filter = 'none';

      // core line
      ctx.globalAlpha = dimAlpha * (0.4 + loadRatio * 0.5);
      ctx.lineWidth = 1.5 + loadRatio * 2;
      ctx.strokeStyle = loadRatio > 0.8 ? C.dying : loadRatio > 0.5 ? C.loop : C.linkHot;
      ctx.beginPath(); ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y); ctx.stroke();
      ctx.restore();

      // forwarding rule arrow
      const ruleHolder = net.nodes.get(edge.a);
      const ruleHolderB = net.nodes.get(edge.b);
      this._drawRuleArrow(ctx, edge, nA, nB, pA, pB, dimAlpha, scopeNeighborIds);
    }

    // ── Packet trails ─────────────────────────────────────────────────
    for (const pkt of packets) {
      if (!pkt.trail?.length) continue;
      const inScope = !scopeNeighborIds;
      if (!inScope) continue;
      ctx.save();
      for (let i = 1; i < pkt.trail.length; i++) {
        const a = pkt.trail[i - 1], b = pkt.trail[i];
        const alpha = (i / pkt.trail.length) * 0.35;
        ctx.strokeStyle = pkt.outcome === 'loop' ? C.loop : C.packet;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      ctx.restore();
    }

    // ── Packets ───────────────────────────────────────────────────────
    for (const pkt of packets) {
      const pos = this._packetPos(pkt, net);
      if (!pos) continue;

      // update trail
      if (!pkt.trail) pkt.trail = [];
      pkt.trail.push({ x: pos.x, y: pos.y });
      if (pkt.trail.length > 22) pkt.trail.shift();

      const dead = pkt.state === PacketState.DYING;
      const delivered = pkt.state === PacketState.DELIVERED;
      const isLoop = pkt.outcome === 'loop' || pkt.outcome === 'ttl';
      const age = pkt.age;

      let alpha = 1;
      if (dead || delivered) alpha = Math.max(0, 1 - (age - 4) / 20);

      ctx.save();
      ctx.globalAlpha = alpha;

      const color = dead
        ? (isLoop ? C.loop : C.dying)
        : delivered ? '#ffffff'
        : C.packet;

      // outer glow
      ctx.shadowBlur = dead ? 0 : 12;
      ctx.shadowColor = color;
      ctx.fillStyle = color;

      const r = dead ? 4 : 5;
      ctx.beginPath();
      ctx.roundRect(pos.x - r, pos.y - r, r * 2, r * 2, 3);
      ctx.fill();

      // TTL indicator — color shift as it ages
      if (!dead && !delivered) {
        const ttlRatio = 1 - pkt.ttl / 12;
        if (ttlRatio > 0.5) {
          ctx.globalAlpha = alpha * 0.6;
          ctx.strokeStyle = C.loop;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // ── Nodes ─────────────────────────────────────────────────────────
    for (const node of net.nodes.values()) {
      const p = this._px(node.x, node.y);
      const inScope = !scopeNeighborIds || scopeNeighborIds.has(node.id);
      const dimAlpha = inScope ? 1 : 0.22;

      ctx.save();
      ctx.globalAlpha = dimAlpha;

      const col = C.node[node.type] || C.node.router;
      const glow = C.nodeGlow[node.type] || 'rgba(138,166,180,0.2)';

      // halo glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, NODE_R + 8, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // outer ring
      ctx.beginPath();
      ctx.arc(p.x, p.y, NODE_R, 0, Math.PI * 2);
      ctx.strokeStyle = col;
      ctx.lineWidth = inScope && scopeNeighborIds && node.id === scopeNode ? 3 : 1.5;
      ctx.stroke();

      // inner fill
      ctx.beginPath();
      ctx.arc(p.x, p.y, NODE_R - 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(4,16,26,0.75)';
      ctx.fill();

      // icon
      ctx.font = '15px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(this._nodeIcon(node.type), p.x, p.y + 1);

      // buffer fill indicator (tiny arc around node)
      if ((node.type === 'router' || node.type === 'firewall') && node.bufferQueue) {
        const ratio = node.bufferQueue.length / (node.bufferCap || 8);
        if (ratio > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, NODE_R + 4, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2);
          ctx.strokeStyle = ratio > 0.8 ? C.dying : C.loop;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }

      // label
      const label = node.label || `N${node.id}`;
      ctx.font = '600 11px "Spline Sans Mono", monospace';
      ctx.fillStyle = inScope ? C.text : C.textDim;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      const lx = p.x, ly = p.y + NODE_R + 6;
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = C.labelBg;
      ctx.fillRect(lx - tw / 2 - 3, ly - 1, tw + 6, 14);
      ctx.fillStyle = inScope ? C.text : C.textDim;
      ctx.fillText(label, lx, ly);

      ctx.restore();
    }

    // ── Scope dim overlay ─────────────────────────────────────────────
    if (scopeNeighborIds) {
      // very subtle vignette to reinforce local focus
      const vgr = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.8);
      vgr.addColorStop(0, 'rgba(4,16,26,0)');
      vgr.addColorStop(1, 'rgba(4,16,26,0.35)');
      ctx.save();
      ctx.fillStyle = vgr;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }

  _drawRuleArrow(ctx, edge, nA, nB, pA, pB, dimAlpha, scopeNeighborIds) {
    // Draw a small directional arrow mid-link for each node that has this edge as its rule
    const drawArrow = (from, to, pFrom, pTo) => {
      const node = [nA, nB].find(n => n.id === from);
      if (!node || node.rule !== to) return;
      const inScope = !scopeNeighborIds || (scopeNeighborIds.has(from) && scopeNeighborIds.has(to));
      ctx.save();
      ctx.globalAlpha = (inScope ? 0.75 : 0.15) * dimAlpha;
      const mx = (pFrom.x * 0.55 + pTo.x * 0.45);
      const my = (pFrom.y * 0.55 + pTo.y * 0.45);
      const angle = Math.atan2(pTo.y - pFrom.y, pTo.x - pFrom.x);
      const sz = 7;
      ctx.translate(mx, my);
      ctx.rotate(angle);
      ctx.fillStyle = C.ruleArrow;
      ctx.shadowBlur = 6; ctx.shadowColor = C.ruleArrow;
      ctx.beginPath();
      ctx.moveTo(sz, 0);
      ctx.lineTo(-sz, -sz * 0.55);
      ctx.lineTo(-sz, sz * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    drawArrow(edge.a, edge.b, pA, pB);
    drawArrow(edge.b, edge.a, pB, pA);
  }

  _nodeIcon(type) {
    return { home: '⌂', server: '▣', router: '◈', firewall: '⊛' }[type] || '○';
  }

  hitTestNode(net, clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left, y = clientY - rect.top;
    for (const node of net.nodes.values()) {
      const p = this._px(node.x, node.y);
      const dx = p.x - x, dy = p.y - y;
      if (dx * dx + dy * dy < (NODE_R + 8) * (NODE_R + 8)) return node;
    }
    return null;
  }

  hitTestEdge(net, clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left, y = clientY - rect.top;
    let best = null, bestDist = 14;
    for (const edge of net.edges.values()) {
      const nA = net.nodes.get(edge.a), nB = net.nodes.get(edge.b);
      if (!nA || !nB) continue;
      const pA = this._px(nA.x, nA.y), pB = this._px(nB.x, nB.y);
      const dist = this._ptLineDist(x, y, pA.x, pA.y, pB.x, pB.y);
      if (dist < bestDist) { bestDist = dist; best = edge; }
    }
    return best;
  }

  _ptLineDist(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - x1, py - y1);
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }
}
