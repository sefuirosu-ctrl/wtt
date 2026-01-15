// client/ui/right/PlayerSpriteStage.js

/**
 * PlayerSpriteStage
 * ----------------------------------------------------
 * Canonical sprite stage for Hero and Pet.
 *
 * Displays:
 * - Hero sprite emotions
 * - Hero skill / ultimate animations
 * - Pet sprite emotions (mirrors Hero)
 * - Pet skill animations
 * - Terminal victory / defeat animations
 *
 * IMPORTANT:
 * - This component NEVER decides emotions or actions.
 * - It ONLY renders resolved visual state from EmotionActionResolver.
 */

export default class PlayerSpriteStage {
    constructor(runContext) {
        this.run = runContext;

        /* ==============================
           STATE
        ============================== */

        this.visible = true;

        this.heroSpriteKey = null;
        this.petSpriteKey = null;

        /* ==============================
           REFERENCES
        ============================== */

        this.events = this.run.events;
        this.emotionResolver = this.run.systems.emotionResolver;

        /* ==============================
           INTERNAL
        ============================== */

        this._boundHandlers = [];
    }

    /* ==================================================
       INITIALIZATION
    ================================================== */

    init() {
        if (!this.emotionResolver) {
            throw new Error(
                '[PlayerSpriteStage] EmotionActionResolver is required.'
            );
        }

        this._bindEvents();
        this._syncFromResolver();
    }

    /* ==================================================
       EVENT BINDING
    ================================================== */

    _bindEvents() {
        // Resolver notifies when visual state changes
        this._bind('emotion_state_updated', () => {
            this._syncFromResolver();
        });

        // Terminal events
        this._bind('run_completed', () => {
            this._syncFromResolver();
        });

        this._bind('run_failed', () => {
            this._syncFromResolver();
        });
    }

    _bind(eventName, handler) {
        this.events.on(eventName, handler);
        this._boundHandlers.push({ eventName, handler });
    }

    /* ==================================================
       RESOLVER SYNC
    ================================================== */

    _syncFromResolver() {
        const state =
            this.emotionResolver.getResolvedVisualState();

        if (!state || !state.hero) return;

        const hero = state.hero;
        const pet = state.pet;

        /**
         * HERO SPRITE PRIORITY (CANON):
         * Action > Emotion
         */
        if (hero.action) {
            this._setHeroSprite(
                this._resolveHeroActionSprite(hero.action)
            );
        } else {
            this._setHeroSprite(
                this._resolveHeroEmotionSprite(hero.emotion)
            );
        }

        /**
         * PET SPRITE PRIORITY (CANON):
         * Action > Emotion (mirrors Hero emotion)
         */
        if (pet.action) {
            this._setPetSprite(
                this._resolvePetActionSprite(pet.action)
            );
        } else {
            this._setPetSprite(
                this._resolvePetEmotionSprite(pet.emotion)
            );
        }
    }

    /* ==================================================
       HERO SPRITE RESOLUTION
    ================================================== */

    _resolveHeroEmotionSprite(emotion) {
        return `hero_emotion_${emotion}`;
    }

    _resolveHeroActionSprite(actionId) {
        return `hero_action_${actionId}`;
    }

    /* ==================================================
       PET SPRITE RESOLUTION
    ================================================== */

    _resolvePetEmotionSprite(emotion) {
        return `pet_emotion_${emotion}`;
    }

    _resolvePetActionSprite(actionId) {
        return `pet_action_${actionId}`;
    }

    /* ==================================================
       SETTERS
    ================================================== */

    _setHeroSprite(key) {
        if (this.heroSpriteKey === key) return;
        this.heroSpriteKey = key;
    }

    _setPetSprite(key) {
        if (this.petSpriteKey === key) return;
        this.petSpriteKey = key;
    }

    /* ==================================================
       UPDATE LOOP
    ================================================== */

    update(deltaTimeMs) {
        // No per-frame logic here.
        // Sprite animation timing is handled by renderer.
    }

    /* ==================================================
       RENDER DATA
    ================================================== */

    getRenderData() {
        if (!this.visible) return null;

        return {
            heroSpriteKey: this.heroSpriteKey,
            petSpriteKey: this.petSpriteKey
        };
    }

    /* ==================================================
       CLEANUP
    ================================================== */

    destroy() {
        this._boundHandlers.forEach(({ eventName, handler }) => {
            this.events.off(eventName, handler);
        });

        this._boundHandlers = [];
        this.visible = false;
    }

    /* ==================================================
       DEBUG
    ================================================== */

    getDebugState() {
        return {
            heroSpriteKey: this.heroSpriteKey,
            petSpriteKey: this.petSpriteKey
        };
    }
}
