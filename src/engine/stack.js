export class Stack {
  constructor() { this._items = []; this.errors = 0; }

  push(item) { this._items.push(item); return true; }

  pop() {
    if (this._items.length === 0) return null;
    return this._items.pop();
  }

  peek() { return this._items[this._items.length - 1] ?? null; }
  get length() { return this._items.length; }
  get items() { return [...this._items]; }
  get topId() { return this.peek()?.id ?? null; }

  tryPop(itemId) {
    const top = this.peek();
    if (!top) return { ok: false, reason: 'empty' };
    if (top.id === itemId) { this.pop(); return { ok: true }; }
    this.errors++;
    return { ok: false, reason: 'not-top' };
  }

  tryPush(item) {
    this.push(item);
    return { ok: true };
  }
}
