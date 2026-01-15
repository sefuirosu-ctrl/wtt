import { BaseFXLayer } from './BaseFXLayer.js';

/**
 * ComboEffectLayer
 *
 * RESPONSIBILITY:
 * Visual FX for combo chains.
 *
 * Canon:
 * - Stage 5.0.3 — Combo FX
 * - Visual-only
 * - Event-driven
 *
 * Expected event data:
 * {
 *   comboCount: number,
 *   boardWidth: number,
 *   boardHeight: number
 * }
 */
export class ComboEffectLayer extends BaseFXLayer {

    constructor(config) {
        super();
        this.config = config;
    }

    /**
     * Trigger combo FX.
     * @param {Object} data
     */
    trigger(data) {
        // Combo FX slightly longer than line clear
        const duration = Math.min(200 + data.comboCount * 60, 600);
        super.trigger(data, duration);
    }

    /**
     * Render a single combo FX instance.
     */
    _renderEffect(ctx, data, progress) {
        const { comboCount, boardWidth, boardHeight } = data;
        if (!comboCount || comboCount < 2) return;

        ctx.save();

        // Pulse intensity grows with combo
        const pulse = Math.sin(progress * Math.PI);
        const intensity = Math.min(comboCount / 6, 1);

        ctx.globalAlpha = 0.5 * pulse * intensity;
        ctx.strokeStyle = `rgba(255, 200, 80, 1)`;
        ctx.lineWidth = 4 + comboCount;

        const cellSize = ctx.canvas.width / boardWidth;
        const w = boardWidth * cellSize;
        const h = boardHeight * cellSize;

        ctx.strokeRect(
            2,
            2,
            w - 4,
            h - 4
        );

        ctx.restore();
    }
}
