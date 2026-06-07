const SVG_NS = 'http://www.w3.org/2000/svg';
const VIEWBOX = { w: 760, h: 520 };

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function midpoint(n1, n2) {
  return { x: (n1.x + n2.x) / 2, y: (n1.y + n2.y) / 2 };
}

export class CityMap {
  constructor(container, graph, opts = {}) {
    this.container = container;
    this.graph = graph;
    this.opts = opts; // { interactive, showCost, ambientPackets }
    this.route = [];
    this.onRouteChange = null;
    this._packetEls = [];
    this._ambientPackets = [];
    this._ambientTimer = null;
    this._flowAnimTimers = [];
    this._init();
  }

  _init() {
    const svg = svgEl('svg', {
      viewBox: `0 0 ${VIEWBOX.w} ${VIEWBOX.h}`,
      class: 'map-svg', role: 'img', 'aria-label': 'Network city map'
    });
    this.svg = svg;
    this.container.appendChild(svg);

    this._layers = {
      roads:   svgEl('g', { class: 'layer-roads' }),
      route:   svgEl('g', { class: 'layer-route' }),
      badges:  svgEl('g', { class: 'layer-badges' }),
      nodes:   svgEl('g', { class: 'layer-nodes' }),
      packets: svgEl('g', { class: 'layer-packets' }),
    };
    Object.values(this._layers).forEach(l => svg.appendChild(l));

    this._render();
    if (this.opts.ambientPackets !== false) this._startAmbient();
  }

  _render() {
    this._renderRoads();
    this._renderRoute();
    this._renderNodes();
  }

  _renderRoads() {
    const l = this._layers.roads;
    l.innerHTML = '';
    const b = this._layers.badges;
    b.innerHTML = '';

    this.graph.edges.forEach(edge => {
      const n1 = this.graph.nodeById.get(edge.a);
      const n2 = this.graph.nodeById.get(edge.b);
      const mid = midpoint(n1, n2);

      const line = svgEl('line', {
        x1: n1.x, y1: n1.y, x2: n2.x, y2: n2.y,
        class: `road-line ${edge.traffic}`,
        'stroke-width': 4,
        'data-edge-a': edge.a, 'data-edge-b': edge.b,
      });
      l.appendChild(line);

      // animated flow dashes
      const len = Math.hypot(n2.x - n1.x, n2.y - n1.y);
      const flowSpeed = edge.traffic === 'clear' ? '1.2s' : edge.traffic === 'busy' ? '2.2s' : '4s';
      const dash = svgEl('line', {
        x1: n1.x, y1: n1.y, x2: n2.x, y2: n2.y,
        class: `road-flow`,
        stroke: 'rgba(255,255,255,0.55)',
        'stroke-width': 2,
        'stroke-dasharray': `${len * 0.18} ${len * 0.82}`,
        'stroke-dashoffset': 0,
        'stroke-linecap': 'round',
      });
      // CSS keyframe via inline style for flow
      dash.style.animation = `roadFlow ${flowSpeed} linear infinite`;
      l.appendChild(dash);

      if (this.opts.showCost !== false) {
        const cost = this.graph.cost(edge);
        const bg = svgEl('rect', {
          x: mid.x - 13, y: mid.y - 9, width: 26, height: 17,
          rx: 4, class: 'cost-badge-bg', opacity: 0.82
        });
        const txt = svgEl('text', {
          x: mid.x, y: mid.y + 1, class: 'cost-badge-txt'
        });
        txt.textContent = `${cost}t`;
        b.appendChild(bg); b.appendChild(txt);
      }
    });

    // inject keyframe if not present
    if (!document.getElementById('roadFlowKf')) {
      const style = document.createElement('style');
      style.id = 'roadFlowKf';
      style.textContent = `@keyframes roadFlow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -200px; } }`;
      document.head.appendChild(style);
    }
  }

  _renderRoute() {
    const l = this._layers.route;
    l.innerHTML = '';
    if (this.route.length < 2) return;

    for (let i = 0; i < this.route.length - 1; i++) {
      const n1 = this.graph.nodeById.get(this.route[i]);
      const n2 = this.graph.nodeById.get(this.route[i + 1]);
      const line = svgEl('line', {
        x1: n1.x, y1: n1.y, x2: n2.x, y2: n2.y,
        class: 'road-line route', 'stroke-width': 7,
      });
      l.appendChild(line);
    }
  }

  _renderNodes() {
    const l = this._layers.nodes;
    l.innerHTML = '';

    this.graph.nodes.forEach(node => {
      const isSelected = this.route.includes(node.id);
      const g = svgEl('g', {
        class: 'node-group',
        role: 'button',
        'aria-label': `${node.label}, ${node.type}`,
        tabindex: this.opts.interactive !== false ? 0 : -1,
      });

      const circle = svgEl('circle', {
        cx: node.x, cy: node.y, r: 22,
        class: `node-circle ${node.type}${isSelected ? ' selected' : ''}`,
      });

      const emoji = svgEl('text', {
        x: node.x, y: node.y + 1, class: 'node-emoji'
      });
      emoji.textContent = node.emoji || '📡';

      const label = svgEl('text', {
        x: node.x, y: node.y + 38, class: 'node-label-txt'
      });
      label.textContent = node.label;

      g.appendChild(circle);
      g.appendChild(emoji);
      g.appendChild(label);

      if (this.opts.interactive !== false) {
        g.addEventListener('click',    () => this._selectNode(node.id));
        g.addEventListener('keydown',  e => { if (e.key === 'Enter' || e.key === ' ') this._selectNode(node.id); });
        g.style.cursor = 'pointer';
      }

      l.appendChild(g);
    });
  }

  _selectNode(nodeId) {
    const home = this.graph.nodes.find(n => n.type === 'home');
    const server = this.graph.nodes.find(n => n.type === 'server');

    if (this.route.length === 0) {
      if (nodeId === home.id) this.route = [nodeId];
    } else if (nodeId === this.route[this.route.length - 1]) {
      this.route.pop();
    } else if (nodeId === this.route[this.route.length - 2]) {
      this.route.pop(); // undo
    } else {
      const last = this.route[this.route.length - 1];
      if (!this.route.includes(nodeId) && this.graph.isConnected(last, nodeId)) {
        this.route.push(nodeId);
      }
    }

    this._renderRoute();
    this._renderNodes();
    this.onRouteChange?.(this.route);
  }

  isValid() {
    const home = this.graph.nodes.find(n => n.type === 'home');
    const server = this.graph.nodes.find(n => n.type === 'server');
    return this.route.length >= 2 &&
      this.route[0] === home?.id &&
      this.route[this.route.length - 1] === server?.id;
  }

  routeCost() { return this.graph.routeCost(this.route); }

  undoStep() {
    if (this.route.length > 0) this.route.pop();
    this._renderRoute();
    this._renderNodes();
    this.onRouteChange?.(this.route);
  }

  clearRoute() {
    this.route = [];
    this._renderRoute();
    this._renderNodes();
    this.onRouteChange?.(this.route);
  }

  refreshRoads() { this._renderRoads(); }

  async animatePacket(packetEmoji = '✉️') {
    if (!this.isValid()) return;
    const l = this._layers.packets;
    const nodes = this.route.map(id => this.graph.nodeById.get(id));
    const edges = this.graph.pathEdges(this.route);

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const n1 = nodes[i], n2 = nodes[i + 1];
      const cost = this.graph.cost(edge);
      const durationMs = cost * 160;

      await new Promise(resolve => {
        const g = svgEl('g', { class: 'packet-group' });
        const rect = svgEl('rect', {
          x: n1.x - 14, y: n1.y - 14, width: 28, height: 28,
          class: 'packet-rect'
        });
        const em = svgEl('text', { x: n1.x, y: n1.y + 1, class: 'packet-emoji' });
        em.textContent = packetEmoji;
        g.appendChild(rect); g.appendChild(em);
        l.appendChild(g);

        const start = performance.now();
        const frame = () => {
          const t = Math.min((performance.now() - start) / durationMs, 1);
          const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
          const x = n1.x + (n2.x - n1.x) * ease;
          const y = n1.y + (n2.y - n1.y) * ease;
          rect.setAttribute('x', x - 14); rect.setAttribute('y', y - 14);
          em.setAttribute('x', x); em.setAttribute('y', y + 1);
          if (t < 1) requestAnimationFrame(frame);
          else { g.remove(); resolve(); }
        };
        requestAnimationFrame(frame);
      });
    }
    return true;
  }

  _startAmbient() {
    const spawnAmbient = () => {
      if (this.graph.edges.length < 2) return;
      const edge = this.graph.edges[Math.floor(Math.random() * this.graph.edges.length)];
      const n1 = this.graph.nodeById.get(edge.a);
      const n2 = this.graph.nodeById.get(edge.b);
      const emojis = ['✉️','📦','📡','🎮'];
      const em = emojis[Math.floor(Math.random() * emojis.length)];
      const speed = this.graph.cost(edge) * 180;

      const g = svgEl('g', { class: 'ambient-packet' });
      const c = svgEl('circle', { cx: n1.x, cy: n1.y, r: 6, fill: 'rgba(255,87,34,0.4)' });
      const t = svgEl('text', { x: n1.x, y: n1.y + 1, 'font-size': 8, 'text-anchor': 'middle', 'dominant-baseline': 'middle' });
      t.textContent = em;
      g.appendChild(c); g.appendChild(t);
      this._layers.packets.appendChild(g);

      const start = performance.now();
      const frame = () => {
        const prog = Math.min((performance.now() - start) / speed, 1);
        const x = n1.x + (n2.x - n1.x) * prog;
        const y = n1.y + (n2.y - n1.y) * prog;
        c.setAttribute('cx', x); c.setAttribute('cy', y);
        t.setAttribute('x', x); t.setAttribute('y', y + 1);
        if (prog < 1) requestAnimationFrame(frame); else g.remove();
      };
      requestAnimationFrame(frame);
    };

    this._ambientTimer = setInterval(spawnAmbient, 1800);
    spawnAmbient();
  }

  destroy() {
    clearInterval(this._ambientTimer);
    this.svg.remove();
  }
}
