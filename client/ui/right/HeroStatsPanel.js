// client/ui/right/HeroStatsPanel.js

/**
 * HeroStatsPanel
 * ----------------------------------------------------
 * Canonical tactical UI panel displaying Hero stats,
 * skills and cooldowns.
 *
 * RESPONSIBILITIES:
 * - Display core hero stats (STR / INT / DEF / SPD)
 * - Display hero skills (1–4) and their cooldown states
 * - React to stat/skill updates via systems
 *
 * HARD CANON:
 * - This panel NEVER decides gameplay logic
 * - This panel NEVER interacts with EmotionActionResolver
 * - This panel ONLY reads CharacterManager & SkillSystem
 * - No per-frame calculations (event-driven updates)
 */

export default class HeroStatsPanel {
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
         *     isUltimate,
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
        this.characterManager = this.run.systems.characterManager;
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
        if (!this.characterManager) {
            throw new Error(
                '[HeroStatsPanel] CharacterManager is required.'
            );
        }

        if (!this.skillSystem) {
            throw new Error(
                '[HeroStatsPanel] SkillSystem is required.'
            );
        }

        if (!this.localization) {
            throw new Error(
                '[HeroStatsPanel] Localization system is required.'
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
        // Character stat changes
        this._bind('hero_stats_updated', () => {
            this._refreshStats();
        });

        // Skill availability / cooldown changes
        this._bind('hero_skills_updated', () => {
            this._refreshSkills();
        });

        // Cooldown tick updates (event-driven, not per-frame)
        this._bind('skill_cooldown_updated', () => {
            this._refreshSkills();
        });

        // Language change (labels only)
        this._bind('language_changed', () => {
            // No data change needed; labels re-resolve in render
        });

        // Terminal states freeze UI
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
        const hero = this.characterManager.getHero?.();
        if (!hero) return;

        this.stats = {
            STR: hero.stats?.STR ?? 0,
            INT: hero.stats?.INT ?? 0,
            DEF: hero.stats?.DEF ?? 0,
            SPD: hero.stats?.SPD ?? 0
        };
    }

    _refreshSkills() {
        const skills =
            this.skillSystem.getHeroSkills?.() ?? [];

        this.skills = skills.map(skill => ({
            id: skill.id,
            level: skill.level,
            isUltimate: skill.isUltimate === true,
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
        // HeroStatsPanel is event-driven only.
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
                    `ui.skills.${skill.id}`
                ),
                level: skill.level,
                isUltimate: skill.isUltimate,
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
