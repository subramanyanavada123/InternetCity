// Network topology: nodes, edges, forwarding rules, link state
export class Network {
  constructor(scenarioData) {
    this.nodes = new Map();
    this.edges = new Map(); // edgeId -> edge
    this.adjList = new Map(); // nodeId -> [edgeId]

    scenarioData.nodes.forEach(n => {
      this.nodes.set(n.id, {
        ...n,
        // x/y are 0..1 fractions of canvas — resolved by renderer
        rule: null,      // forwarding rule: next-hop nodeId or null
        bufferQueue: [], // finite queue of packet ids
        bufferCap: n.bufferCap ?? 8,
        rate: n.rate ?? 1.0, // sender tx rate (home nodes)
        _txAccum: 0,
      });
    });

    scenarioData.edges.forEach((e, i) => {
      const id = `${e.a}-${e.b}`;
      this.edges.set(id, { id, ...e, up: e.up !== false, load: 0 });
      if (!this.adjList.has(e.a)) this.adjList.set(e.a, []);
      if (!this.adjList.has(e.b)) this.adjList.set(e.b, []);
      this.adjList.get(e.a).push(id);
      this.adjList.get(e.b).push(id);
    });

    // apply preset rules if given
    if (scenarioData.preset?.rules) {
      Object.entries(scenarioData.preset.rules).forEach(([nId, next]) => {
        const node = this.nodes.get(+nId);
        if (node) node.rule = next;
      });
    }
    if (scenarioData.preset?.downLinks) {
      scenarioData.preset.downLinks.forEach(([a, b]) => this.takeDownLink(a, b));
    }
  }

  getNode(id) { return this.nodes.get(id); }
  getEdge(a, b) {
    return this.edges.get(`${a}-${b}`) || this.edges.get(`${b}-${a}`) || null;
  }

  neighbors(nodeId) {
    return (this.adjList.get(nodeId) || [])
      .map(eid => this.edges.get(eid))
      .filter(e => e.up)
      .map(e => ({ edge: e, neighbor: e.a === nodeId ? e.b : e.a }));
  }

  setRule(nodeId, nextId) {
    const node = this.nodes.get(nodeId);
    if (node) node.rule = nextId;
  }

  toggleLink(a, b) {
    const e = this.getEdge(a, b);
    if (e) { e.up = !e.up; e.load = 0; }
  }

  takeDownLink(a, b) {
    const e = this.getEdge(a, b);
    if (e) e.up = false;
  }

  bringUpLink(a, b) {
    const e = this.getEdge(a, b);
    if (e) e.up = true;
  }

  // Collect topology info for renderer
  snapshot() {
    return {
      nodes: [...this.nodes.values()],
      edges: [...this.edges.values()],
    };
  }
}
