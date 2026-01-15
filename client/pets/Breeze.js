// client/pets/Breeze.js

import PetBase from './PetBase.js';
import { SkillEffectType } from '../systems/SkillEffectType.js';
import SkillEffectRouter from '../systems/SkillEffectRouter.js';

/**
 * Breeze the Dodo
 * Reactive gravity recovery pet.
 *
 * HARD GUARANTEES:
 * - No pressure modification
 * - No board stabilization
 * - No Baron interaction
 * - No permanent slow-motion
 * - Rare, reactive activation only
 */
export default class Breeze extends PetBase {
    constructor(gameContext, data) {
        super(gameContext, data);

        this.effectRouter = new SkillEffectRouter(gameContext.systems);

        this.lastEvaluation = 0;
        this.lastActivationAt = -Infinity;
    }

    /**
     * Reactive AI loop — NOT periodic support
     */
    evaluate(deltaTime) {
        this.lastEvaluation += deltaTime;
        if (this.lastEvaluation < this.data.ai_profile.evaluation_interval) return;
        this.lastEvaluation = 0;

        // --- Anti-spam / anti-exploit gate ---
        if (!this.canActivate()) return;

        const pressure = this.getPressureRatio();
        const boardIsCritical = this.systems.board.isCritical();

        /**
         * Breeze triggers ONLY after panic moments:
         * - High pressure
         * - Critical board state
         */
        if (pressure >= 0.6 && boardIsCritical && this.canUseSkill('second_wind')) {
            this.useSecondWind();
        }
    }

    canActivate() {
        const now = this.game.time?.now?.() ?? 0;
        return (
            now - this.lastActivationAt
            >= this.data.soft_caps.min_activation_gap
        );
    }

    markActivated() {
        this.lastActivationAt = this.game.time?.now?.() ?? 0;
    }

    /* =========================
       Skill: Second Wind
    ========================= */

    useSecondWind() {
        const skill = this.data.skills.find(s => s.id === 'second_wind');

        // --- Soft-caps enforced in code ---
        const multiplier = Math.max(
            this.data.soft_caps.gravity_slow_min_multiplier,
            skill.effect.multiplier
        );

        const duration = Math.min(
            this.data.soft_caps.effect_duration_max,
            skill.effect.duration
        );

        this.effectRouter.applyEffect({
            sourceId: this.sourceId,
            effect: {
                type: SkillEffectType.GLOBAL_GRAVITY_SLOW,
                multiplier,
                duration
            }
        });

        this.startCooldown(skill.id, skill.cooldown);
        this.markActivated();
    }
}
