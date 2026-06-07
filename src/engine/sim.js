import { Graph } from './graph.js';

const EVENTS = [
  { type: 'jam',      label: '🚧 New jam on the network!',     weight: 3 },
  { type: 'urgent',   label: '🚑 Emergency packet incoming!',   weight: 2 },
  { type: 'fake',     label: '⚠️ Suspicious packet detected!',  weight: 2 },
  { type: 'clear',    label: '✅ A road has cleared up!',        weight: 2 },
  { type: 'burst',    label: '📦 Packet burst arriving!',        weight: 1 },
];

export class Sim {
  constructor(levelData, onUpdate) {
    this.graph = new Graph(levelData.nodes, levelData.edges);
    this.onUpdate = onUpdate;
    this.health = 100;
    this.score = 0;
    this.tick = 0;
    this.running = false;
    this.activePackets = [];
    this.eventQueue = [];
    this.currentEvent = null;
    this._interval = null;
    this._nextEventTick = 8;
  }

  start() {
    this.running = true;
    this._spawnPacket();
    this._interval = setInterval(() => this._tick(), 1000);
  }

  stop() {
    this.running = false;
    clearInterval(this._interval);
  }

  _tick() {
    this.tick++;
    this.score += Math.floor(this.health / 10);
    this.health = Math.max(0, this.health - 0.4);

    if (this.tick >= this._nextEventTick) {
      this._triggerEvent();
      this._nextEventTick = this.tick + 6 + Math.floor(Math.random() * 6);
    }

    this.activePackets = this.activePackets.filter(p => {
      p.ticksLeft--;
      if (p.ticksLeft <= 0) {
        this.score += p.priority * 10;
        this.health = Math.min(100, this.health + 3);
        return false;
      }
      return true;
    });

    if (this.activePackets.length < 3) this._spawnPacket();
    if (this.health <= 0) { this.stop(); }

    this.onUpdate({ health: this.health, score: this.score, event: this.currentEvent, packets: [...this.activePackets] });
    this.currentEvent = null;
  }

  _triggerEvent() {
    const total = EVENTS.reduce((s, e) => s + e.weight, 0);
    let r = Math.random() * total;
    let chosen = EVENTS[0];
    for (const e of EVENTS) { r -= e.weight; if (r <= 0) { chosen = e; break; } }

    this.currentEvent = chosen.label;

    if (chosen.type === 'jam') {
      const e = this.graph.edges[Math.floor(Math.random() * this.graph.edges.length)];
      e.traffic = 'jam';
      setTimeout(() => { e.traffic = 'clear'; }, 8000);
      this.health = Math.max(0, this.health - 8);
    } else if (chosen.type === 'clear') {
      const jammed = this.graph.edges.filter(e => e.traffic !== 'clear');
      if (jammed.length) jammed[Math.floor(Math.random() * jammed.length)].traffic = 'clear';
    } else if (chosen.type === 'urgent') {
      this._spawnPacket(3);
    } else if (chosen.type === 'burst') {
      this._spawnPacket(1); this._spawnPacket(1);
    } else if (chosen.type === 'fake') {
      this.health = Math.max(0, this.health - 5);
    }
  }

  _spawnPacket(priority = 1) {
    const types = ['✉️','📦','🎮','📹','🚑'];
    this.activePackets.push({
      id: Math.random().toString(36).slice(2),
      emoji: priority === 3 ? '🚑' : types[Math.floor(Math.random() * 4)],
      priority,
      ticksLeft: 12 - priority * 2,
    });
  }

  handleRoute(packetId) {
    const idx = this.activePackets.findIndex(p => p.id === packetId);
    if (idx === -1) return;
    const p = this.activePackets.splice(idx, 1)[0];
    this.score += p.priority * 15;
    this.health = Math.min(100, this.health + 5);
  }
}
