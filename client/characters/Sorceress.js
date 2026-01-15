import CharacterBase from './CharacterBase.js';
import { ModifierType } from '../systems/ModifierType.js';

export default class Sorceress extends CharacterBase {
    constructor(gameContext, data) {
        super(gameContext, data);
        this.isEscalating = false;
    }

    onRegister(systems) {
        super.onRegister(systems);

        systems.pressure.registerModifier({
            sourceId: `character:${this.id}`,
            type: ModifierType.PRESSURE_GAIN_MULTIPLIER,
            value: this.data.base_stats.pressure_gain_multiplier
        });

        systems.pressure.registerModifier({
            sourceId: `character:${this.id}`,
            type: ModifierType.MISTAKE_PENALTY_MULTIPLIER,
            value: this.data.base_stats.mistake_penalty_multiplier
        });
    }

    onUpdate(deltaTime) {
        super.onUpdate(deltaTime);

        const pressure = this.getPressureRatio();
        const threshold = this.data.pressure_interaction.escalation_threshold;

        if (pressure >= threshold && !this.isEscalating) {
            this.enterEscalation();
        }

        if (pressure < threshold && this.isEscalating) {
            this.exitEscalation();
        }
    }

    enterEscalation() {
        this.isEscalating = true;

        this.systems.baronAI.modifyAggression(
            this.data.pressure_interaction.baron_aggression_modifier
        );
    }

    exitEscalation() {
        this.isEscalating = false;
    }
}
