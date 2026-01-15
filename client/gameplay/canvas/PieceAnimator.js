/**
 * PieceAnimator
 *
 * RESPONSIBILITY:
 * Handles smooth visual interpolation of piece position and rotation.
 *
 * Canon:
 * - Stage 5.0.2.1 — Piece Animation
 * - Visual-only
 * - Logic is authoritative
 *
 * This class:
 * - interpolates between previous and target snapshot
 * - does NOT know about collisions or gravity
 */

export class PieceAnimator {

    constructor() {
        this.current = null;
        this.target = null;

        this.animationTime = 0;
        this.duration = 120; // ms, visual smoothing window
    }

    // -----------------------------------------------------------------
    // SNAPSHOT UPDATE
    // -----------------------------------------------------------------

    /**
     * Called when logical piece state updates.
     * @param {Object} snapshot
     */
    setTarget(snapshot) {
        if (!this.current) {
            // First frame: snap directly
            this.current = this._clone(snapshot);
            this.target = this._clone(snapshot);
            this.animationTime = 0;
            return;
        }

        this.current = this.getInterpolated();
        this.target = this._clone(snapshot);
        this.animationTime = 0;
    }

    // -----------------------------------------------------------------
    // UPDATE
    // -----------------------------------------------------------------

    /**
     * Advance animation timer.
     * @param {number} deltaMs
     */
    update(deltaMs) {
        if (!this.target) return;

        this.animationTime += deltaMs;
        if (this.animationTime > this.duration) {
            this.animationTime = this.duration;
        }
    }

    // -----------------------------------------------------------------
    // INTERPOLATION
    // -----------------------------------------------------------------

    getInterpolated() {
        if (!this.current || !this.target) return null;

        const t = Math.min(this.animationTime / this.duration, 1);

        return {
            type: this.target.type,
            blocks: this.target.blocks,
            rotation: this._lerpAngle(
                this.current.rotation,
                this.target.rotation,
                t
            ),
            position: {
                x: this._lerp(this.current.position.x, this.target.position.x, t),
                y: this._lerp(this.current.position.y, this.target.position.y, t)
            }
        };
    }

    // -----------------------------------------------------------------
    // UTILITIES
    // -----------------------------------------------------------------

    _lerp(a, b, t) {
        return a + (b - a) * t;
    }

    _lerpAngle(a, b, t) {
        let diff = b - a;
        if (diff > Math.PI) diff -= Math.PI * 2;
        if (diff < -Math.PI) diff += Math.PI * 2;
        return a + diff * t;
    }

    _clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // -----------------------------------------------------------------
    // PUBLIC API
    // -----------------------------------------------------------------

    reset() {
        this.current = null;
        this.target = null;
        this.animationTime = 0;
    }
}
