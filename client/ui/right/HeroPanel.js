// client/ui/right/HeroPanel.js

import AvatarMediaRenderer from '../common/AvatarMediaRenderer.js';

export default class HeroPanel {
    constructor(runContext) {
        this.run = runContext;

        this.visible = true;
        this.currentAvatarKey = null;
        this.currentMedia = null;

        this.events = this.run.events;
        this.emotionResolver = this.run.systems.emotionResolver;

        this.avatarRenderer =
            new AvatarMediaRenderer(this.run);

        this._boundHandlers = [];
    }

    init() {
        if (!this.emotionResolver) {
            throw new Error(
                '[HeroPanel] EmotionActionResolver is required.'
            );
        }

        this._bindEvents();
        this._syncFromResolver();
    }

    _bindEvents() {
        this._bind('emotion_state_updated', () => {
            this._syncFromResolver();
        });

        this._bind('run_completed', () => {
            this._syncFromResolver();
        });

        this._bind('run_failed', () => {
            this._syncFromResolver();
        });

        // React to settings change
        this._bind('settings_updated', () => {
            this._updateMedia();
        });
    }

    _bind(eventName, handler) {
        this.events.on(eventName, handler);
        this._boundHandlers.push({ eventName, handler });
    }

    _syncFromResolver() {
        const state =
            this.emotionResolver.getResolvedVisualState();
        if (!state || !state.hero) return;

        const hero = state.hero;

        if (hero.isUltimate2D) {
            this.currentAvatarKey =
                `hero_ultimate_${hero.action}`;
        } else if (hero.emotion) {
            this.currentAvatarKey =
                `hero_emotion_${hero.emotion}`;
        } else {
            this.currentAvatarKey = 'hero_neutral';
        }

        this._updateMedia();
    }

    _updateMedia() {
        this.currentMedia =
            this.avatarRenderer.resolve(
                this.currentAvatarKey
            );
    }

    getRenderData() {
        if (!this.visible) return null;

        return {
            media: this.currentMedia,
            container: { width: 400, height: 300 }
        };
    }

    destroy() {
        this._boundHandlers.forEach(
            ({ eventName, handler }) => {
                this.events.off(eventName, handler);
            }
        );
        this._boundHandlers = [];
    }
}
