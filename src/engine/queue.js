export class Queue {
  constructor() { this._items = []; this.errors = 0; }

  enqueue(packet) { this._items.push(packet); }

  releaseCorrect() {
    if (this._items.length === 0) return null;
    return this._items.shift();
  }

  peek() { return this._items[0] ?? null; }
  get length() { return this._items.length; }
  get items() { return [...this._items]; }

  promote(index) {
    if (index <= 0 || index >= this._items.length) return false;
    const [item] = this._items.splice(index, 1);
    this._items.unshift(item);
    return true;
  }

  moveUp(index) {
    if (index <= 0) return false;
    [this._items[index - 1], this._items[index]] = [this._items[index], this._items[index - 1]];
    return true;
  }
}

export class PriorityQueue extends Queue {
  enqueue(packet) {
    this._items.push(packet);
    this._items.sort((a, b) => b.priority - a.priority);
  }

  computeScore(releasedOrder) {
    let errors = 0;
    for (let i = 0; i < releasedOrder.length - 1; i++) {
      if (releasedOrder[i].priority < releasedOrder[i + 1].priority) errors++;
    }
    return errors;
  }
}
