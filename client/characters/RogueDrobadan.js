import CharacterBase from './CharacterBase.js';
import { ModifierType } from '../systems/ModifierType.js';

export default class RogueDrobadan extends CharacterBase {
    constructor(gameContext, data) {
        super(gameContext, data);
        this.sourceId = `character:${this.id}`;
        this.isTaunting = false;
    }

    onRegister(systems) {
        super.onRegister(systems);

        systems.pressure.registerModifier({
            sourceId: this.sourceId,
            type: ModifierType.PRESSURE_SPIKE_MULTIPLIER,
            value: this.data.base_stats.pressure_spike_multiplier
        });

        systems.baronAI.registerModifier({
            sourceId: this.sourceId,
            type: ModifierType.BARON_AGGRESSION_MULTIPLIER,
            value: 1 + this.data.base_stats.baron_error_chance_bonus
        });
    }

    onUpdate(deltaTime) {
        super.onUpdate(deltaTime);

        const ratio = this.getPressureRatio();
        const threshold = this.data.pressure_interaction.taunt_threshold;

        if (ratio >= threshold && !this.isTaunting) {
            this.isTaunting = true;
            this.systems.baronAI.forceOverreaction(
                this.data.pressure_interaction.baron_overreaction_bonus
            );
        }

        if (ratio < threshold && this.isTaunting) {
            this.isTaunting = false;
            this.systems.baronAI.clearForcedOverreaction(this.sourceId);
        }
    }
}
