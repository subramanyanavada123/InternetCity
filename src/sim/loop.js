// Fixed-timestep simulation loop with interpolated rendering
export class SimLoop {
  constructor({ onTick, onRender, ticksPerSecond = 20 }) {
    this.onTick  = onTick;
    this.onRender = onRender;
    this.tps = ticksPerSecond;
    this.msPerTick = 1000 / ticksPerSecond;
    this._running = false;
    this._lastTime = 0;
    this._accumulator = 0;
    this._raf = null;
    this.tickCount = 0;
    this.paused = false;
  }

  start() {
    this._running = true;
    this._lastTime = performance.now();
    this._raf = requestAnimationFrame(t => this._frame(t));
  }

  stop() {
    this._running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
  }

  pause() { this.paused = true; }
  resume() { this.paused = false; this._lastTime = performance.now(); }

  _frame(now) {
    if (!this._running) return;
    this._raf = requestAnimationFrame(t => this._frame(t));

    const dt = Math.min(now - this._lastTime, 150); // cap at 150ms to avoid spiral
    this._lastTime = now;
    if (this.paused) { this.onRender(0); return; }

    this._accumulator += dt;
    while (this._accumulator >= this.msPerTick) {
      this.onTick(1); // dt=1 tick unit
      this.tickCount++;
      this._accumulator -= this.msPerTick;
    }
    const alpha = this._accumulator / this.msPerTick;
    this.onRender(alpha);
  }
}
