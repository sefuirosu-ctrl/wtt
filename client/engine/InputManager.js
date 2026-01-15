// client/engine/InputManager.js

/**
 * InputManager
 * ----------------------------------------------------
 * Handles all player input timing and buffering.
 *
 * RESPONSIBILITIES:
 * - DAS / ARR handling
 * - IRS / IHS buffering
 * - Soft / Hard drop intent
 *
 * HARD CANON RULES:
 * - No gameplay logic
 * - No board awareness
 * - Data-driven timing model
 * - Hardcore difficulty uses strict TGM-style DAS
 */

export class InputManager {

    constructor() {
        /* ==============================
           TIMING CONFIG (INJECTED)
        ============================== */

        this.dasMs = 150;
        this.arrMs = 30;

        this.irsEnabled = true;
        this.ihsEnabled = true;

        this.strictDAS = false; // Hardcore flag

        /* ==============================
           INTERNAL STATE
        ============================== */

        this.keyState = {
            left: false,
            right: false,
            down: false
        };

        this.dasTimer = 0;
        this.arrTimer = 0;
        this.activeDirection = null;

        this.bufferedRotate = false;
        this.bufferedHold = false;
    }

    /* ==================================================
       CONFIGURATION
    ================================================== */

    /**
     * Configure input timing from timing model.
     * @param {Object} timingModel
     * @param {boolean} isHardcore
     */
    configure(timingModel, isHardcore = false) {
        this.dasMs = timingModel.dasMs;
        this.arrMs = timingModel.arrMs;
        this.irsEnabled = timingModel.irsEnabled;
        this.ihsEnabled = timingModel.ihsEnabled;

        this.strictDAS = isHardcore;

        this.reset();
    }

    /* ==================================================
       UPDATE LOOP
    ================================================== */

    /**
     * Update input timers.
     * Called once per frame with deltaMs.
     */
    update(deltaMs, callbacks) {
        if (!callbacks) return;

        this._handleHorizontal(deltaMs, callbacks);
        this._handleSoftDrop(callbacks);
    }

    /* ==================================================
       INPUT HANDLERS
    ================================================== */

    onKeyDown(key) {
        switch (key) {
            case 'ArrowLeft':
                this._startHorizontal('left');
                break;

            case 'ArrowRight':
                this._startHorizontal('right');
                break;

            case 'ArrowDown':
                this.keyState.down = true;
                break;

            case 'ArrowUp':
            case 'KeyX':
                if (this.irsEnabled) {
                    this.bufferedRotate = true;
                }
                break;

            case 'Space':
                if (this.ihsEnabled) {
                    this.bufferedHold = true;
                }
                break;
        }
    }

    onKeyUp(key) {
        switch (key) {
            case 'ArrowLeft':
                this._stopHorizontal('left');
                break;

            case 'ArrowRight':
                this._stopHorizontal('right');
                break;

            case 'ArrowDown':
                this.keyState.down = false;
                break;
        }
    }

    /* ==================================================
       INTERNAL LOGIC
    ================================================== */

    _startHorizontal(direction) {
        if (this.activeDirection === direction) return;

        this.keyState[direction] = true;
        this.activeDirection = direction;

        this.dasTimer = 0;
        this.arrTimer = 0;
    }

    _stopHorizontal(direction) {
        this.keyState[direction] = false;

        if (this.activeDirection === direction) {
            this.activeDirection = null;
            this.dasTimer = 0;
            this.arrTimer = 0;
        }
    }

    _handleHorizontal(deltaMs, callbacks) {
        if (!this.activeDirection) return;

        // Strict TGM-style: no instant repeat on tap
        this.dasTimer += deltaMs;

        if (this.dasTimer < this.dasMs) {
            // Initial delay: allow single move only in non-strict mode
            if (!this.strictDAS && this.dasTimer === deltaMs) {
                callbacks.move(this.activeDirection);
            }
            return;
        }

        // ARR phase
        this.arrTimer += deltaMs;

        if (this.arrTimer >= this.arrMs) {
            callbacks.move(this.activeDirection);
            this.arrTimer = 0;
        }
    }

    _handleSoftDrop(callbacks) {
        if (this.keyState.down) {
            callbacks.softDrop();
        }
    }

    /* ==================================================
       BUFFERED ACTIONS
    ================================================== */

    consumeBufferedRotate() {
        if (!this.bufferedRotate) return false;
        this.bufferedRotate = false;
        return true;
    }

    consumeBufferedHold() {
        if (!this.bufferedHold) return false;
        this.bufferedHold = false;
        return true;
    }

    /* ==================================================
       RESET
    ================================================== */

    reset() {
        this.dasTimer = 0;
        this.arrTimer = 0;
        this.activeDirection = null;
        this.bufferedRotate = false;
        this.bufferedHold = false;
    }
}
