// client/ui/bottom/HotkeyLegend.js

/**
 * HotkeyLegend
 * ----------------------------------------------------
 * Canonical UI component displaying current control bindings.
 *
 * RESPONSIBILITIES:
 * - Display localized action labels
 * - Display current key / button bindings
 * - React dynamically to binding and language changes
 *
 * HARD CANON RULES:
 * - NEVER contains hardcoded text
 * - Action names are localized
 * - Key labels are NOT localized
 * - ALWAYS reflects current input bindings
 * - ALWAYS visible during gameplay and pause
 * - Does NOT handle input itself
 */

export default class HotkeyLegend {
    constructor(runContext) {
        this.run = runContext;

        /* ==============================
           STATE
        ============================== */

        this.visible = true;
        this.bindings = [];

        /* ==============================
           REFERENCES
        ============================== */

        this.input = this.run.systems.input;
        this.localization = this.run.systems.localization;
        this.events = this.run.events;

        this._boundHandlers = [];
    }

    /* ==================================================
       INITIALIZATION
    ================================================== */

    init() {
        if (!this.input) {
            throw new Error(
                '[HotkeyLegend] Input system is required.'
            );
        }

        if (!this.localization) {
            throw new Error(
                '[HotkeyLegend] Localization system is required.'
            );
        }

        this._refreshBindings();
        this._bindEvents();
    }

    /* ==================================================
       EVENT BINDING
    ================================================== */

    _bindEvents() {
        // Rebuild legend when user changes controls
        this._bind('input_bindings_changed', () => {
            this._refreshBindings();
        });

        // Rebuild legend when language changes
        this._bind('language_changed', () => {
            this._refreshBindings();
        });

        // Hotkey legend remains visible during pause
        this._bind('pause_requested', () => {
            this.visible = true;
        });

        this._bind('resume_requested', () => {
            this.visible = true;
        });
    }

    _bind(eventName, handler) {
        this.events.on(eventName, handler);
        this._boundHandlers.push({ eventName, handler });
    }

    /* ==================================================
       BINDING RESOLUTION
    ================================================== */

    /**
     * Rebuilds displayed bindings from Input system.
     * Action labels are localized; keys are raw.
     */
    _refreshBindings() {
        /**
         * Canonical action order for legend.
         * These are ACTION IDS, not display text.
         */
        const ACTIONS = [
            'move_left',
            'move_right',
            'soft_drop',
            'hard_drop',
            'rotate_left',
            'rotate_right',
            'hold',
            'pause'
        ];

        this.bindings = ACTIONS.map(actionId => {
            return {
                actionId,
                label: this.localization.t(
                    `ui.controls.${actionId}`
                ),
                keys: this._normalizeKeys(
                    this.input.getBindingForAction(actionId)
                )
            };
        });
    }

    _normalizeKeys(keys) {
        if (!keys) return [];

        return Array.isArray(keys) ? keys : [keys];
    }

    /* ==================================================
       UPDATE LOOP
    ================================================== */

    update(deltaTime) {
        // No per-frame logic required
    }

    /* ==================================================
       RENDER DATA ACCESS
    ================================================== */

    /**
     * Returns localized legend data for rendering.
     */
    getRenderData() {
        if (!this.visible) return [];

        return this.bindings.map(binding => ({
            actionId: binding.actionId,
            label: binding.label,   // localized
            keys: binding.keys      // raw, not localized
        }));
    }

    /* ==================================================
       CLEANUP
    ================================================== */

    destroy() {
        this._boundHandlers.forEach(({ eventName, handler }) => {
            this.events.off(eventName, handler);
        });

        this._boundHandlers = [];
        this.bindings = [];
        this.visible = false;
    }

    /* ==================================================
       DEBUG
    ================================================== */

    getDebugState() {
        return {
            visible: this.visible,
            bindings: this.bindings
        };
    }
}
