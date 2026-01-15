// client/characters/CharacterBase.js

/**
 * CharacterBase
 * ----------------------------------------------------
 * Abstract base class for all playable characters.
 *
 * Design rules:
 * - Characters NEVER modify core systems directly
 * - All influence happens through registered modifiers
 * - Ability Gauge is centralized here
 * - Skills are data-driven
 * - Hooks are optional, never mandatory
 */

export default class CharacterBase {
    constructor(gameContext, data) {
        if (new.target === CharacterBase) {
            throw new Error('CharacterBase is abstract and cannot be instantiated directly.');
        }

        this.game = gameContext;
        this.data = data;

        // Identity
        this.id = data.id;
        this.name = data.name;
        this.archetype = data.archetype;
        this.role = data.role;

        /* ==============================
           Ability Gauge
        ============================== */

        this.maxGauge = 100;
        this.currentGauge = 0;
        this.gaugeGainMultiplier = 1.0;

        this.gaugePenalty = 0; // temporary penalty after ultimates

        /* ==============================
           Skill Levels
        ============================== */

        // skillId -> level (1–25)
        this.skillLevels = {};

        /* ==============================
           Temporary Effects
        ============================== */

        this.temporaryEffects = [];

        /* ==============================
           System References (resolved later)
        ============================== */

        this.systems = {};
    }

    /* ==================================================
       REGISTRATION & LIFECYCLE
    ================================================== */

    /**
     * Called once when character is added to the game
     */
    onRegister(systems) {
        this.systems = systems;
    }

    /**
     * Called every frame or fixed tick
     */
    onUpdate(deltaTime) {
        this.updateTemporaryEffects(deltaTime);
    }

    /**
     * Optional hooks (implemented by subclasses)
     */
    onPlayerMistake(context) {}
    onLineClear(context) {}
    onCombo(context) {}
    onBaronEscalation(context) {}
    onPressureChange(context) {}

    /* ==================================================
       ABILITY GAUGE MANAGEMENT
    ================================================== */

    gainGauge(amount) {
        const effectiveGain =
            amount *
            this.gaugeGainMultiplier *
            (1 - this.gaugePenalty);

        this.currentGauge = Math.min(
            this.maxGauge,
            this.currentGauge + effectiveGain
        );
    }

    canSpendGauge(amount) {
        return this.currentGauge >= amount;
    }

    spendGauge(amount) {
        if (!this.canSpendGauge(amount)) return false;
        this.currentGauge -= amount;
        return true;
    }

    applyTemporaryGaugePenalty(penalty) {
        this.gaugePenalty = Math.min(1, this.gaugePenalty + penalty);
    }

    clearGaugePenalty() {
        this.gaugePenalty = 0;
    }

    /* ==================================================
       SKILL LEVEL MANAGEMENT
    ================================================== */

    setSkillLevel(skillId, level) {
        this.skillLevels[skillId] = Math.max(1, Math.min(25, level));
    }

    getSkillLevel(skillId) {
        return this.skillLevels[skillId] || 1;
    }

    /* ==================================================
       TEMPORARY EFFECTS
    ================================================== */

    addTemporaryEffect(effect) {
        /**
         * effect = {
         *   id,
         *   duration,
         *   onApply,
         *   onExpire
         * }
         */
        if (effect.onApply) effect.onApply();
        this.temporaryEffects.push({ ...effect });
    }

    updateTemporaryEffects(deltaTime) {
        this.temporaryEffects = this.temporaryEffects.filter(effect => {
            effect.duration -= deltaTime;

            if (effect.duration <= 0) {
                if (effect.onExpire) effect.onExpire();
                return false;
            }
            return true;
        });
    }

    clearTemporaryEffects() {
        this.temporaryEffects.forEach(effect => {
            if (effect.onExpire) effect.onExpire();
        });
        this.temporaryEffects = [];
    }

    /* ==================================================
       DIFFICULTY & PRESSURE HELPERS
    ================================================== */

    getDifficulty() {
        return this.systems?.difficulty?.getCurrentDifficulty?.();
    }

    getPressureRatio() {
        return this.systems?.pressure?.getPressureRatio?.() ?? 0;
    }

    /* ==================================================
       DEBUG / EDUCATIONAL
    ================================================== */

    getDebugState() {
        return {
            id: this.id,
            gauge: this.currentGauge,
            gaugePenalty: this.gaugePenalty,
            skillLevels: { ...this.skillLevels },
            activeEffects: this.temporaryEffects.length
        };
    }
}
