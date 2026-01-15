// client/pets/Leaffy.js

import PetBase from './PetBase.js';
import { SkillEffectType } from '../systems/SkillEffectType.js';
import SkillEffectRouter from '../systems/SkillEffectRouter.js';

/**
 * Leaffy the Fox
 * Timing & tempo control pet (AAA-safe).
 *
 * GUARANTEES:
 * - No Pressure reduction
 * - No Board access
 * - No Baron access
 * - No permanent effects
 * - Soft-capped, rare activation
 */
export default class Leaffy extends PetBase {
    constructor(gameContext, data) {
        super(gameContext, data);

        this.effectRouter = new SkillEffectRouter(gameContext.systems);
        this.lastEvaluation = 0;

        // Anti-exploit guard
        this.lastActivationAt = 0;
        this.minGapBetweenActivations = 2.0; // seconds
    }

    evaluate(deltaTime) {
        this.lastEvaluation += deltaTime;
        if (this.lastEvaluation < this.data.ai_profile.evaluation_interval) return;
        this.lastEvaluation = 0;

        // Rare activation gate
        if (!this.canActivate()) return;

        const comboActive = this.game.systems.combo?.isComboActive?.() ?? false;

        // Priority 1: active combo → extend window (not infinite)
        if (comboActive && this.canUseSkill('trick_trail')) {
            this.useTrickTrail();
            return;
        }

        // Priority 2: tempo recovery → cooldown reduction
        if (this.canUseSkill('quick_wit')) {
            this.useQuickWit();
        }
    }

    canActivate() {
        const now = this.game.time?.now?.() ?? 0;
        return (now - this.lastActivationAt) >= this.minGapBetweenActivations;
    }

    markActivated() {
        this.lastActivationAt = this.game.time?.now?.() ?? 0;
    }

    /* =========================
       Skills
    ========================= */

    useQuickWit() {
        const skill = this.data.skills.find(s => s.id === 'quick_wit');
        const cap = this.data.soft_caps.cooldown_reduction_max;

        // Soft-cap the reduction (never exceed)
        const reduction = Math.max(
            1 - cap,
            skill.effect.multiplier
        );

        const duration = Math.min(
            this.data.soft_caps.effect_duration_max,
            skill.effect.duration
        );

        this.effectRouter.applyEffect({
            sourceId: this.sourceId,
            effect: {
                type: SkillEffectType.COOLDOWN_REDUCTION,
                multiplier: reduction,
                duration
            }
        });

        this.startCooldown(skill.id, skill.cooldown);
        this.markActivated();
    }

    useTrickTrail() {
        const skill = this.data.skills.find(s => s.id === 'trick_trail');
        const cap = this.data.soft_caps.combo_window_extension_max;

        const extension = Math.min(
            cap,
            skill.effect.multiplier
        );

        const duration = Math.min(
            this.data.soft_caps.effect_duration_max,
            skill.effect.duration
        );

        this.effectRouter.applyEffect({
            sourceId: this.sourceId,
            effect: {
                type: SkillEffectType.COMBO_AMPLIFICATION,
                multiplier: 1 + extension,
                duration
            }
        });

        this.startCooldown(skill.id, skill.cooldown);
        this.markActivated();
    }
}
