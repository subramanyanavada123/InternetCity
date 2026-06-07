// Packet lifecycle: spawn, hop-by-hop forwarding, TTL, trails, outcomes
let _pid = 0;

export const PacketState = {
  TRAVELLING: 'travelling', // on an edge, t in [0,1]
  QUEUED:     'queued',     // in a router buffer
  ARRIVING:   'arriving',   // just landed at a node
  DYING:      'dying',      // TTL=0 or dropped
  DELIVERED:  'delivered',  // reached destination
};

export class PacketSystem {
  constructor(network) {
    this.net = network;
    this.packets = new Map();
    this.stats = { sent: 0, delivered: 0, looped: 0, dropped: 0, stranded: 0 };
    this._loopDetect = new Map(); // pid -> visited set
  }

  spawn(fromId, toId, { ttl = 12, seq = 0, layers = [] } = {}) {
    const id = ++_pid;
    const pkt = {
      id, from: fromId, to: toId,
      node: fromId,   // current node
      edge: null,     // current edge id
      t: 0,           // 0..1 progress along edge
      ttl, seq, layers,
      state: PacketState.ARRIVING,
      outcome: null,
      trail: [],      // [{x,y,age}] for glow trail
      age: 0,         // ticks alive
      visitCount: new Map(), // nodeId -> visit count for loop detection
    };
    pkt.visitCount.set(fromId, 1);
    this.packets.set(id, pkt);
    this.stats.sent++;
    return pkt;
  }

  tick(dt) {
    const TRAVEL_TICKS = 18; // ticks to cross one edge at normal speed

    for (const pkt of this.packets.values()) {
      if (pkt.state === PacketState.DYING || pkt.state === PacketState.DELIVERED) {
        pkt.age++;
        if (pkt.age > 60) this.packets.delete(pkt.id);
        continue;
      }

      pkt.age++;

      if (pkt.state === PacketState.TRAVELLING) {
        const edge = this.net.edges.get(pkt.edge);
        // link went down while packet in flight
        if (!edge || !edge.up) {
          pkt.state = PacketState.DYING;
          pkt.outcome = 'stranded';
          this.stats.stranded++;
          continue;
        }
        const speed = 1 / (TRAVEL_TICKS * Math.max(0.2, 1 - edge.load / (edge.capacity ?? 4)));
        pkt.t += speed * dt;

        if (pkt.t >= 1) {
          // Arrived at destination node of edge
          const destId = edge.a === pkt.node ? edge.b : edge.a;
          pkt.node = destId;
          pkt.edge = null;
          pkt.t = 0;
          pkt.state = PacketState.ARRIVING;

          const visit = (pkt.visitCount.get(destId) || 0) + 1;
          pkt.visitCount.set(destId, visit);
          if (visit > 3) {
            pkt.state = PacketState.DYING;
            pkt.outcome = 'loop';
            this.stats.looped++;
          }
        }
        continue;
      }

      if (pkt.state === PacketState.ARRIVING) {
        const node = this.net.getNode(pkt.node);
        if (!node) continue;

        // reached destination?
        if (pkt.node === pkt.to) {
          pkt.state = PacketState.DELIVERED;
          pkt.outcome = 'ok';
          this.stats.delivered++;
          continue;
        }

        // TTL check
        pkt.ttl--;
        if (pkt.ttl <= 0) {
          pkt.state = PacketState.DYING;
          pkt.outcome = 'ttl';
          this.stats.looped++;
          continue;
        }

        // Buffer (for routers)
        if (node.type === 'router' || node.type === 'firewall') {
          if (node.bufferQueue.length >= node.bufferCap) {
            pkt.state = PacketState.DYING;
            pkt.outcome = 'dropped';
            this.stats.dropped++;
            continue;
          }
          node.bufferQueue.push(pkt.id);
          pkt.state = PacketState.QUEUED;
          continue;
        }

        // home / server — forward immediately
        this._forward(pkt, node);
        continue;
      }

      if (pkt.state === PacketState.QUEUED) {
        // Dequeued by buffer scheduler tick (see buffers.js / tick below)
        // here we just wait
        continue;
      }
    }

    // release one packet per router per tick
    for (const node of this.net.nodes.values()) {
      if (!node.bufferQueue.length) continue;
      const pktId = node.bufferQueue.shift();
      const pkt = this.packets.get(pktId);
      if (!pkt) continue;
      this._forward(pkt, node);
    }
  }

  _forward(pkt, node) {
    // use rule if set; else strand
    const nextId = node.rule;
    if (nextId === null || nextId === undefined) {
      pkt.state = PacketState.DYING;
      pkt.outcome = 'stranded';
      this.stats.stranded++;
      return;
    }
    const edge = this.net.getEdge(node.id, nextId);
    if (!edge || !edge.up) {
      pkt.state = PacketState.DYING;
      pkt.outcome = 'stranded';
      this.stats.stranded++;
      return;
    }
    pkt.edge = edge.id;
    pkt.t = 0;
    pkt.node = node.id; // still "at" node until edge progress
    pkt.state = PacketState.TRAVELLING;

    // update link load
    edge.load = Math.min((edge.load || 0) + 0.5, edge.capacity ?? 4);
  }

  // decay link loads
  tickLoads() {
    for (const e of this.net.edges.values()) {
      e.load = Math.max(0, (e.load || 0) * 0.88);
    }
  }

  getAll() { return [...this.packets.values()]; }
  getLiving() { return this.getAll().filter(p => p.state !== PacketState.DYING && p.state !== PacketState.DELIVERED || p.age < 30); }
}
