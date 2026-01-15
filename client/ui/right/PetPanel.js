// client/ui/right/PetPanel.js

/**
 * PetPanel
 * ----------------------------------------------------
 * Canonical tactical UI panel displaying Pet stats
 * and Pet skills.
 *
 * RESPONSIBILITIES:
 * - Display pet core stats
 * - Display pet skills and cooldowns
 *
 * HARD CANON:
 * - PetPanel NEVER decides gameplay logic
 * - PetPanel NEVER interacts with EmotionActionResolver
 * - PetPanel ONLY reads PetManager & SkillSystem
 * - PetPanel has NO 2D avatars (sprites only, handled elsewhere)
 * - Event-driven updates only
 */

export default class PetPanel {
    constructor(runContext) {
        this.run = runContext;

        /* ==============================
           STATE
        ============================== */

        this.visible = true;

        this.stats = {
            STR: 0,
            INT: 0,
            DEF: 0,
            SPD: 0
        };

        /**
         * skills:
         * [
         *   {
         *     id,
         *     level,
         *     cooldownMs,
         *     remainingCooldownMs,
         *     isAvailable
         *   }
         * ]
         */
        this.skills = [];

        /* ==============================
           REFERENCES
        ============================== */

        this.events = this.run.events;
        this.petManager = this.run.systems.petManager;
        this.skillSystem = this.run.systems.skillSystem;
        this.localization = this.run.systems.localization;

        /* ==============================
           INTERNAL
        ============================== */

        this._boundHandlers = [];
    }

    /* ==================================================
       INITIALIZATION
    ================================================== */

    init() {
        if (!this.petManager) {
            throw new Error(
                '[PetPanel] PetManager is required.'
            );
        }

        if (!this.skillSystem) {
            throw new Error(
                '[PetPanel] SkillSystem is required.'
            );
        }

        if (!this.localization) {
            throw new Error(
                '[PetPanel] Localization system is required.'
            );
        }

        this._bindEvents();
        this._refreshStats();
        this._refreshSkills();
    }

    /* ==================================================
       EVENT BINDING
    ================================================== */

    _bindEvents() {
        // Pet stat changes
        this._bind('pet_stats_updated', () => {
            this._refreshStats();
        });

        // Pet skill updates
        this._bind('pet_skills_updated', () => {
            this._refreshSkills();
        });

        this._bind('pet_skill_cooldown_updated', () => {
            this._refreshSkills();
        });

        // Language change
        this._bind('language_changed', () => {
            // Labels re-resolve in render
        });

        // Terminal states (panel remains visible but frozen)
        this._bind('run_completed', () => {
            this.visible = true;
        });

        this._bind('run_failed', () => {
            this.visible = true;
        });
    }

    _bind(eventName, handler) {
        this.events.on(eventName, handler);
        this._boundHandlers.push({ eventName, handler });
    }

    /* ==================================================
       DATA REFRESH
    ================================================== */

    _refreshStats() {
        const pet = this.petManager.getPet?.();
        if (!pet) return;

        this.stats = {
            STR: pet.stats?.STR ?? 0,
            INT: pet.stats?.INT ?? 0,
            DEF: pet.stats?.DEF ?? 0,
            SPD: pet.stats?.SPD ?? 0
        };
    }

    _refreshSkills() {
        const skills =
            this.skillSystem.getPetSkills?.() ?? [];

        this.skills = skills.map(skill => ({
            id: skill.id,
            level: skill.level,
            cooldownMs: skill.cooldownMs ?? 0,
            remainingCooldownMs:
                skill.remainingCooldownMs ?? 0,
            isAvailable:
                (skill.remainingCooldownMs ?? 0) <= 0
        }));
    }

    /* ==================================================
       UPDATE LOOP
    ================================================== */

    update(deltaTimeMs) {
        // Intentionally empty.
        // PetPanel is event-driven only.
    }

    /* ==================================================
       RENDER DATA
    ================================================== */

    getRenderData() {
        if (!this.visible) return null;

        return {
            stats: [
                {
                    id: 'STR',
                    label: this.localization.t(
                        'ui.stats.str'
                    ),
                    value: this.stats.STR
                },
                {
                    id: 'INT',
                    label: this.localization.t(
                        'ui.stats.int'
                    ),
                    value: this.stats.INT
                },
                {
                    id: 'DEF',
                    label: this.localization.t(
                        'ui.stats.def'
                    ),
                    value: this.stats.DEF
                },
                {
                    id: 'SPD',
                    label: this.localization.t(
                        'ui.stats.spd'
                    ),
                    value: this.stats.SPD
                }
            ],

            skills: this.skills.map(skill => ({
                id: skill.id,
                label: this.localization.t(
                    `ui.pet_skills.${skill.id}`
                ),
                level: skill.level,
                cooldownMs: skill.cooldownMs,
                remainingCooldownMs:
                    skill.remainingCooldownMs,
                isAvailable: skill.isAvailable
            }))
        };
    }

    /* ==================================================
       CLEANUP
    ================================================== */

    destroy() {
        this._boundHandlers.forEach(
            ({ eventName, handler }) => {
                this.events.off(eventName, handler);
            }
        );

        this._boundHandlers = [];
        this.visible = false;
    }

    /* ==================================================
       DEBUG
    ================================================== */

    getDebugState() {
        return {
            stats: this.stats,
            skills: this.skills
        };
    }
}
