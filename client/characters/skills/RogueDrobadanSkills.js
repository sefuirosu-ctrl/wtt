import { SkillEffectType } from '../../systems/SkillEffectType.js';

/**
 * Rogue (Drobadan) — chaos & brute disruption archetype
 * Focus: aggressive board disruption, high-risk pressure spikes, forcing instability
 *
 * Canon path:
 * client/characters/skills/RogueDrobadanSkills.js
 */
export const RogueDrobadanSkills = {

    skill_1: {
        id: 'reckless_strike',
        name: 'Reckless Strike',
        cooldown: 6,
        effects: [
            {
                type: SkillEffectType.TARGETED_DESTRUCTION,
                blocks: {
                    base: 2,
                    per_level: 1
                }
            },
            {
                type: SkillEffectType.INCREASE_PRESSURE_GAIN,
                value: {
                    base: 0.1,
                    per_level: 0.05
                },
                duration: 2
            }
        ]
    },

    skill_2: {
        id: 'chaos_step',
        name: 'Chaos Step',
        cooldown: 10,
        effects: [
            {
                type: SkillEffectType.RANDOMIZE_BOARD_STATE
            },
            {
                type: SkillEffectType.DESYNC_BARON_TIMING,
                duration: {
                    base: 1,
                    per_level: 1
                }
            }
        ]
    },

    skill_3: {
        id: 'blood_rush',
        name: 'Blood Rush',
        cooldown: 14,
        effects: [
            {
                type: SkillEffectType.INCREASE_PRESSURE_GAIN,
                value: {
                    base: 0.2,
                    per_level: 0.05
                },
                duration: 3
            },
            {
                type: SkillEffectType.MASSIVE_DESTRUCTION,
                blocks: {
                    base: 3,
                    per_level: 1
                }
            }
        ]
    },

    ultimate: {
        id: 'total_anarchy',
        name: 'Total Anarchy',
        cooldown: 30,
        effects: [
            {
                type: SkillEffectType.MASSIVE_DESTRUCTION
            },
            {
                type: SkillEffectType.FORCE_BARON_MISPLAY,
                duration: {
                    base: 2,
                    per_level: 1
                }
            },
            {
                type: SkillEffectType.MASSIVE_PRESSURE_SPIKE
            }
        ]
    }
};
