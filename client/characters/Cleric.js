// client/characters/Cleric.js

import CharacterBase from './CharacterBase.js';

/**
 * Cleric — Lucia Alexandria
 * Support / Recovery archetype
 *
 * Design intent:
 * - Passive pressure decay
 * - Mistake mitigation
 * - Emotional stability under stress
 * - No direct board manipulation
 */
export default class Cleric extends CharacterBase {
    constructor(gameContext, data) {
        super(gameContext, data);

        this.id = data.id;
        this.name = data.name;
        this.archetype = data.archetype;
        this.role = data.role;

        // Cached references (resolved later by engine)
        this.pressureSystem = null;
        this.difficultySystem = null;
        this.baronAI = null;

        // Internal state
        this.isHighPressure = false;
    }

    /**
     * Called once when character is registered in the game
     * (hooked later by CharacterManager)
     */
    onRegister(systems) {
        this.pressureSystem = systems.pressure;
        this.difficultySystem = systems.difficulty;
        this.baronAI = systems.baronAI;

        this.applyPassiveModifiers();
    }

    /**
     * Apply Lucia's passive effects
     * No direct mutation of core logic — only modifiers
     */
    applyPassiveModifiers() {
        if (!this.pressureSystem) return;

        const stats = this.data.base_stats;

        // Passive pressure decay bonus
        this.pressureSystem.registerModifier({
            source: this.id,
            type: 'pressure_decay',
            multiplier: stats.pressure_decay_bonus
        });

        // Mistake penalty reduction
        this.pressureSystem.registerModifier({
            source: this.id,
            type: 'mistake_penalty',
            multiplier: stats.mistake_penalty_reduction
        });
    }

    /**
     * Called every frame or tick by the engine
     * Lucia reacts only to pressure state
     */
    onUpdate(deltaTime) {
        if (!this.pressureSystem) return;

        const pressureRatio = this.pressureSystem.getPressureRatio();
        const threshold = this.data.pressure_interaction.panic_mitigation_threshold;

        // Enter high-pressure support mode
        if (pressureRatio >= threshold && !this.isHighPressure) {
            this.enterHighPressureState();
        }

        // Exit high-pressure state
        if (pressureRatio < threshold && this.isHighPressure) {
            this.exitHighPressureState();
        }
    }

    /**
     * Lucia's safety net at high pressure
     */
    enterHighPressureState() {
        this.isHighPressure = true;

        // Temporary softening of pressure spikes
        this.pressureSystem.registerModifier({
            source: this.id,
            type: 'pressure_spike',
            multiplier: 0.85,
            temporary: true
        });
    }

    /**
     * Cleanup when pressure drops
     */
    exitHighPressureState() {
        this.isHighPressure = false;

        this.pressureSystem.removeTemporaryModifiers(this.id);
    }

    /**
     * Hook called when player makes a mistake
     * Lucia reduces emotional punishment, not consequences
     */
    onPlayerMistake(context) {
        if (!this.pressureSystem) return;

        // Only intervene on non-fatal mistakes
        if (context.severity === 'minor') {
            this.pressureSystem.reducePressure(0.02);
        }
    }

    /**
     * Hook called when Baron escalates aggression
     */
    onBaronEscalation() {
        if (!this.baronAI) return;

        const modifier = this.data.pressure_interaction.baron_aggression_modifier;

        this.baronAI.modifyAggression(modifier);
    }
}
