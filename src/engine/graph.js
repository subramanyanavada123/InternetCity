const TRAFFIC_PENALTY = { clear: 0, busy: 2, jam: 5 };

export class Graph {
  constructor(nodes, edges) {
    this.nodes = nodes;
    this.edges = edges.map(e => ({ ...e })); // mutable copy for live traffic
    this.nodeById = new Map(nodes.map(n => [n.id, n]));
    this._buildAdj();
  }

  _buildAdj() {
    this.adjList = new Map();
    this.nodes.forEach(n => this.adjList.set(n.id, []));
    this.edges.forEach(edge => {
      this.adjList.get(edge.a)?.push(edge);
      this.adjList.get(edge.b)?.push(edge);
    });
  }

  getNeighbors(nodeId) { return this.adjList.get(nodeId) || []; }

  cost(edge) {
    if (edge.closed) return Infinity;
    return edge.baseTicks + (TRAFFIC_PENALTY[edge.traffic] ?? 0);
  }

  dijkstra(startId, endId) {
    const dist = new Map();
    const prev = new Map();
    const visited = new Set();

    this.nodes.forEach(n => { dist.set(n.id, Infinity); prev.set(n.id, null); });
    dist.set(startId, 0);

    while (true) {
      let u = null, minD = Infinity;
      for (const [id, d] of dist) {
        if (!visited.has(id) && d < minD) { minD = d; u = id; }
      }
      if (u === null || u === endId) break;
      visited.add(u);

      for (const edge of this.getNeighbors(u)) {
        const v = edge.a === u ? edge.b : edge.a;
        if (visited.has(v)) continue;
        const alt = dist.get(u) + this.cost(edge);
        if (alt < dist.get(v)) { dist.set(v, alt); prev.set(v, { node: u, edge }); }
      }
    }

    if (dist.get(endId) === Infinity) return null;
    const path = [];
    let cur = endId;
    while (cur !== null) { path.unshift(cur); cur = prev.get(cur)?.node ?? null; }
    return { path, distance: dist.get(endId) };
  }

  pathEdges(nodeIds) {
    const out = [];
    for (let i = 0; i < nodeIds.length - 1; i++) {
      const a = nodeIds[i], b = nodeIds[i + 1];
      const e = this.getNeighbors(a).find(e => (e.a===a&&e.b===b)||(e.a===b&&e.b===a));
      if (e) out.push(e);
    }
    return out;
  }

  routeCost(nodeIds) {
    return this.pathEdges(nodeIds).reduce((s, e) => s + this.cost(e), 0);
  }

  shiftTraffic() {
    const states = ['clear', 'clear', 'busy', 'jam'];
    this.edges.forEach(e => {
      if (Math.random() < 0.3) {
        e.traffic = states[Math.floor(Math.random() * states.length)];
      }
    });
  }

  isConnected(aId, bId) {
    return this.getNeighbors(aId).some(e => (e.a===aId&&e.b===bId)||(e.a===bId&&e.b===aId));
  }
}
