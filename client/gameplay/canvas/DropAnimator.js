/**
 * DropAnimator
 *
 * RESPONSIBILITY:
 * Visual-only handling of soft drop and hard drop animations.
 *
 * Canon:
 * - Stage 5.0.2.2 — Drop Animations
 * - Logic authoritative
 * - Visual layer reacts to events only
 *
 * This animator modifies vertical interpolation speed and
 * applies short-lived impulses for hard drop.
 */

export class DropAnimator {

    constructor() {
        // Multipliers applied to visual interpolation
        this.softDropMultiplier = 1.0;
        this.hardDropImpulse = 0;

        // Timing
        this.hardDropDuration = 80; // ms
        this.hardDropTime = 0;
    }

    // -----------------------------------------------------------------
    // EVENTS
    // -----------------------------------------------------------------

    onSoftDropStart() {
        // Increase visual falling speed
        this.softDropMultiplier = 2.5;
    }

    onSoftDropEnd() {
        this.softDropMultiplier = 1.0;
    }

    onHardDrop() {
        // Trigger a short visual impulse
        this.hardDropImpulse = 1.0;
        this.hardDropTime = 0;
    }

    // -----------------------------------------------------------------
    // UPDATE
    // -----------------------------------------------------------------

    /**
     * Update animator state.
     * @param {number} deltaMs
     */
    update(deltaMs) {
        if (this.hardDropImpulse > 0) {
            this.hardDropTime += deltaMs;
            const t = Math.min(this.hardDropTime / this.hardDropDuration, 1);

            // Ease-out impulse
            this.hardDropImpulse = 1 - t;

            if (t >= 1) {
                this.hardDropImpulse = 0;
                this.hardDropTime = 0;
            }
        }
    }

    // -----------------------------------------------------------------
    // APPLICATION
    // -----------------------------------------------------------------

    /**
     * Apply drop modifiers to interpolated Y position.
     * @param {number} y
     * @param {number} deltaMs
     */
    apply(y, deltaMs) {
        let result = y;

        // Soft drop: accelerate downward movement
        if (this.softDropMultiplier > 1) {
            result += (deltaMs / 16) * (this.softDropMultiplier - 1);
        }

        // Hard drop: add short impulse
        if (this.hardDropImpulse > 0) {
            result += this.hardDropImpulse * 0.6;
        }

        return result;
    }

    // -----------------------------------------------------------------
    // RESET
    // -----------------------------------------------------------------

    reset() {
        this.softDropMultiplier = 1.0;
        this.hardDropImpulse = 0;
        this.hardDropTime = 0;
    }
}
