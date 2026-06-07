// Per-sender AIMD congestion control — real TCP-like back-off/recover
export class CongestionControl {
  constructor(network, packetSystem) {
    this.net = network;
    this.pkts = packetSystem;
    // per-sender state keyed by nodeId
    this._senders = new Map();
    this._lossHistory = []; // [{t, nodeId}] for sawtooth chart
    this._tick = 0;
  }

  initSender(nodeId, initialRate) {
    this._senders.set(nodeId, {
      nodeId,
      rate: initialRate ?? 1.0,   // packets per tick (0..maxRate)
      maxRate: 4.0,
      cwnd: initialRate ?? 1.0,   // congestion window
      ssthresh: 2.0,
      mode: 'slowstart',          // 'slowstart' | 'avoidance'
      lossDetected: false,
      history: [],                // [{t, rate}] for sawtooth
    });
  }

  setRate(nodeId, rate) {
    const s = this._senders.get(nodeId);
    if (s) { s.rate = Math.max(0.1, Math.min(s.maxRate, rate)); s.cwnd = s.rate; }
  }

  notifyLoss(nodeId) {
    const s = this._senders.get(nodeId);
    if (!s || s.lossDetected) return;
    s.lossDetected = true;
    s.ssthresh = Math.max(0.5, s.cwnd / 2);
    s.cwnd = s.ssthresh;
    s.rate = s.cwnd;
    s.mode = 'avoidance';
    this._lossHistory.push({ t: this._tick, nodeId });
    if (s.history.length > 120) s.history.shift();
    s.history.push({ t: this._tick, rate: s.rate, loss: true });
  }

  tick() {
    this._tick++;
    for (const s of this._senders.values()) {
      s.lossDetected = false;
      if (s.mode === 'slowstart') {
        s.cwnd = Math.min(s.cwnd * 1.08, s.ssthresh > 0 ? s.ssthresh : s.maxRate);
        if (s.cwnd >= s.ssthresh) s.mode = 'avoidance';
      } else {
        s.cwnd = Math.min(s.cwnd + 0.04, s.maxRate);
      }
      s.rate = s.cwnd;
      if (s.history.length > 120) s.history.shift();
      s.history.push({ t: this._tick, rate: s.rate, loss: false });
    }
  }

  getSender(nodeId) { return this._senders.get(nodeId); }
  getAllSenders() { return [...this._senders.values()]; }
}
