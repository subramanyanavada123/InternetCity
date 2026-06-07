// City Digital Twin Engine — FutureOS

export class CityTwin {
  constructor(moduleData) {
    this.module = moduleData;
    this.tick = 0;
    this.crisisFired = false;
    this.crisisActive = false;

    // 5 live scores 0–100
    this.scores = {
      connectivity:  60,
      sustainability: 70,
      cybersecurity: 80,
      responseTime:  70,
      resilience:    65,
    };

    // city graph from module data
    this.nodes = new Map();
    this.links = [];

    const cityDef = moduleData.city;
    if (cityDef) {
      cityDef.nodes.forEach(n => this.nodes.set(n.id, { ...n, online: true, load: 0 }));
      this.links = cityDef.links.map(l => ({ ...l }));
    }

    // connectivity module specific: track which links player has activated
    this._connectedNodeIds = new Set(
      this.links.filter(l => l.up).flatMap(l => [l.a, l.b])
    );
    this._unconnectedNodes = new Set(cityDef?.unconnectedNodes || []);

    // module 2: emergency uptime tracking
    this._emergencyNodes = new Set(cityDef?.emergencyNodes || []);
    this._emergencyTicks = 0;
    this._emergencyTotalTicks = 0;

    // load multiplier from crisis
    this._loadMultiplier = 1;

    this._listeners = [];
  }

  onChange(fn) { this._listeners.push(fn); }
  _notify() { this._listeners.forEach(fn => fn(this.scores, this)); }

  // Player activates a link (Module 1)
  activateLink(a, b) {
    const link = this.links.find(l =>
      (l.a === a && l.b === b) || (l.a === b && l.b === a)
    );
    if (!link || link.up) return false;
    link.up = true;
    this._connectedNodeIds.add(a).add(b);
    this._unconnectedNodes.delete(a);
    this._unconnectedNodes.delete(b);
    this._recalcConnectivity();
    this._notify();
    return true;
  }

  // Player sets a reroute rule (Module 2)
  setReroute(nodeId, towardId) {
    const node = this.nodes.get(nodeId);
    if (node) { node.rule = towardId; this._notify(); }
  }

  // Called every sim tick
  update(dt) {
    this.tick++;

    const mod = this.module;
    const crisis = mod.crisisEvent;

    // fire crisis event
    if (crisis && !this.crisisFired && this.tick >= crisis.tick) {
      this.crisisFired = true;
      this.crisisActive = true;
      this._applyCrisis(crisis);
      this._listeners.forEach(fn => fn(this.scores, this, { crisisStart: crisis }));
    }

    // module-specific updates
    if (mod.id === 1) this._updateConnectivity();
    if (mod.id === 2) this._updateCongestion();

    this._notify();
  }

  _applyCrisis(crisis) {
    if (crisis.loadMultiplier) this._loadMultiplier = crisis.loadMultiplier;
    if (crisis.downLinks) {
      crisis.downLinks.forEach(([a, b]) => {
        const link = this.links.find(l =>
          (l.a === a && l.b === b) || (l.a === b && l.b === a)
        );
        if (link) link.up = false;
      });
      this._recalcConnectivity();
    }
  }

  _updateConnectivity() {
    // Score = fraction of total nodes reachable from datacenter
    const total = this.nodes.size;
    const reachable = this._bfsReach(0);
    const pct = total > 0 ? (reachable / total) * 100 : 0;
    this.scores.connectivity = Math.round(pct);
    this.scores.resilience = Math.round(pct * 0.9);
  }

  _updateCongestion() {
    // Degrade scores under high load
    const mult = this._loadMultiplier;
    const base = 80;
    const stress = Math.max(0, Math.min(40, (mult - 1) * 20));
    this.scores.connectivity = Math.round(base - stress * 0.5);
    this.scores.responseTime = Math.round(base - stress);
    this.scores.resilience = Math.round(70 - stress * 0.7);

    // Track emergency uptime
    this._emergencyTotalTicks++;
    const dcNode = this.nodes.get(0);
    const emergencyOk = [...this._emergencyNodes].every(id => {
      return this._pathExists(0, id);
    });
    if (emergencyOk) this._emergencyTicks++;
  }

  _recalcConnectivity() {
    this._connectedNodeIds = new Set();
    this.links.filter(l => l.up).forEach(l => {
      this._connectedNodeIds.add(l.a);
      this._connectedNodeIds.add(l.b);
    });
  }

  _bfsReach(startId) {
    const visited = new Set([startId]);
    const queue = [startId];
    while (queue.length) {
      const cur = queue.shift();
      for (const link of this.links) {
        if (!link.up) continue;
        let neighbor = null;
        if (link.a === cur && !visited.has(link.b)) neighbor = link.b;
        if (link.b === cur && !visited.has(link.a)) neighbor = link.a;
        if (neighbor !== null) { visited.add(neighbor); queue.push(neighbor); }
      }
    }
    return visited.size;
  }

  _pathExists(from, to) {
    if (from === to) return true;
    const visited = new Set([from]);
    const queue = [from];
    while (queue.length) {
      const cur = queue.shift();
      if (cur === to) return true;
      for (const link of this.links) {
        if (!link.up) continue;
        let neighbor = null;
        if (link.a === cur && !visited.has(link.b)) neighbor = link.b;
        if (link.b === cur && !visited.has(link.a)) neighbor = link.a;
        if (neighbor !== null) { visited.add(neighbor); queue.push(neighbor); }
      }
    }
    return false;
  }

  getConnectivityRatio() {
    const total = this.nodes.size;
    if (total === 0) return 0;
    return this._bfsReach(0) / total;
  }

  getEmergencyUptimeRatio() {
    if (this._emergencyTotalTicks === 0) return 1;
    return this._emergencyTicks / this._emergencyTotalTicks;
  }

  getLinkLoad(a, b) {
    return this._loadMultiplier > 1 ? 0.6 * this._loadMultiplier : 0.3;
  }

  snapshot() {
    return {
      nodes: [...this.nodes.values()],
      links: this.links,
      scores: { ...this.scores },
      crisisActive: this.crisisActive,
      loadMultiplier: this._loadMultiplier,
    };
  }
}
