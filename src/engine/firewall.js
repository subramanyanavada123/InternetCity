export class Firewall {
  constructor(packets) {
    this.packets = packets;
    this.current = 0;
    this.blocked = 0;
    this.passed = 0;
    this.errors = 0;
  }

  get currentPacket() { return this.packets[this.current] ?? null; }
  get done() { return this.current >= this.packets.length; }

  block() {
    const p = this.currentPacket;
    if (!p) return null;
    this.current++;
    if (p.real) { this.errors++; return { action: 'blocked-real', packet: p }; }
    this.blocked++;
    return { action: 'blocked-fake', packet: p };
  }

  pass() {
    const p = this.currentPacket;
    if (!p) return null;
    this.current++;
    if (!p.real) { this.errors++; return { action: 'passed-fake', packet: p }; }
    this.passed++;
    return { action: 'passed-real', packet: p };
  }
}
