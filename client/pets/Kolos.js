// client/pets/Kolos.js

import PetBase from './PetBase.js';
import { SkillEffectType } from '../systems/SkillEffectType.js';
import SkillEffectRouter from '../systems/SkillEffectRouter.js';

/**
 * Kolos the Raccoon
 * Opportunistic interception & partial conversion pet.
 *
 * HARD GUARANTEES:
 * - No full cancellation of threats
 * - No permanent advantages
 * - No Baron paralysis
 * - No infinite chains
 */
export default class Kolos extends PetBase {
    constructor(gameContext, data) {
        super(gameContext, data);

        this.effectRouter = new SkillEffectRouter(gameContext.systems);

        this.lastEvaluation = 0;
        this.lastActivationAt = -Infinity;

        this.activeInterceptions = 0;
    }

    /**
     * Reactive AI loop — threat driven, not proactive
     */
    evaluate(deltaTime) {
        this.lastEvaluation += deltaTime;
        if (this.lastEvaluation < this.data.ai_profile.evaluation_interval) return;
        this.lastEvaluation = 0;

        // --- Hard anti-spam gate ---
        if (!this.canActivate()) return;

        const baronThreat = this.systems.baronAI?.hasImminentThreat?.() ?? false;
        const pressureSpike = this.systems.pressure?.isSpikeImminent?.() ?? false;

        // Priority 1: steal a strong upcoming negative
        if (
            baronThreat &&
            this.canUseSkill('sticky_fingers') &&
            this.activeInterceptions < this.data.hard_limits.max_active_interceptions
        ) {
            this.useStickyFingers();
            return;
        }

        // Priority 2: convert part of a penalty after a mistake
        if (
            pressureSpike &&
            this.canUseSkill('scavenger_instinct')
        ) {
            this.useScavengerInstinct();
        }
    }

    canActivate() {
        const now = this.game.time?.now?.() ?? 0;
        return (
            now - this.lastActivationAt
            >= this.data.hard_limits.min_activation_gap
        );
    }

    markActivated() {
        this.lastActivationAt = this.game.time?.now?.() ?? 0;
    }

    /* =========================
       Skill: Sticky Fingers
       (Steal ONE upcoming negative)
    ========================= */

    useStickyFingers() {
        const skill = this.data.skills.find(s => s.id === 'sticky_fingers');

        this.effectRouter.applyEffect({
            sourceId: this.sourceId,
            effect: {
                type: SkillEffectType.STEAL_NEGATIVE_EFFECT
            }
        });

        this.activeInterceptions += 1;
        this.startCooldown(skill.id, skill.cooldown);
        this.markActivated();

        // Safety: auto-release interception after execution
        this.game.events?.once?.('baron_interference_resolved', () => {
            this.activeInterceptions = Math.max(0, this.activeInterceptions - 1);
        });
    }

    /* =========================
       Skill: Scavenger Instinct
       (Partial conversion, never full)
    ========================= */

    useScavengerInstinct() {
        const skill = this.data.skills.find(s => s.id === 'scavenger_instinct');

        const benefitMultiplier = Math.min(
            0.5, // HARD CAP: benefit never equals threat
            skill.effect.benefit_multiplier
        );

        this.effectRouter.applyEffect({
            sourceId: this.sourceId,
            effect: {
                type: SkillEffectType.CONVERT_NEGATIVES_TO_BENEFITS,
                multiplier: benefitMultiplier
            }
        });

        this.startCooldown(skill.id, skill.cooldown);
        this.markActivated();
    }
}
