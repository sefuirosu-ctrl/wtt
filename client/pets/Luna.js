import { PetBase } from './PetBase.js';
import { SkillEffectType } from '../systems/SkillEffectType.js';

/**
 * Luna — Cat Pet
 * Archetype: emotional stabilizer & soft support
 *
 * Canon rules:
 * - Pet has NO external skills file
 * - Pet skills are reactive and AI-driven
 * - Max 2 skills
 * - Effects are applied via SkillEffectRouter
 */
export class Luna extends PetBase {

    constructor(context) {
        super({
            id: 'luna',
            name: 'Luna',
            context
        });

        /**
         * Skill 1: Soothing Presence
         * Trigger: medium pressure
         * Role: reduce pressure gain and calm spikes
         */
        this.registerSkill({
            id: 'soothing_presence',
            cooldown: 8,
            condition: () => this.context.pressure.getValue() >= 0.3,
            execute: () => {
                this.applyEffects([
                    {
                        type: SkillEffectType.PRESSURE_REDUCTION,
                        value: 4
                    },
                    {
                        type: SkillEffectType.REDUCE_PRESSURE_GAIN,
                        value: 0.1,
                        duration: 2
                    }
                ]);
            }
        });

        /**
         * Skill 2: Lucky Reflex
         * Trigger: high pressure / near failure
         * Role: emergency cushion against mistakes
         */
        this.registerSkill({
            id: 'lucky_reflex',
            cooldown: 14,
            condition: () => this.context.pressure.getValue() >= 0.6,
            execute: () => {
                this.applyEffects([
                    {
                        type: SkillEffectType.INCREASE_BARON_ERROR,
                        value: 0.1,
                        duration: 2
                    },
                    {
                        type: SkillEffectType.PREVENT_GAME_OVER,
                        duration: 1
                    }
                ]);
            }
        });
    }
}
