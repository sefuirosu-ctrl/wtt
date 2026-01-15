import CharacterBase from './CharacterBase.js';

export default class Warrior extends CharacterBase {
    constructor(gameContext, data) {
        super(gameContext, data);

        this.isStabilizing = false;
    }

    onRegister(systems) {
        super.onRegister(systems);

        const pressure = systems.pressure;

        pressure.registerModifier({
            source: this.id,
            type: 'pressure_gain',
            multiplier: this.data.base_stats.pressure_gain_reduction
        });

        pressure.registerModifier({
            source: this.id,
            type: 'mistake_severity',
            multiplier: this.data.base_stats.mistake_severity_reduction
        });
    }

    onUpdate(deltaTime) {
        super.onUpdate(deltaTime);

        const ratio = this.getPressureRatio();
        const threshold = this.data.pressure_interaction.stability_threshold;

        if (ratio >= threshold && !this.isStabilizing) {
            this.enterStabilityMode();
        }

        if (ratio < threshold && this.isStabilizing) {
            this.exitStabilityMode();
        }
    }

    enterStabilityMode() {
        this.isStabilizing = true;

        this.systems.gravity.registerModifier({
            source: this.id,
            type: 'gravity',
            multiplier: this.data.base_stats.gravity_resistance,
            temporary: true
        });
    }

    exitStabilityMode() {
        this.isStabilizing = false;
        this.systems.gravity.removeTemporaryModifiers(this.id);
    }

    onBaronEscalation() {
        this.systems.baronAI.modifyAggression(
            this.data.pressure_interaction.baron_aggression_modifier
        );
    }
}
