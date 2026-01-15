// client/systems/SkillEffectType.js

/**
 * SkillEffectType
 * ----------------------------------------------------
 * Canonical enumeration of ALL possible skill effects
 * used by characters and pets.
 *
 * Rules:
 * - No string literals outside this enum
 * - New effects MUST be added here first
 * - Used by Skills, AI analysis, UI, and Debug tools
 */

export const SkillEffectType = Object.freeze({

    /* ===== PRESSURE ===== */
    PRESSURE_REDUCTION: 'pressure_reduction',
    PRESSURE_INCREASE: 'pressure_increase',
    PRESSURE_SPIKE_SUPPRESSION: 'pressure_spike_suppression',

    /* ===== MISTAKES ===== */
    MISTAKE_PENALTY_REDUCTION: 'mistake_penalty_reduction',
    MISTAKE_SEVERITY_REDUCTION: 'mistake_severity_reduction',

    /* ===== BOARD / PIECES ===== */
    NEAR_LINE_COMPLETION: 'near_line_completion',
    TARGETED_DESTRUCTION: 'targeted_destruction',
    RANDOM_DESTRUCTION: 'random_destruction',
    MASSIVE_DESTRUCTION: 'massive_destruction',
    CRITICAL_ZONE_CLEANUP: 'critical_zone_cleanup',
    FIELD_STABILIZATION: 'field_stabilization',

    /* ===== GRAVITY / TIMING ===== */
    FREEZE_GRAVITY: 'freeze_gravity',
    GLOBAL_GRAVITY_SLOW: 'global_gravity_slow',
    GRAVITY_OVERDRIVE: 'gravity_overdrive',
    LOCK_DELAY_BOOST: 'lock_delay_boost',

    /* ===== COMBOS / SCORE ===== */
    COMBO_AMPLIFICATION: 'combo_amplification',

    /* ===== BARON / AI ===== */
    INCREASE_BARON_ERROR: 'increase_baron_error',
    CANCEL_BARON_ACTION: 'cancel_baron_action',
    FORCE_BARON_MISPLAY: 'force_baron_misplay',
    DESYNC_BARON_TIMING: 'desync_baron_timing',
    CHAIN_BARON_ERRORS: 'chain_baron_errors',
    STEAL_NEGATIVE_EFFECT: 'steal_negative_effect',
    CONVERT_NEGATIVES_TO_BENEFITS: 'convert_negatives_to_benefits',

    /* ===== PIECE MANIPULATION ===== */
    ALTER_NEXT_PIECE: 'alter_next_piece',

    /* ===== GAME FLOW (SPECIAL) ===== */
    PREVENT_GAME_OVER: 'prevent_game_over'
});
