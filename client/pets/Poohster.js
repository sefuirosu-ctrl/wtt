// client/pets/Poohster.js

import PetBase from './PetBase.js';
import { SkillEffectType } from '../systems/SkillEffectType.js';
import SkillEffectRouter from '../systems/SkillEffectRouter.js';

/**
 * Poohster the Bear
 * Board stabilization & pressure smoothing pet.
 */
export default class Poohster extends PetBase {
    constructor(gameContext, data) {
        super(gameContext, data);

        this.lastEvaluation = 0;
        this.effectRouter = new SkillEffectRouter(gameContext.systems);
    }

    /**
     * Core AI loop
     * Poohster reacts to unstable board states and pressure spikes
     */
    evaluate(deltaTime) {
        this.lastEvaluation += deltaTime;

        const interval = this.data.ai_profile.evaluation_interval;
        if (this.lastEvaluation < interval) return;

        this.lastEvaluation = 0;

        const pressure = this.getPressureRatio();
        const boardIsCritical = this.systems.board.isCritical();

        // Skill 1: Heavy Slam — stabilize the field
        if (boardIsCritical && this.canUseSkill('heavy_slam')) {
            this.useHeavySlam();
            return;
        }

        // Skill 2: Unshakeable — suppress pressure spikes
        if (pressure >= 0.55 && this.canUseSkill('unshakeable')) {
            this.useUnshakeable();
        }
    }

    useHeavySlam() {
        const skill = this.data.skills.find(s => s.id === 'heavy_slam');

        this.effectRouter.applyEffect({
            sourceId: this.sourceId,
            effect: {
                type: SkillEffectType.FIELD_STABILIZATION
            }
        });

        this.startCooldown(skill.id, skill.cooldown);
    }

    useUnshakeable() {
        const skill = this.data.skills.find(s => s.id === 'unshakeable');

        this.effectRouter.applyEffect({
            sourceId: this.sourceId,
            effect: {
                type: SkillEffectType.PRESSURE_SPIKE_SUPPRESSION,
                value: skill.effect.multiplier,
                duration: skill.effect.duration
            }
        });

        this.startCooldown(skill.id, skill.cooldown);
    }
}
