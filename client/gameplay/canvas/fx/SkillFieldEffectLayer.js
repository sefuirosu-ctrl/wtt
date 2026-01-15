import { BaseFXLayer } from './BaseFXLayer.js';

/**
 * SkillFieldEffectLayer
 *
 * RESPONSIBILITY:
 * Visual FX for skill-based field interactions.
 *
 * Canon:
 * - Stage 5.0.4.2 — Skill & Pressure Field FX
 * - AAA+ visual quality
 * - Visual-only, event-driven
 *
 * Visual signature depends on sourceType:
 * - hero
 * - pet
 * - minion
 * - baron
 */
export class SkillFieldEffectLayer extends BaseFXLayer {

    constructor(config) {
        super();
        this.config = config;
    }

    /**
     * Trigger a skill field FX.
     *
     * Expected data:
     * {
     *   sourceType: 'hero' | 'pet' | 'minion' | 'baron',
     *   intensity: number (0..1),
     * }
     */
    trigger(data) {
        const duration = 200 + (data.intensity || 0.5) * 200;
        super.trigger(data, duration);
    }

    _renderEffect(ctx, data, progress) {
        const { sourceType, intensity = 0.5 } = data;

        ctx.save();

        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        const alpha = (1 - progress) * 0.4 * intensity;

        switch (sourceType) {
            case 'hero':
                this._renderHeroEffect(ctx, w, h, alpha, progress);
                break;

            case 'pet':
                this._renderPetEffect(ctx, w, h, alpha, progress);
                break;

            case 'minion':
                this._renderMinionEffect(ctx, w, h, alpha, progress);
                break;

            case 'baron':
                this._renderBaronEffect(ctx, w, h, alpha, progress);
                break;
        }

        ctx.restore();
    }

    // -----------------------------------------------------------------
    // SOURCE-SPECIFIC VISUAL SIGNATURES
    // -----------------------------------------------------------------

    _renderHeroEffect(ctx, w, h, alpha, progress) {
        // Clean, focused pulse
        const pulse = Math.sin(progress * Math.PI);
        ctx.fillStyle = `rgba(120, 200, 255, ${alpha * pulse})`;
        ctx.fillRect(0, 0, w, h);
    }

    _renderPetEffect(ctx, w, h, alpha, progress) {
        // Soft, organic wave
        const wave = Math.sin(progress * Math.PI * 2);
        ctx.fillStyle = `rgba(180, 255, 180, ${alpha * wave * 0.6})`;
        ctx.fillRect(0, 0, w, h);
    }

    _renderMinionEffect(ctx, w, h, alpha, progress) {
        // Rough, unstable distortion
        const jitter = (Math.random() - 0.5) * 4;
        ctx.translate(jitter, jitter);
        ctx.fillStyle = `rgba(200, 120, 120, ${alpha})`;
        ctx.fillRect(0, 0, w, h);
    }

    _renderBaronEffect(ctx, w, h, alpha, progress) {
        // Heavy, oppressive overlay
        const pulse = Math.sin(progress * Math.PI);
        ctx.fillStyle = `rgba(80, 0, 0, ${alpha * pulse})`;
        ctx.fillRect(0, 0, w, h);
    }
}
