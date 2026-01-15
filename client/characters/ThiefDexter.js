import CharacterBase from './CharacterBase.js';
import { ModifierType } from '../systems/ModifierType.js';

export default class ThiefDexter extends CharacterBase {
    constructor(gameContext, data) {
        super(gameContext, data);
        this.sourceId = `character:${this.id}`;
        this.isOpportunistic = false;
    }

    onRegister(systems) {
        super.onRegister(systems);

        systems.lockDelay.registerModifier({
            sourceId: this.sourceId,
            type: ModifierType.LOCK_DELAY_MULTIPLIER,
            value: this.data.base_stats.lock_delay_bonus
        });

        systems.pressure.registerModifier({
            sourceId: this.sourceId,
            type: ModifierType.MISTAKE_PENALTY_MULTIPLIER,
            value: this.data.base_stats.mistake_penalty_multiplier
        });
    }

    onUpdate(deltaTime) {
        super.onUpdate(deltaTime);

        const ratio = this.getPressureRatio();
        const threshold = this.data.pressure_interaction.provocation_threshold;

        if (ratio >= threshold && !this.isOpportunistic) {
            this.isOpportunistic = true;

            this.systems.baronAI.registerModifier({
                sourceId: this.sourceId,
                type: ModifierType.BARON_AGGRESSION_MULTIPLIER,
                value: 1 + this.data.pressure_interaction.baron_error_chance_bonus
            });
        }

        if (ratio < threshold && this.isOpportunistic) {
            this.isOpportunistic = false;

            this.systems.baronAI.removeModifier(
                this.sourceId,
                ModifierType.BARON_AGGRESSION_MULTIPLIER
            );
        }
    }
}
