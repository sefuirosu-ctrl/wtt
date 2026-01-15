// client/ui/pause/PauseMenu.js

/**
 * PauseMenu
 * ----------------------------------------------------
 * Canonical pause menu with localized entries.
 *
 * HARD CANON:
 * - No hardcoded text
 * - Difficulty change is forbidden
 * - Uses LocalizationSystem for all labels
 */

export default class PauseMenu {
    constructor(runContext) {
        this.run = runContext;

        this.visible = false;
        this.selectedIndex = 0;

        /* ==============================
           REFERENCES
        ============================== */

        this.events = this.run.events;
        this.localization = this.run.systems.localization;

        this._boundHandlers = [];

        /**
         * Canonical menu structure (IDs only).
         */
        this.menuItems = [
            { id: 'resume', labelKey: 'ui.pause.resume' },
            { id: 'surrender', labelKey: 'ui.pause.surrender' },
            { id: 'tutorials', labelKey: 'ui.pause.tutorials' },
            { id: 'settings', labelKey: 'ui.pause.settings' }
        ];
    }

    init() {
        if (!this.localization) {
            throw new Error(
                '[PauseMenu] Localization system is required.'
            );
        }

        this._bindEvents();
    }

    _bindEvents() {
        this._bind('language_changed', () => {
            // No state change needed; render resolves labels dynamically
        });
    }

    _bind(eventName, handler) {
        this.events.on(eventName, handler);
        this._boundHandlers.push({ eventName, handler });
    }

    /* ==================================================
       VISIBILITY
    ================================================== */

    show() {
        this.visible = true;
        this.selectedIndex = 0;
    }

    hide() {
        this.visible = false;
    }

    /* ==================================================
       NAVIGATION (CALLED BY INPUT/UI LAYER)
    ================================================== */

    navigateUp() {
        if (!this.visible) return;

        this.selectedIndex =
            (this.selectedIndex - 1 + this.menuItems.length) %
            this.menuItems.length;
    }

    navigateDown() {
        if (!this.visible) return;

        this.selectedIndex =
            (this.selectedIndex + 1) %
            this.menuItems.length;
    }

    confirm() {
        if (!this.visible) return;

        const item = this.menuItems[this.selectedIndex];

        switch (item.id) {
            case 'resume':
                this.events.emit('resume_requested');
                break;

            case 'surrender':
                this.events.emit('surrender_requested');
                break;

            case 'tutorials':
                this.events.emit('open_tutorials');
                break;

            case 'settings':
                this.events.emit('open_settings', {
                    allowDifficultyChange: false
                });
                break;
        }
    }

    /* ==================================================
       UPDATE LOOP
    ================================================== */

    update(deltaTime) {
        // Animations handled by UI layer
    }

    /* ==================================================
       RENDER DATA ACCESS
    ================================================== */

    getRenderData() {
        if (!this.visible) return null;

        return {
            selectedIndex: this.selectedIndex,
            items: this.menuItems.map(item => ({
                id: item.id,
                label: this.localization.t(item.labelKey)
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
        this.visible = false;
    }

    /* ==================================================
       DEBUG
    ================================================== */

    getDebugState() {
        return {
            visible: this.visible,
            selectedIndex: this.selectedIndex
        };
    }
}
