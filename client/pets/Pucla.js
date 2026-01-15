// client/pets/Pucla.js

import PetBase from './PetBase.js';
import { SkillEffectType } from '../systems/SkillEffectType.js';
import SkillEffectRouter from '../systems/SkillEffectRouter.js';

/**
 * Pucla the Dog
 * Defensive support pet focused on mistake mitigation.
 */
export default class Pucla extends PetBase {
    constructor(gameContext, data) {
        super(gameContext, data);

        this.lastEvaluation = 0;
        this.effectRouter = new SkillEffectRouter(gameContext.systems);
    }

    /**
     * Core AI loop
     * Pucla reacts to rising pressure and recent mistakes
     */
    evaluate(deltaTime) {
        this.lastEvaluation += deltaTime;

        const interval = this.data.ai_profile.evaluation_interval;
        if (this.lastEvaluation < interval) return;

        this.lastEvaluation = 0;

        const pressure = this.getPressureRatio();

        // Skill 1: Guardian Bark — reduce mistake penalties
        if (pressure >= 0.3 && this.canUseSkill('guardian_bark')) {
            this.useGuardianBark();
            return;
        }

        // Skill 2: Loyal Guard — suppress pressure spikes at high tension
        if (pressure >= 0.5 && this.canUseSkill('loyal_guard')) {
            this.useLoyalGuard();
        }
    }

    useGuardianBark() {
        const skill = this.data.skills.find(s => s.id === 'guardian_bark');

        this.effectRouter.applyEffect({
            sourceId: this.sourceId,
            effect: {
                type: SkillEffectType.MISTAKE_PENALTY_REDUCTION,
                multiplier: skill.effect.multiplier,
                duration: skill.effect.duration
            }
        });

        this.startCooldown(skill.id, skill.cooldown);
    }

    useLoyalGuard() {
        const skill = this.data.skills.find(s => s.id === 'loyal_guard');

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
