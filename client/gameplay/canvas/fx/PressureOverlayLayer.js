import { BaseFXLayer } from './BaseFXLayer.js';

/**
 * PressureOverlayLayer
 *
 * RESPONSIBILITY:
 * Visual overlay representing pressure and danger level.
 *
 * Canon:
 * - Stage 5.0.4 — Skill & Pressure Field FX
 * - AAA+ visual quality target
 * - Visual-only, event-driven
 *
 * This layer:
 * - does NOT read pressure directly
 * - reacts to pressure events
 * - subtly distorts and darkens the field
 *
 * Expected event data:
 * {
 *   level: number,        // 0..1
 *   spike: boolean        // optional
 * }
 */
export class PressureOverlayLayer extends BaseFXLayer {

    constructor(config) {
        super();
        this.config = config;

        this.currentLevel = 0;
    }

    /**
     * Trigger pressure visual update.
     * Called when pressure changes or spikes.
     */
    trigger(data) {
        this.currentLevel = Math.min(Math.max(data.level, 0), 1);

        // Pressure overlay is persistent while pressure is high
        // We use a longer duration and keep refreshing it
        super.trigger(
            { level: this.currentLevel, spike: !!data.spike },
            400
        );
    }

    /**
     * Render pressure overlay.
     */
    _renderEffect(ctx, data, progress) {
        const { level, spike } = data;
        if (level <= 0) return;

        ctx.save();

        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        // Base intensity grows non-linearly
        let intensity = level * level;

        // Spike makes it sharper
        if (spike) {
            intensity = Math.min(intensity + 0.15, 1);
        }

        // Edge darkening (vignette-style)
        const gradient = ctx.createRadialGradient(
            w / 2, h / 2, Math.min(w, h) * 0.3,
            w / 2, h / 2, Math.max(w, h) * 0.6
        );

        gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
        gradient.addColorStop(1, `rgba(0, 0, 0, ${0.5 * intensity})`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Subtle pulse on spikes
        if (spike) {
            const pulse = Math.sin(progress * Math.PI);
            ctx.fillStyle = `rgba(120, 20, 20, ${0.15 * pulse})`;
            ctx.fillRect(0, 0, w, h);
        }

        ctx.restore();
    }
}
