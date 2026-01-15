// client/engine/GameLoop.js
// Canon: single responsibility = time + tick driving. No gameplay logic.

export class GameLoop {
  constructor(options = {}) {
    const {
      // onTick(deltaMs, nowMs) optional callback
      onTick = null,
      // target FPS cap (optional). If null -> uncapped RAF
      maxFps = null,
      // start paused
      startPaused = false,
    } = options;

    // ---- Time model ----
    this._running = false;
    this._paused = !!startPaused;

    this._lastNow = 0;
    this._rafId = null;

    // FPS cap
    this._maxFps = (typeof maxFps === "number" && maxFps > 0) ? maxFps : null;
    this._minFrameMs = this._maxFps ? (1000 / this._maxFps) : 0;

    // ---- Systems (optional, future-proof) ----
    this._systems = [];

    // ---- Callback guard (THIS FIXES YOUR CRASH) ----
    this.onTick = (typeof onTick === "function") ? onTick : () => {};
  }

  /* =========================
     Public API
  ========================= */

  start() {
    if (this._running) return;
    this._running = true;

    // initialize last time
    this._lastNow = performance.now();
    this._rafId = requestAnimationFrame(this._tick);
  }

  stop() {
    this._running = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._rafId = null;
  }

  pause() {
    this._paused = true;
  }

  resume() {
    // reset time delta to avoid huge spike
    this._paused = false;
    this._lastNow = performance.now();
  }

  setOnTick(fn) {
    this.onTick = (typeof fn === "function") ? fn : () => {};
  }

  addSystem(system) {
    // system.update(deltaMs, nowMs) optional
    if (system && !this._systems.includes(system)) {
      this._systems.push(system);
    }
  }

  removeSystem(system) {
    this._systems = this._systems.filter(s => s !== system);
  }

  /* =========================
     Internal tick
  ========================= */

  _tick = (now) => {
    if (!this._running) return;

    const delta = now - this._lastNow;

    // FPS cap: skip frame if too soon
    if (this._minFrameMs && delta < this._minFrameMs) {
      this._rafId = requestAnimationFrame(this._tick);
      return;
    }

    this._lastNow = now;

    if (!this._paused) {
      const deltaMs = Math.max(0, delta);

      // 1) external callback (safe всегда)
      this.onTick(deltaMs, now);

      // 2) optional systems
      for (const s of this._systems) {
        if (s && typeof s.update === "function") {
          s.update(deltaMs, now);
        }
      }
    }

    this._rafId = requestAnimationFrame(this._tick);
  };
}
