export class Reassembly {
  constructor(fragments, scrambledOrder) {
    this.fragments = fragments;
    this.scrambled = scrambledOrder.map(i => fragments[i]);
    this.slots = new Array(fragments.length).fill(null);
    this.errors = 0;
  }

  place(fragmentId, slotIndex) {
    const frag = this.fragments.find(f => f.id === fragmentId);
    if (!frag) return { ok: false };
    if (frag.correctSlot !== slotIndex) {
      this.errors++;
      return { ok: false, correctSlot: frag.correctSlot };
    }
    this.slots[slotIndex] = frag;
    return { ok: true };
  }

  isComplete() { return this.slots.every(s => s !== null); }

  get placedIds() {
    return this.slots.filter(Boolean).map(f => f.id);
  }
}
