import { SkillEffectType } from '../../systems/SkillEffectType.js';

/**
 * Warrior — endurance & frontline archetype
 * Focus: absorbing pressure, direct confrontation, survival under sustained aggression
 *
 * Canon path:
 * client/characters/skills/WarriorSkills.js
 */
export const WarriorSkills = {

    skill_1: {
        id: 'iron_stance',
        name: 'Iron Stance',
        cooldown: 6,
        effects: [
            {
                type: SkillEffectType.REDUCE_PRESSURE_GAIN,
                value: {
                    base: 0.15,
                    per_level: 0.05
                },
                duration: 3
            },
            {
                type: SkillEffectType.REDUCE_BARON_AGGRESSION,
                value: {
                    base: 0.1,
                    per_level: 0.05
                },
                duration: 3
            }
        ]
    },

    skill_2: {
        id: 'shield_breaker',
        name: 'Shield Breaker',
        cooldown: 10,
        effects: [
            {
                type: SkillEffectType.TARGETED_DESTRUCTION,
                blocks: {
                    base: 1,
                    per_level: 1
                }
            },
            {
                type: SkillEffectType.INCREASE_BARON_ERROR
            }
        ]
    },

    skill_3: {
        id: 'unyielding_will',
        name: 'Unyielding Will',
        cooldown: 14,
        effects: [
            {
                type: SkillEffectType.PREVENT_GAME_OVER,
                duration: {
                    base: 1,
                    per_level: 1
                }
            },
            {
                type: SkillEffectType.PRESSURE_REDUCTION,
                value: 6
            }
        ]
    },

    ultimate: {
        id: 'last_stand',
        name: 'Last Stand',
        cooldown: 30,
        effects: [
            {
                type: SkillEffectType.PREVENT_GAME_OVER
            },
            {
                type: SkillEffectType.MASSIVE_PRESSURE_REDUCTION
            },
            {
                type: SkillEffectType.STABILIZE_BOARD_STATE
            }
        ]
    }
};
