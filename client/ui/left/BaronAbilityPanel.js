// client/ui/left/BaronAbilityPanel.js

/**
 * BaronAbilityPanel
 * ----------------------------------------------------
 * Canonical UI panel displaying Baron interventions,
 * warnings, and cooldowns.
 *
 * RESPONSIBILITIES:
 * - Display upcoming / active Baron interventions
 * - Display cooldown timers and warning states
 * - Reflect Final Act escalation (Architect mode)
 * - Display localized labels only
 *
 * HARD CANON RULES:
 * - This panel NEVER decides anything
 * - This panel NEVER modifies gameplay
 * - This panel NEVER contains hardcoded text
 * - All text is resolved via LocalizationSystem
 */

export default class BaronAbilityPanel {
    constructor(runContext) {
        this.run = runContext;

        /* ==============================
           STATE
        ============================== */

        this.visible = true;
        this.isFinalAct = false;

        /**
         * [
         *   {
         *     id,
         *     labelKey,
         *     cooldownMs,
         *     remainingMs,
         *     state: 'ready' | 'cooldown' | 'warning'
         *   }
         * ]
         */
        this.abilities = [];

        /* ==============================
           REFERENCES
        ============================== */

        this.events = this.run.events;
        this.baronAI = this.run.systems.baronAI;
        this.localization = this.run.systems.localization;

        this._boundHandlers = [];
    }

    /* ==================================================
       INITIALIZATION
    ================================================== */

    init() {
        if (!this.localization) {
            throw new Error(
                '[BaronAbilityPanel] Localization system is required.'
            );
        }

        this._bindEvents();
        this._refreshAbilities();
    }

    /* ==================================================
       EVENT BINDING
    ================================================== */

    _bindEvents() {
        this._bind('baron_behavior_changed', () => {
            this._refreshAbilities();
        });

        this._bind('minion_activated', () => {
            this._refreshAbilities();
        });

        this._bind('minion_deactivated', () => {
            this._refreshAbilities();
        });

        this._bind('final_act_started', () => {
            this.isFinalAct = true;
            this._refreshAbilities();
        });

        this._bind('language_changed', () => {
            this._refreshAbilities();
        });

        this._bind('run_completed', () => {
            this.visible = false;
        });

        this._bind('run_failed', () => {
            this.visible = false;
        });
    }

    _bind(eventName, handler) {
        this.events.on(eventName, handler);
        this._boundHandlers.push({ eventName, handler });
    }

    /* ==================================================
       DATA RESOLUTION
    ================================================== */

    /**
     * Refresh abilities list based on current Baron state.
     * Pure read-only logic.
     */
    _refreshAbilities() {
        if (!this.baronAI?.getAvailableInterventions) {
            this.abilities = [];
            return;
        }

        const raw = this.baronAI.getAvailableInterventions();

        this.abilities = raw.map(item => ({
            id: item.id,
            labelKey: item.labelKey, // localization key
            cooldownMs: item.cooldownMs,
            remainingMs: item.remainingMs,
            state: this._resolveState(item)
        }));
    }

    _resolveState(item) {
        if (item.isWarning) return 'warning';
        if (item.remainingMs > 0) return 'cooldown';
        return 'ready';
    }

    /* ==================================================
       UPDATE LOOP
    ================================================== */

    update(deltaTimeMs) {
        if (!this.visible) return;

        this.abilities.forEach(ability => {
            if (ability.remainingMs > 0) {
                ability.remainingMs =
                    Math.max(0, ability.remainingMs - deltaTimeMs);

                if (ability.remainingMs === 0) {
                    ability.state = 'ready';
                }
            }
        });
    }

    /* ==================================================
       RENDER DATA ACCESS
    ================================================== */

    /**
     * Returns localized render payload.
     */
    getRenderData() {
        if (!this.visible) return null;

        return {
            isFinalAct: this.isFinalAct,
            abilities: this.abilities.map(a => ({
                id: a.id,
                label: this.localization.t(a.labelKey),
                cooldownMs: a.cooldownMs,
                remainingMs: a.remainingMs,
                state: a.state
            }))
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
        this.abilities = [];
        this.visible = false;
    }

    /* ==================================================
       DEBUG
    ================================================== */

    getDebugState() {
        return {
            visible: this.visible,
            isFinalAct: this.isFinalAct,
            abilities: this.abilities
        };
    }
}
