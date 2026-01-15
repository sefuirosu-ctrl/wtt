import { SkillEffectType } from '../../systems/SkillEffectType.js';

/**
 * Cleric — sustain & stability archetype
 * Focus: survival, pressure mitigation, recovery from near-failure states
 *
 * Canon path:
 * client/characters/skills/ClericSkills.js
 */
export const ClericSkills = {

    skill_1: {
        id: 'divine_shield',
        name: 'Divine Shield',
        cooldown: 6,
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
                value: 8
            }
        ]
    },

    skill_2: {
        id: 'purification',
        name: 'Purification',
        cooldown: 10,
        effects: [
            {
                type: SkillEffectType.CLEAR_PRESSURE_SPIKES
            },
            {
                type: SkillEffectType.REMOVE_NEGATIVE_BOARD_STATES
            }
        ]
    },

    skill_3: {
        id: 'sanctuary',
        name: 'Sanctuary',
        cooldown: 14,
        effects: [
            {
                type: SkillEffectType.FREEZE_PRESSURE_GAIN,
                duration: {
                    base: 2,
                    per_level: 1
                }
            },
            {
                type: SkillEffectType.REDUCE_BARON_AGGRESSION,
                value: {
                    base: 0.15,
                    per_level: 0.05
                },
                duration: 3
            }
        ]
    },

    ultimate: {
        id: 'divine_intervention',
        name: 'Divine Intervention',
        cooldown: 30,
        effects: [
            {
                type: SkillEffectType.PREVENT_GAME_OVER
            },
            {
                type: SkillEffectType.MASSIVE_PRESSURE_RESET
            },
            {
                type: SkillEffectType.STABILIZE_BOARD_STATE
            }
        ]
    }
};
