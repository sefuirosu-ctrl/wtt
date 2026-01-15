import CharacterBase from './CharacterBase.js';
import { ModifierType } from '../systems/ModifierType.js';

export default class DragonEdea extends CharacterBase {
    constructor(gameContext, data) {
        super(gameContext, data);
        this.sourceId = `character:${this.id}`;
        this.inOverdrive = false;
    }

    onRegister(systems) {
        super.onRegister(systems);

        systems.pressure.registerModifier({
            sourceId: this.sourceId,
            type: ModifierType.PRESSURE_GAIN_MULTIPLIER,
            value: this.data.base_stats.pressure_gain_multiplier
        });

        systems.pressure.registerModifier({
            sourceId: this.sourceId,
            type: ModifierType.MISTAKE_SEVERITY_MULTIPLIER,
            value: this.data.base_stats.mistake_severity_multiplier
        });
    }

    onUpdate(deltaTime) {
        super.onUpdate(deltaTime);

        const ratio = this.getPressureRatio();
        const threshold = this.data.pressure_interaction.overdrive_threshold;

        if (ratio >= threshold && !this.inOverdrive) {
            this.enterOverdrive();
        }

        if (ratio < threshold && this.inOverdrive) {
            this.exitOverdrive();
        }
    }

    enterOverdrive() {
        this.inOverdrive = true;

        this.systems.baronAI.modifyAggression(
            this.data.pressure_interaction.baron_aggression_modifier
        );
    }

    exitOverdrive() {
        this.inOverdrive = false;
    }
}
