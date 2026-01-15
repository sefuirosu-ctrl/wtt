// client/ui/center/RunInfoBar.js

/**
 * RunInfoBar
 * ----------------------------------------------------
 * Canonical UI component displaying global run progression.
 *
 * Displays:
 *   [ ACT | LEVEL | TIME ]
 *
 * HARD CANON RULES:
 * - No hardcoded text
 * - Uses LocalizationSystem for all labels
 * - Always visible, including Final Act
 * - Reacts to pause and language change
 * - Does NOT affect gameplay
 */

export default class RunInfoBar {
    constructor(runContext) {
        this.run = runContext;

        /* ==============================
           STATE
        ============================== */

        this.currentAct = 1;
        this.currentLevel = 1;
        this.elapsedTimeMs = 0;

        this.isRunning = false;

        /* ==============================
           REFERENCES
        ============================== */

        this.events = this.run.events;
        this.localization = this.run.systems.localization;

        this._boundHandlers = [];
    }

    /* ==================================================
       INITIALIZATION
    ================================================== */

    init() {
        if (!this.localization) {
            throw new Error(
                '[RunInfoBar] Localization system is required.'
            );
        }

        this._bindEvents();
        this.isRunning = true;
    }

    /* ==================================================
       EVENT BINDING
    ================================================== */

    _bindEvents() {
        this._bind('run_started', payload => {
            this.currentAct = payload.act;
            this.currentLevel = payload.level;
            this.elapsedTimeMs = 0;
            this.isRunning = true;
        });

        this._bind('act_started', payload => {
            this.currentAct = payload.act;
        });

        this._bind('level_completed', payload => {
            this.currentLevel = payload.level;
        });

        this._bind('final_act_started', payload => {
            this.currentAct = payload.act;
        });

        this._bind('run_completed', () => {
            this.isRunning = false;
        });

        this._bind('run_failed', () => {
            this.isRunning = false;
        });

        this._bind('pause_requested', () => {
            this.isRunning = false;
        });

        this._bind('resume_requested', () => {
            this.isRunning = true;
        });

        this._bind('language_changed', () => {
            // No state change needed, render will re-resolve text
        });
    }

    _bind(eventName, handler) {
        this.events.on(eventName, handler);
        this._boundHandlers.push({ eventName, handler });
    }

    /* ==================================================
       UPDATE LOOP
    ================================================== */

    update(deltaTimeMs) {
        if (!this.isRunning) return;

        this.elapsedTimeMs += deltaTimeMs;
    }

    /* ==================================================
       FORMATTERS (LOCALIZATION-AWARE)
    ================================================== */

    _formatTime() {
        const totalSeconds = Math.floor(this.elapsedTimeMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const pad = n => String(n).padStart(2, '0');

        if (hours > 0) {
            return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        }

        return `${pad(minutes)}:${pad(seconds)}`;
    }

    /* ==================================================
       RENDER DATA ACCESS
    ================================================== */

    /**
     * Returns fully localized render payload.
     * UI layer decides layout and separators.
     */
    getRenderData() {
        return {
            act: {
                label: this.localization.t('ui.runinfo.act'),
                value: this.currentAct
            },
            level: {
                label: this.localization.t('ui.runinfo.level'),
                value: this.currentLevel
            },
            time: {
                label: this.localization.t('ui.runinfo.time'),
                value: this._formatTime()
            }
        };
    }

    /* ==================================================
       CLEANUP
    ================================================== */

    destroy() {
        this._boundHandlers.forEach(({ eventName, handler }) => {
            this.events.off(eventName, handler);
        });

        this._boundHandlers = [];
        this.isRunning = false;
    }

    /* ==================================================
       DEBUG
    ================================================== */

    getDebugState() {
        return {
            act: this.currentAct,
            level: this.currentLevel,
            elapsedTimeMs: this.elapsedTimeMs,
            running: this.isRunning
        };
    }
}
