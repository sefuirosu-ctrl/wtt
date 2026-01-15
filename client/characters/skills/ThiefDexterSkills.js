import { SkillEffectType } from '../../systems/SkillEffectType.js';

/**
 * Thief (Dexter) — trickster & disruption archetype
 * Focus: provoking the Baron, manipulating pressure, forcing mistakes
 *
 * Canon path:
 * client/characters/skills/ThiefDexterSkills.js
 */
export const ThiefDexterSkills = {

    skill_1: {
        id: 'mocking_step',
        name: 'Mocking Step',
        cooldown: 6,
        effects: [
            {
                type: SkillEffectType.INCREASE_BARON_ERROR,
                value: {
                    base: 0.15,
                    per_level: 0.05
                }
            },
            {
                type: SkillEffectType.PRESSURE_REDUCTION,
                value: 5
            }
        ]
    },

    skill_2: {
        id: 'dirty_trick',
        name: 'Dirty Trick',
        cooldown: 10,
        effects: [
            {
                type: SkillEffectType.DESYNC_BARON_TIMING,
                duration: {
                    base: 1,
                    per_level: 1
                }
            },
            {
                type: SkillEffectType.TARGETED_DESTRUCTION,
                blocks: {
                    base: 1,
                    per_level: 1
                }
            }
        ]
    },

    skill_3: {
        id: 'smoke_and_mirrors',
        name: 'Smoke and Mirrors',
        cooldown: 14,
        effects: [
            {
                type: SkillEffectType.REDUCE_PRESSURE_GAIN,
                value: {
                    base: 0.2,
                    per_level: 0.05
                },
                duration: 3
            },
            {
                type: SkillEffectType.INCREASE_BARON_ERROR,
                value: {
                    base: 0.1,
                    per_level: 0.05
                },
                duration: 3
            }
        ]
    },

    ultimate: {
        id: 'perfect_heist',
        name: 'Perfect Heist',
        cooldown: 30,
        effects: [
            {
                type: SkillEffectType.FORCE_BARON_MISPLAY,
                duration: {
                    base: 2,
                    per_level: 1
                }
            },
            {
                type: SkillEffectType.MASSIVE_PRESSURE_REDUCTION
            },
            {
                type: SkillEffectType.PREVENT_GAME_OVER
            }
        ]
    }
};
