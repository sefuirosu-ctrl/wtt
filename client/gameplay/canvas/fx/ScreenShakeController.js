export class ScreenShakeController {

    constructor() {
        this.time = 0;
        this.duration = 0;
        this.strength = 0;
    }

    trigger({ intensity = 0.5, type = 'light' }) {
        this.time = 0;
        this.duration =
            type === 'knockdown' ? 140 :
            type === 'heavy' ? 100 : 70;

        this.strength =
            type === 'knockdown' ? 10 :
            type === 'heavy' ? 6 : 3;

        this.strength *= intensity;
    }

    update(deltaMs) {
        if (this.time < this.duration) {
            this.time += deltaMs;
        }
    }

    apply(ctx) {
        if (this.time >= this.duration) return;

        const t = 1 - this.time / this.duration;
        const dx = (Math.random() - 0.5) * this.strength * t;
        const dy = (Math.random() - 0.5) * this.strength * t;

        ctx.translate(dx, dy);
    }

    reset() {
        this.time = 0;
        this.duration = 0;
        this.strength = 0;
    }
}
