// client/systems/SkillEffectRouter.js

import { SkillEffectType } from './SkillEffectType.js';
import { ModifierType } from './ModifierType.js';

export default class SkillEffectRouter {
    constructor(systems) {
        this.systems = systems;
    }

    /**
     * Apply a skill effect in a canonical way
     */
    applyEffect({ sourceId, effect, level = 1 }) {
        const { type } = effect;

        switch (type) {

            /* ===== PRESSURE ===== */
            case SkillEffectType.PRESSURE_REDUCTION:
                this.systems.pressure.reducePressure(effect.value);
                break;

            case SkillEffectType.PRESSURE_INCREASE:
                this.systems.pressure.addPressure(effect.value);
                break;

            case SkillEffectType.PRESSURE_SPIKE_SUPPRESSION:
                this.systems.pressure.registerModifier({
                    sourceId,
                    type: ModifierType.PRESSURE_SPIKE_MULTIPLIER,
                    value: effect.value,
                    temporary: true,
                    duration: effect.duration
                });
                break;

            /* ===== BOARD ===== */
            case SkillEffectType.NEAR_LINE_COMPLETION:
                this.systems.board.attemptNearLineCompletion(effect.chance);
                break;

            case SkillEffectType.TARGETED_DESTRUCTION:
                this.systems.board.destroyTargetedBlocks(
                    effect.blocks.base + effect.blocks.per_level * level
                );
                break;

            case SkillEffectType.RANDOM_DESTRUCTION:
                this.systems.board.destroyRandomBlocks(
                    effect.blocks.base + effect.blocks.per_level * level
                );
                break;

            case SkillEffectType.MASSIVE_DESTRUCTION:
                this.systems.board.triggerMassiveDestruction();
                break;

            case SkillEffectType.CRITICAL_ZONE_CLEANUP:
                this.systems.board.stabilizeCriticalZones();
                break;

            case SkillEffectType.FIELD_STABILIZATION:
                this.systems.board.stabilizeField();
                break;

            /* ===== GRAVITY ===== */
            case SkillEffectType.FREEZE_GRAVITY:
                this.systems.gravity.registerModifier({
                    sourceId,
                    type: ModifierType.GRAVITY_MULTIPLIER,
                    value: 0,
                    temporary: true,
                    duration:
                        effect.duration.base +
                        effect.duration.per_level * level
                });
                break;

            case SkillEffectType.GLOBAL_GRAVITY_SLOW:
                this.systems.gravity.registerModifier({
                    sourceId,
                    type: ModifierType.GRAVITY_MULTIPLIER,
                    value: effect.multiplier,
                    temporary: true,
                    duration:
                        effect.duration.base +
                        effect.duration.per_level * level
                });
                break;

            case SkillEffectType.GRAVITY_OVERDRIVE:
                this.systems.gravity.registerModifier({
                    sourceId,
                    type: ModifierType.GRAVITY_MULTIPLIER,
                    value: effect.multiplier,
                    temporary: true,
                    duration:
                        effect.duration.base +
                        effect.duration.per_level * level
                });
                break;

            /* ===== COMBO ===== */
            case SkillEffectType.COMBO_AMPLIFICATION:
                this.systems.combo.registerModifier({
                    sourceId,
                    multiplier: effect.multiplier,
                    temporary: true,
                    duration:
                        effect.duration.base +
                        effect.duration.per_level * level
                });
                break;

            /* ===== BARON / AI ===== */
            case SkillEffectType.INCREASE_BARON_ERROR:
                this.systems.baronAI.increaseErrorChance(sourceId);
                break;

            case SkillEffectType.CANCEL_BARON_ACTION:
                this.systems.baronAI.cancelPendingAction(sourceId);
                break;

            case SkillEffectType.FORCE_BARON_MISPLAY:
                this.systems.baronAI.forceMisplay(
                    effect.duration.base +
                    effect.duration.per_level * level
                );
                break;

            case SkillEffectType.DESYNC_BARON_TIMING:
                this.systems.baronAI.desyncTiming(
                    effect.duration.base +
                    effect.duration.per_level * level
                );
                break;

            case SkillEffectType.CHAIN_BARON_ERRORS:
                this.systems.baronAI.triggerErrorChain(sourceId);
                break;

            case SkillEffectType.STEAL_NEGATIVE_EFFECT:
                this.systems.baronAI.stealNextInterference(sourceId);
                break;

            case SkillEffectType.CONVERT_NEGATIVES_TO_BENEFITS:
                this.systems.baronAI.convertNegativesToBenefits(sourceId);
                break;

            /* ===== PIECES ===== */
            case SkillEffectType.ALTER_NEXT_PIECE:
                this.systems.piece.alterNextPiece(sourceId);
                break;

            /* ===== GAME FLOW ===== */
            case SkillEffectType.PREVENT_GAME_OVER:
                this.systems.game.preventGameOver(sourceId);
                break;

            default:
                console.warn('Unknown SkillEffectType:', type);
        }
    }
}
