// client/pets/PetBase.js

import { ModifierType } from '../systems/ModifierType.js';

/**
 * PetBase
 * ----------------------------------------------------
 * Abstract base class for all pets.
 *
 * Canon rules:
 * - Exactly ONE pet is active per run
 * - Pet and Character act in parallel
 * - Pet NEVER knows about Character
 * - Pet acts autonomously (AI-driven)
 * - All effects go through systems via modifiers
 */

export default class PetBase {
    constructor(gameContext, data) {
        if (new.target === PetBase) {
            throw new Error('PetBase is abstract and cannot be instantiated directly.');
        }

        this.game = gameContext;
        this.data = data;

        /* ==============================
           Identity
        ============================== */

        this.id = data.id;
        this.name = data.name;

        this.sourceId = `pet:${this.id}`;

        /* ==============================
           Core Attributes (Scaling)
        ============================== */

        this.attributes = {
            STR: data.attributes?.STR ?? 1,
            INT: data.attributes?.INT ?? 1,
            DEF: data.attributes?.DEF ?? 1,
            SPD: data.attributes?.SPD ?? 1
        };

        /* ==============================
           Cooldowns
        ============================== */

        this.cooldowns = {};
        this.initCooldowns();

        /* ==============================
           System References
        ============================== */

        this.systems = {};
    }

    /* ==================================================
       REGISTRATION & LIFECYCLE
    ================================================== */

    /**
     * Called once when pet is activated
     */
    onRegister(systems) {
        this.systems = systems;
    }

    /**
     * Called every tick/frame
     */
    onUpdate(deltaTime) {
        this.updateCooldowns(deltaTime);
        this.evaluate(deltaTime);
    }

    /**
     * Core AI decision loop
     * Must be implemented by subclasses
     */
    evaluate(deltaTime) {
        // abstract
    }

    /* ==================================================
       COOLDOWN MANAGEMENT
    ================================================== */

    initCooldowns() {
        if (!this.data.skills) return;

        this.data.skills.forEach(skill => {
            this.cooldowns[skill.id] = 0;
        });
    }

    updateCooldowns(deltaTime) {
        Object.keys(this.cooldowns).forEach(id => {
            if (this.cooldowns[id] > 0) {
                this.cooldowns[id] = Math.max(
                    0,
                    this.cooldowns[id] - deltaTime * this.getCooldownSpeed()
                );
            }
        });
    }

    canUseSkill(skillId) {
        return this.cooldowns[skillId] === 0;
    }

    startCooldown(skillId, baseCooldown) {
        this.cooldowns[skillId] = baseCooldown;
    }

    getCooldownSpeed() {
        // SPD reduces cooldowns
        return 1 + (this.attributes.SPD - 1) * 0.15;
    }

    /* ==================================================
       MODIFIER HELPERS (STRICT CONTRACT)
    ================================================== */

    registerModifier(type, value, options = {}) {
        const modifier = {
            sourceId: this.sourceId,
            type,
            value,
            ...options
        };

        this.systems?.pressure?.registerModifier?.(modifier);
        this.systems?.gravity?.registerModifier?.(modifier);
        this.systems?.lockDelay?.registerModifier?.(modifier);
        this.systems?.baronAI?.registerModifier?.(modifier);
    }

    removeModifiersByType(type) {
        this.systems?.pressure?.removeModifier?.(this.sourceId, type);
        this.systems?.gravity?.removeModifier?.(this.sourceId, type);
        this.systems?.lockDelay?.removeModifier?.(this.sourceId, type);
        this.systems?.baronAI?.removeModifier?.(this.sourceId, type);
    }

    clearAllModifiers() {
        this.systems?.pressure?.removeAllFromSource?.(this.sourceId);
        this.systems?.gravity?.removeAllFromSource?.(this.sourceId);
        this.systems?.lockDelay?.removeAllFromSource?.(this.sourceId);
        this.systems?.baronAI?.removeAllFromSource?.(this.sourceId);
    }

    /* ==================================================
       PERCEPTION HELPERS (READ-ONLY)
    ================================================== */

    getPressureRatio() {
        return this.systems?.pressure?.getPressureRatio?.() ?? 0;
    }

    getDifficulty() {
        return this.systems?.difficulty?.getCurrentDifficulty?.();
    }

    isBaronAggressive() {
        return this.systems?.baronAI?.isAggressive?.() ?? false;
    }

    /* ==================================================
       DEBUG / EDUCATIONAL
    ================================================== */

    getDebugState() {
        return {
            id: this.id,
            cooldowns: { ...this.cooldowns },
            attributes: { ...this.attributes }
        };
    }
}
