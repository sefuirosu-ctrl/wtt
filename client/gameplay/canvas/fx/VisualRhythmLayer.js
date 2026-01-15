import { BaseFXLayer } from './BaseFXLayer.js';

/**
 * VisualRhythmLayer
 *
 * RESPONSIBILITY:
 * Controls visual pauses, stillness and contrast for dramatic moments.
 *
 * Canon:
 * - AAA+ Enhancement — Final Visual Rhythm
 * - Visual-only
 * - Event-driven
 *
 * This layer:
 * - never blocks gameplay
 * - never freezes logic
 * - only affects visual tempo
 *
 * Expected event data:
 * {
 *   type: 'anticipation' | 'impact'
 * }
 */
export class VisualRhythmLayer extends BaseFXLayer {

    constructor(config) {
        super();
        this.config = config;
    }

    trigger(data) {
        const duration =
            data.type === 'anticipation' ? 60 : 90;

        super.trigger(data, duration);
    }

    _renderEffect(ctx, data, progress) {
        const { type } = data;

        ctx.save();

        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        if (type === 'anticipation') {
            // Subtle dim + slight zoom in
            const alpha = 0.12 * (1 - progress);
            const scale = 1 + 0.015 * (1 - progress);

            ctx.translate(w / 2, h / 2);
            ctx.scale(scale, scale);
            ctx.translate(-w / 2, -h / 2);

            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.fillRect(0, 0, w, h);
        }

        if (type === 'impact') {
            // Sharp contrast pop
            const alpha = 0.25 * Math.sin(progress * Math.PI);

            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(0, 0, w, h);
        }

        ctx.restore();
    }
}
