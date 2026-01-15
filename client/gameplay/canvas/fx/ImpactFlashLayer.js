import { BaseFXLayer } from './BaseFXLayer.js';

export class ImpactFlashLayer extends BaseFXLayer {

    constructor(config) {
        super();
        this.config = config;
    }

    trigger(data) {
        // Очень короткая жизнь
        super.trigger(data, 80);
    }

    _renderEffect(ctx, data, progress) {
        const { intensity = 0.5, sourceType } = data;

        ctx.save();

        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        const alpha = (1 - progress) * 0.35 * intensity;

        let color = '255,255,255'; // default
        if (sourceType === 'baron') color = '255,80,80';
        if (sourceType === 'pet') color = '180,255,180';

        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();
    }
}
