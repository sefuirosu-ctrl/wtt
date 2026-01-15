import { BaseFXLayer } from './BaseFXLayer.js';

/**
 * ActColorGradingLayer
 *
 * RESPONSIBILITY:
 * Applies subtle color grading based on current ACT.
 *
 * Canon:
 * - AAA+ Enhancement — Color Dramaturgy
 * - Visual-only
 * - Event-driven
 *
 * Expected event data:
 * {
 *   act: number // 1..10
 * }
 */
export class ActColorGradingLayer extends BaseFXLayer {

    constructor(config) {
        super();
        this.config = config;
        this.currentAct = 1;
    }

    trigger(data) {
        this.currentAct = data.act;
        // Long-living, softly refreshed layer
        super.trigger({ act: data.act }, 1000);
    }

    _renderEffect(ctx, data, progress) {
        const { act } = data;

        ctx.save();

        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        const { color, intensity } = this._getActColor(act);

        ctx.fillStyle = `rgba(${color}, ${intensity})`;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();
    }

    _getActColor(act) {
        // Clamp just in case
        const a = Math.min(Math.max(act, 1), 10);

        switch (true) {
            case a <= 2:
                return { color: '40,60,90', intensity: 0.10 };
            case a <= 4:
                return { color: '70,50,120', intensity: 0.12 };
            case a <= 6:
                return { color: '120,40,120', intensity: 0.15 };
            case a <= 8:
                return { color: '120,30,30', intensity: 0.18 };
            case a === 9:
                return { color: '20,10,10', intensity: 0.22 };
            case a === 10:
                // Architect — холодная, стерильная тьма
                return { color: '10,20,30', intensity: 0.25 };
            default:
                return { color: '0,0,0', intensity: 0 };
        }
    }
}
