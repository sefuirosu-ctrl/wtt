import { BaseFXLayer } from './BaseFXLayer.js';

/**
 * BlockImpactFXLayer
 *
 * RESPONSIBILITY:
 * Micro-scale and impact feedback when a piece locks into the board.
 *
 * Canon:
 * - AAA+ Enhancement (Pre-Stage 6)
 * - Visual-only
 * - Triggered on PIECE_LOCKED
 *
 * Effect:
 * - short scale pulse
 * - subtle dark flash
 *
 * Expected event data:
 * {
 *   intensity: number (0..1) // optional
 * }
 */
export class BlockImpactFXLayer extends BaseFXLayer {

    constructor(config) {
        super();
        this.config = config;
    }

    trigger(data = {}) {
        const intensity = Math.min(Math.max(data.intensity ?? 0.5, 0), 1);
        super.trigger({ intensity }, 90);
    }

    _renderEffect(ctx, data, progress) {
        const { intensity } = data;

        ctx.save();

        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        // Short scale pulse (1.04 -> 1.0)
        const pulse = Math.sin(progress * Math.PI);
        const scale = 1 + pulse * 0.04 * intensity;

        ctx.translate(w / 2, h / 2);
        ctx.scale(scale, scale);
        ctx.translate(-w / 2, -h / 2);

        // Subtle dark impact flash
        ctx.fillStyle = `rgba(0, 0, 0, ${0.15 * pulse * intensity})`;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();
    }
}
