import { SkillEffectType } from '../../systems/SkillEffectType.js';

/**
 * Sorceress — control & manipulation archetype
 * Focus: pressure control, board manipulation, baron disruption
 *
 * Canon path:
 * client/characters/skills/SorceressSkills.js
 */
export const SorceressSkills = {

    skill_1: {
        id: 'arcane_focus',
        name: 'Arcane Focus',
        cooldown: 6,
        effects: [
            {
                type: SkillEffectType.PRESSURE_REDUCTION,
                value: 10
            },
            {
                type: SkillEffectType.INCREASE_BARON_ERROR
            }
        ]
    },

    skill_2: {
        id: 'reality_warp',
        name: 'Reality Warp',
        cooldown: 10,
        effects: [
            {
                type: SkillEffectType.TARGETED_DESTRUCTION,
                blocks: {
                    base: 2,
                    per_level: 1
                }
            },
            {
                type: SkillEffectType.DESYNC_BARON_TIMING,
                duration: {
                    base: 2,
                    per_level: 1
                }
            }
        ]
    },

    skill_3: {
        id: 'temporal_lock',
        name: 'Temporal Lock',
        cooldown: 14,
        effects: [
            {
                type: SkillEffectType.FREEZE_GRAVITY,
                duration: {
                    base: 2,
                    per_level: 1
                }
            },
            {
                type: SkillEffectType.PRESSURE_SPIKE_SUPPRESSION,
                value: 0.5,
                duration: 3
            }
        ]
    },

    ultimate: {
        id: 'collapse_of_order',
        name: 'Collapse of Order',
        cooldown: 30,
        effects: [
            {
                type: SkillEffectType.MASSIVE_DESTRUCTION
            },
            {
                type: SkillEffectType.FORCE_BARON_MISPLAY,
                duration: {
                    base: 3,
                    per_level: 1
                }
            },
            {
                type: SkillEffectType.PREVENT_GAME_OVER
            }
        ]
    }
};
