import { BaseFXLayer } from './BaseFXLayer.js';

export class FieldHitEffectLayer extends BaseFXLayer {

    constructor(config) {
        super();
        this.config = config;
    }

    trigger(data) {
        const duration = 120 + (data.intensity || 0.5) * 120;
        super.trigger(data, duration);
    }

    _renderEffect(ctx, data, progress) {
        const { intensity = 0.5, sourceType } = data;

        ctx.save();

        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        // Короткий импульс
        const pulse = Math.sin(progress * Math.PI);
        let alpha = 0.25 * pulse * intensity;

        // Источник влияет на “жёсткость”
        if (sourceType === 'baron') alpha *= 1.3;
        if (sourceType === 'pet') alpha *= 0.6;

        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();
    }
}
