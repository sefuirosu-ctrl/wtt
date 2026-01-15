import { SkillEffectType } from '../../systems/SkillEffectType.js';

/**
 * Dragon (Edea Flamberge) — overwhelming power & pressure escalation archetype
 * Focus: massive board impact, pressure domination, high-risk high-reward play
 *
 * Canon path:
 * client/characters/skills/DragonEdeaSkills.js
 *
 * IMPORTANT:
 * Edea is a stress-test character. Her skills deliberately push the limits
 * of pressure, board stability, and Baron AI reactions.
 */
export const DragonEdeaSkills = {

    skill_1: {
        id: 'draconic_presence',
        name: 'Draconic Presence',
        cooldown: 6,
        effects: [
            {
                type: SkillEffectType.INCREASE_PRESSURE_GAIN,
                value: {
                    base: 0.15,
                    per_level: 0.05
                },
                duration: 3
            },
            {
                type: SkillEffectType.INCREASE_BARON_ERROR,
                value: {
                    base: 0.2,
                    per_level: 0.05
                },
                duration: 3
            }
        ]
    },

    skill_2: {
        id: 'flame_breath',
        name: 'Flame Breath',
        cooldown: 10,
        effects: [
            {
                type: SkillEffectType.MASSIVE_DESTRUCTION,
                blocks: {
                    base: 3,
                    per_level: 1
                }
            },
            {
                type: SkillEffectType.FORCE_BARON_MISPLAY,
                duration: {
                    base: 1,
                    per_level: 1
                }
            }
        ]
    },

    skill_3: {
        id: 'scorched_earth',
        name: 'Scorched Earth',
        cooldown: 14,
        effects: [
            {
                type: SkillEffectType.MASSIVE_PRESSURE_SPIKE
            },
            {
                type: SkillEffectType.RANDOMIZE_BOARD_STATE
            }
        ]
    },

    ultimate: {
        id: 'apocalypse_flame',
        name: 'Apocalypse Flame',
        cooldown: 30,
        effects: [
            {
                type: SkillEffectType.MASSIVE_DESTRUCTION
            },
            {
                type: SkillEffectType.MASSIVE_PRESSURE_SPIKE
            },
            {
                type: SkillEffectType.FORCE_BARON_MISPLAY,
                duration: {
                    base: 2,
                    per_level: 1
                }
            },
            {
                type: SkillEffectType.PREVENT_GAME_OVER
            }
        ]
    }
};
