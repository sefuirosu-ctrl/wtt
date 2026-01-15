// client/ui/HUDRoot.js

/**
 * HUDRoot
 * ----------------------------------------------------
 * Canonical root container for the gameplay HUD.
 *
 * RESPONSIBILITIES:
 * - Own UI layout composition
 * - Create and manage UI columns
 * - Subscribe to GameFlow / RunContext events
 * - Control pause overlay visibility
 *
 * HARD CANON RULES:
 * - HUDRoot contains NO gameplay logic
 * - HUDRoot does NOT modify game state
 * - HUDRoot is always present during gameplay
 */

import LeftColumn from './columns/LeftColumn.js';
import CenterColumn from './columns/CenterColumn.js';
import RightColumn from './columns/RightColumn.js';
import BottomBar from './bottom/BottomBar.js';
import PauseOverlay from './pause/PauseOverlay.js';

export default class HUDRoot {
    constructor(runContext) {
        this.run = runContext;

        /* ==============================
           STATE
        ============================== */

        this.isVisible = false;
        this.isPaused = false;

        /* ==============================
           UI SUB-COMPONENTS
        ============================== */

        this.leftColumn = null;
        this.centerColumn = null;
        this.rightColumn = null;
        this.bottomBar = null;
        this.pauseOverlay = null;

        /* ==============================
           EVENT BUS
        ============================== */

        this.events = this.run.events;

        this._boundHandlers = [];
    }

    /* ==================================================
       INITIALIZATION
    ================================================== */

    /**
     * Initialize HUD and all child components.
     * Called once after RunContext is ready.
     */
    init() {
        if (this.isVisible) {
            throw new Error('[HUDRoot] Already initialized.');
        }

        this.leftColumn = new LeftColumn(this.run);
        this.centerColumn = new CenterColumn(this.run);
        this.rightColumn = new RightColumn(this.run);
        this.bottomBar = new BottomBar(this.run);

        this.pauseOverlay = new PauseOverlay(this.run);

        this._bindEvents();

        this.leftColumn.init();
        this.centerColumn.init();
        this.rightColumn.init();
        this.bottomBar.init();
        this.pauseOverlay.init();

        this.isVisible = true;
    }

    /* ==================================================
       EVENT BINDING
    ================================================== */

    _bindEvents() {
        this._bind('pause_requested', () => {
            this.showPause();
        });

        this._bind('resume_requested', () => {
            this.hidePause();
        });

        this._bind('run_completed', () => {
            this.hidePause();
        });

        this._bind('run_failed', () => {
            this.hidePause();
        });
    }

    _bind(eventName, handler) {
        this.events.on(eventName, handler);
        this._boundHandlers.push({ eventName, handler });
    }

    /* ==================================================
       PAUSE CONTROL
    ================================================== */

    showPause() {
        if (this.isPaused) return;

        this.isPaused = true;
        this.pauseOverlay.show();
    }

    hidePause() {
        if (!this.isPaused) return;

        this.isPaused = false;
        this.pauseOverlay.hide();
    }

    /* ==================================================
       UPDATE LOOP
    ================================================== */

    /**
     * Update UI components.
     * Note: HUDRoot itself does not tick gameplay.
     */
    update(deltaTime) {
        if (!this.isVisible) return;

        this.leftColumn.update(deltaTime);
        this.centerColumn.update(deltaTime);
        this.rightColumn.update(deltaTime);
        this.bottomBar.update(deltaTime);

        if (this.isPaused) {
            this.pauseOverlay.update(deltaTime);
        }
    }

    /* ==================================================
       VISIBILITY CONTROL
    ================================================== */

    show() {
        if (!this.isVisible) return;
        // Root visibility handled by UI framework / DOM
    }

    hide() {
        if (!this.isVisible) return;
        // Root visibility handled by UI framework / DOM
    }

    /* ==================================================
       CLEANUP
    ================================================== */

    /**
     * Cleanup on run end or scene transition.
     */
    destroy() {
        this._boundHandlers.forEach(({ eventName, handler }) => {
            this.events.off(eventName, handler);
        });

        this.leftColumn?.destroy();
        this.centerColumn?.destroy();
        this.rightColumn?.destroy();
        this.bottomBar?.destroy();
        this.pauseOverlay?.destroy();

        this.leftColumn = null;
        this.centerColumn = null;
        this.rightColumn = null;
        this.bottomBar = null;
        this.pauseOverlay = null;

        this.isVisible = false;
        this.isPaused = false;
    }

    /* ==================================================
       DEBUG
    ================================================== */

    getDebugState() {
        return {
            visible: this.isVisible,
            paused: this.isPaused
        };
    }
}
