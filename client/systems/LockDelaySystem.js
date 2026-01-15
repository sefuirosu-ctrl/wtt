/**
 * LockDelaySystem
 *
 * RESPONSIBILITY:
 * Controls piece lock delay behavior.
 *
 * Canon:
 * - Supports Classic and Hardcore timing models
 * - Data-driven configuration via timing model
 * - No direct dependency on difficulty system
 */

export class LockDelaySystem {

    constructor() {
        // Default values (will be overridden by configure)
        this.lockDelayMs = 500;
        this.lockResetOnMove = true;
        this.lockResetOnRotate = true;
        this.maxLockResets = null;

        this.lockTimer = 0;
        this.lockResetCount = 0;
        this.isLocking = false;
    }

    /**
     * Configure lock delay behavior from timing model.
     * @param {Object} timing
     */
    configure(timing) {
        this.lockDelayMs = timing.lockDelayMs;
        this.lockResetOnMove = timing.lockResetOnMove;
        this.lockResetOnRotate = timing.lockResetOnRotate;
        this.maxLockResets = timing.maxLockResets;

        this.reset();
    }

    /**
     * Called when piece touches the ground.
     */
    startLock() {
        this.isLocking = true;
        this.lockTimer = 0;
        this.lockResetCount = 0;
    }

    /**
     * Called when piece leaves the ground.
     */
    cancelLock() {
        this.reset();
    }

    /**
     * Reset lock state completely.
     */
    reset() {
        this.isLocking = false;
        this.lockTimer = 0;
        this.lockResetCount = 0;
    }

    /**
     * Update lock timer.
     * @param {number} deltaMs
     * @returns {boolean} true if piece should lock
     */
    update(deltaMs) {
        if (!this.isLocking) return false;

        this.lockTimer += deltaMs;
        return this.lockTimer >= this.lockDelayMs;
    }

    /**
     * Notify system that piece was moved.
     */
    onPieceMove() {
        if (!this.isLocking || !this.lockResetOnMove) return;

        if (this._canResetLock()) {
            this._resetLockTimer();
        }
    }

    /**
     * Notify system that piece was rotated.
     */
    onPieceRotate() {
        if (!this.isLocking || !this.lockResetOnRotate) return;

        if (this._canResetLock()) {
            this._resetLockTimer();
        }
    }

    // -----------------------------------------------------------------
    // INTERNAL
    // -----------------------------------------------------------------

    _canResetLock() {
        if (this.maxLockResets === null) return true;
        return this.lockResetCount < this.maxLockResets;
    }

    _resetLockTimer() {
        this.lockTimer = 0;
        this.lockResetCount++;
    }
}
