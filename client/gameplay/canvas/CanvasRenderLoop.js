/**
 * CanvasRenderLoop
 *
 * RESPONSIBILITY:
 * Central requestAnimationFrame loop for all Canvas renderers.
 *
 * Canon:
 * - Stage 5.0 — Gameplay Visual Layer
 * - Game logic is authoritative
 * - Render loop is purely visual
 *
 * Design goals:
 * - Single rAF loop (no multiple competing loops)
 * - Dirty-flag based rendering
 * - Safe start / stop lifecycle
 */

export class CanvasRenderLoop {

    constructor() {
        this.renderers = new Set();
        this.isRunning = false;
        this.rafId = null;

        this._boundTick = this._tick.bind(this);
    }

    // ---------------------------------------------------------------------
    // REGISTRATION
    // ---------------------------------------------------------------------

    /**
     * Register a renderer that exposes:
     * - render()
     * - needsRedraw (boolean)
     */
    register(renderer) {
        if (!renderer || typeof renderer.render !== 'function') {
            console.warn('[CanvasRenderLoop] Invalid renderer registered', renderer);
            return;
        }

        this.renderers.add(renderer);
        this._ensureRunning();
    }

    unregister(renderer) {
        if (!renderer) return;

        this.renderers.delete(renderer);

        if (this.renderers.size === 0) {
            this._stop();
        }
    }

    // ---------------------------------------------------------------------
    // LOOP CONTROL
    // ---------------------------------------------------------------------

    _ensureRunning() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.rafId = requestAnimationFrame(this._boundTick);
    }

    _stop() {
        if (!this.isRunning) return;

        cancelAnimationFrame(this.rafId);
        this.rafId = null;
        this.isRunning = false;
    }

    // ---------------------------------------------------------------------
    // MAIN TICK
    // ---------------------------------------------------------------------

    _tick() {
        if (!this.isRunning) return;

        let needsAnotherFrame = false;

        for (const renderer of this.renderers) {
            if (renderer.needsRedraw) {
                renderer.render();
                needsAnotherFrame = true;
            }
        }

        // Continue loop only if someone still needs redraw
        if (needsAnotherFrame) {
            this.rafId = requestAnimationFrame(this._boundTick);
        } else {
            // Go idle until next dirty flag
            this.isRunning = false;
            this.rafId = null;
        }
    }

    // ---------------------------------------------------------------------
    // PUBLIC API
    // ---------------------------------------------------------------------

    /**
     * Forces a redraw on all registered renderers.
     * Useful for resize, theme change, etc.
     */
    requestFullRedraw() {
        for (const renderer of this.renderers) {
            renderer.needsRedraw = true;
        }
        this._ensureRunning();
    }

    /**
     * Stop loop completely (e.g. on scene unload).
     */
    destroy() {
        this._stop();
        this.renderers.clear();
    }
}
