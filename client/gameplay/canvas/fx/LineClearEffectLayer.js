import { BaseFXLayer } from './BaseFXLayer.js';

/**
 * LineClearEffectLayer
 *
 * RESPONSIBILITY:
 * Visual FX for cleared lines.
 *
 * Canon:
 * - Stage 5.0.3 — Line Clear FX
 * - Visual-only
 * - Event-driven
 *
 * Expected event data:
 * {
 *   rows: number[],   // cleared row indices
 *   width: number     // board width
 * }
 */
export class LineClearEffectLayer extends BaseFXLayer {

    constructor(config) {
        super();
        this.config = config;
    }

    /**
     * Trigger line clear FX.
     * @param {Object} data
     */
    trigger(data) {
        // duration: short and snappy
        super.trigger(data, 250);
    }

    /**
     * Render a single line clear FX instance.
     */
    _renderEffect(ctx, data, progress) {
        const { rows, width } = data;
        if (!rows || rows.length === 0) return;

        ctx.save();

        // Flash intensity fades out
        const alpha = 1 - progress;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * alpha})`;

        const cellSize = ctx.canvas.width / width;

        for (const row of rows) {
            const y = row * cellSize;

            ctx.fillRect(
                0,
                y,
                width * cellSize,
                cellSize
            );
        }

        ctx.restore();
    }
}
