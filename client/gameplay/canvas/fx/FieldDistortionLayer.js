import { BaseFXLayer } from './BaseFXLayer.js';

/**
 * FieldDistortionLayer
 *
 * RESPONSIBILITY:
 * Subtle visual distortion of the entire board field.
 *
 * Canon:
 * - Stage 5.0.4.3 — Field Distortion FX
 * - AAA+ visual quality
 * - Visual-only, event-driven
 *
 * This layer is used to convey:
 * - high pressure
 * - heavy impacts
 * - Baron / Minion dominance
 *
 * Expected event data:
 * {
 *   intensity: number (0..1),
 *   type: 'pressure' | 'hit' | 'baron'
 * }
 */
export class FieldDistortionLayer extends BaseFXLayer {

    constructor(config) {
        super();
        this.config = config;

        // Persistent distortion baseline
        this.baseIntensity = 0;
    }

    /**
     * Trigger a distortion FX.
     */
    trigger(data) {
        const intensity = Math.min(Math.max(data.intensity || 0.5, 0), 1);

        // Short, sharp distortions for hits; longer for pressure
        const duration =
            data.type === 'hit' ? 120 :
            data.type === 'baron' ? 300 :
            400;

        super.trigger(
            { intensity, type: data.type },
            duration
        );
    }

    /**
     * Render distortion effect.
     */
    _renderEffect(ctx, data, progress) {
        const { intensity, type } = data;

        ctx.save();

        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        // Distortion strength curve
        const falloff = 1 - progress;
        let strength = intensity * falloff;

        // Baron effects feel heavier
        if (type === 'baron') {
            strength *= 1.3;
        }

        // Hit effects are sharp and quick
        if (type === 'hit') {
            strength *= Math.sin(progress * Math.PI);
        }

        // Calculate distortion offset
        const offsetX = Math.sin(performance.now() * 0.02) * strength * 6;
        const offsetY = Math.cos(performance.now() * 0.018) * strength * 6;

        ctx.translate(offsetX, offsetY);

        // Slight scale distortion for pressure
        if (type === 'pressure') {
            const scale = 1 + strength * 0.015;
            ctx.translate(w / 2, h / 2);
            ctx.scale(scale, scale);
            ctx.translate(-w / 2, -h / 2);
        }

        // Optional subtle darkening to enhance instability
        ctx.fillStyle = `rgba(0, 0, 0, ${0.08 * strength})`;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();
    }
}
