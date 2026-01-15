/**
 * BaseFXLayer
 *
 * RESPONSIBILITY:
 * Abstract base class for all canvas-based FX layers.
 *
 * Canon:
 * - Stage 5.0.3 — Line Clear & Combo FX
 * - Visual-only, event-driven
 * - No gameplay logic
 *
 * FX Layer lifecycle:
 * - trigger(data) → create effect instance
 * - update(deltaMs) → advance effect time
 * - render(ctx) → draw active effects
 *
 * This class:
 * - manages active effects
 * - handles lifetime & cleanup
 * - exposes needsRedraw flag for render loop
 */

export class BaseFXLayer {

    constructor() {
        /**
         * Active FX instances.
         * Each instance is an object with:
         * - time: elapsed ms
         * - duration: total lifetime ms
         * - data: arbitrary payload
         */
        this.effects = [];

        // Render flag (used by CanvasRenderLoop)
        this.needsRedraw = false;
    }

    // -----------------------------------------------------------------
    // FX TRIGGER
    // -----------------------------------------------------------------

    /**
     * Trigger a new FX instance.
     * @param {Object} data - FX-specific payload
     * @param {number} duration - lifetime in ms
     */
    trigger(data, duration = 300) {
        this.effects.push({
            time: 0,
            duration,
            data
        });

        this.needsRedraw = true;
    }

    // -----------------------------------------------------------------
    // UPDATE
    // -----------------------------------------------------------------

    /**
     * Update all active FX.
     * @param {number} deltaMs
     */
    update(deltaMs) {
        if (this.effects.length === 0) {
            this.needsRedraw = false;
            return;
        }

        for (const fx of this.effects) {
            fx.time += deltaMs;
        }

        // Remove expired FX
        this.effects = this.effects.filter(fx => fx.time < fx.duration);

        this.needsRedraw = this.effects.length > 0;
    }

    // -----------------------------------------------------------------
    // RENDER
    // -----------------------------------------------------------------

    /**
     * Render all active FX.
     * Subclasses should override _renderEffect().
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        if (this.effects.length === 0) return;

        for (const fx of this.effects) {
            const progress = Math.min(fx.time / fx.duration, 1);
            this._renderEffect(ctx, fx.data, progress);
        }
    }

    /**
     * Render a single FX instance.
     * Must be implemented by subclasses.
     */
    _renderEffect(ctx, data, progress) {
        // Abstract method
        // Implement in subclass
    }

    // -----------------------------------------------------------------
    // RESET
    // -----------------------------------------------------------------

    /**
     * Clear all FX immediately.
     */
    clear() {
        this.effects = [];
        this.needsRedraw = false;
    }
}
