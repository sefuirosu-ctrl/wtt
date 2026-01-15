import { BaseFXLayer } from './BaseFXLayer.js';

/**
 * PerfectClearEffect
 *
 * RESPONSIBILITY:
 * Visual FX for perfect clear (empty board after line clear).
 *
 * Canon:
 * - Stage 5.0.3 — Line Clear & Combo FX
 * - Visual-only
 * - Event-driven
 *
 * Expected event data:
 * {
 *   boardWidth: number,
 *   boardHeight: number
 * }
 */
export class PerfectClearEffect extends BaseFXLayer {

    constructor(config) {
        super();
        this.config = config;
    }

    /**
     * Trigger perfect clear FX.
     * Perfect clear should feel special but not overwhelming.
     */
    trigger(data) {
        // Slightly longer than combo FX, still short-lived
        super.trigger(data, 600);
    }

    /**
     * Render a single perfect clear FX instance.
     */
    _renderEffect(ctx, data, progress) {
        const { boardWidth, boardHeight } = data;
        if (!boardWidth || !boardHeight) return;

        ctx.save();

        // Smooth fade-out glow
        const t = progress;
        const alpha = Math.sin((1 - t) * Math.PI);
        const glowStrength = 0.35 * alpha;

        const cellSize = ctx.canvas.width / boardWidth;
        const widthPx = boardWidth * cellSize;
        const heightPx = boardHeight * cellSize;

        // Background glow
        ctx.fillStyle = `rgba(200, 240, 255, ${glowStrength})`;
        ctx.fillRect(
            0,
            0,
            widthPx,
            heightPx
        );

        // Subtle border pulse
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 * alpha})`;
        ctx.lineWidth = 6;

        ctx.strokeRect(
            3,
            3,
            widthPx - 6,
            heightPx - 6
        );

        ctx.restore();
    }
}
