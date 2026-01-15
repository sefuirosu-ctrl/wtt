// client/ui/pause/PauseOverlay.js

/**
 * PauseOverlay
 * ----------------------------------------------------
 * Canonical pause overlay and menu controller.
 *
 * RESPONSIBILITIES:
 * - Display pause animation and menu
 * - Handle pause navigation input
 * - Emit canonical pause events (resume / surrender)
 *
 * HARD CANON RULES:
 * - Pause is a UI overlay, NOT a gameplay state
 * - Pause freezes gameplay updates but does NOT modify GameFlow state
 * - Difficulty cannot be changed during pause
 * - Pause is DISABLED during terminal states (Victory / Defeat)
 */

import PauseMenu from './PauseMenu.js';

export default class PauseOverlay {
    constructor(runContext) {
        this.run = runContext;

        /* ==============================
           STATE
        ============================== */

        this.visible = false;

        /* ==============================
           UI COMPONENT
        ============================== */

        this.menu = null;

        /* ==============================
           EVENT BUS
        ============================== */

        this.events = this.run.events;
        this._boundHandlers = [];
    }

    /* ==================================================
       INITIALIZATION
    ================================================== */

    init() {
        this.menu = new PauseMenu(this.run);
        this.menu.init();

        this._bindEvents();
    }

    /* ==================================================
       EVENT BINDING
    ================================================== */

    _bindEvents() {
        // External pause request (input system)
        this._bind('pause_requested', () => {
            this.show();
        });

        // Resume requested from menu
        this._bind('resume_requested', () => {
            this.hide();
        });

        // Surrender requested from menu
        this._bind('surrender_requested', () => {
            this._handleSurrender();
        });

        // Run end always closes pause
        this._bind('run_completed', () => {
            this.hide();
        });

        this._bind('run_failed', () => {
            this.hide();
        });
    }

    _bind(eventName, handler) {
        this.events.on(eventName, handler);
        this._boundHandlers.push({ eventName, handler });
    }

    /* ==================================================
       VISIBILITY CONTROL
    ================================================== */

    show() {
        if (this.visible) return;

        /**
         * HARD CANON GUARD:
         * Pause is disabled during terminal states.
         */
        const gameFlow = this.run.systems?.gameFlow;
        if (gameFlow) {
            const flowState = gameFlow.getState?.();
            if (
                flowState?.state === 'RUN_COMPLETED' ||
                flowState?.state === 'RUN_FAILED'
            ) {
                return;
            }
        }

        this.visible = true;

        // Trigger pause animation (handled by UI layer)
        this.menu.show();
    }

    hide() {
        if (!this.visible) return;

        this.visible = false;

        this.menu.hide();

        // Resume gameplay via HUDRoot
        this.events.emit('resume_requested');
    }

    /* ==================================================
       SURRENDER HANDLING
    ================================================== */

    _handleSurrender() {
        // Canon: surrender counts as defeat
        this.hide();

        this.run.endRun?.('defeat');
    }

    /* ==================================================
       UPDATE LOOP
    ================================================== */

    update(deltaTime) {
        if (!this.visible) return;

        this.menu.update(deltaTime);
    }

    /* ==================================================
       CLEANUP
    ================================================== */

    destroy() {
        this._boundHandlers.forEach(({ eventName, handler }) => {
            this.events.off(eventName, handler);
        });

        this.menu?.destroy();
        this.menu = null;
        this.visible = false;
    }

    /* ==================================================
       DEBUG
    ================================================== */

    getDebugState() {
        return {
            visible: this.visible
        };
    }
}
