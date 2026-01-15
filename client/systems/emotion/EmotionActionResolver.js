// client/systems/emotion/EmotionActionResolver.js

/**
 * EmotionActionResolver
 * ----------------------------------------------------
 * Canonical resolver for emotional and action-based
 * visual states (Stage 4.2.3).
 *
 * RESPONSIBILITIES:
 * - Accept gameplay events
 * - Resolve short-term emotions
 * - Resolve action (skill / ultimate) states
 * - Handle terminal victory / defeat states
 * - Freeze correctly during pause
 *
 * HARD CANON:
 * - No UI logic
 * - No asset knowledge
 * - No localization
 * - No sound playback
 */

const TERMINAL_PRIORITY = 5;

export default class EmotionActionResolver {
    constructor(runContext) {
        this.run = runContext;

        /* ==============================
           STATE FLAGS
        ============================== */

        this.isPaused = false;
        this.isTerminal = false;

        /* ==============================
           ENTITY STATES
        ============================== */

        this.hero = this._createEntityState('Hero');
        this.baron = this._createEntityState('Baron');

        /* ==============================
           EVENTS
        ============================== */

        this.events = this.run.events;
        this._bindSystemEvents();
    }

    /* ==================================================
       INITIALIZATION HELPERS
    ================================================== */

    _createEntityState(name) {
        return {
            name,

            emotion: {
                id: 'NEUTRAL',
                priority: 0,
                remainingTime: 0,
                isTerminal: false
            },

            action: {
                id: null,
                remainingTime: 0,
                isUltimate: false
            }
        };
    }

    _bindSystemEvents() {
        this.events.on('pause_requested', () => {
            this.isPaused = true;
        });

        this.events.on('resume_requested', () => {
            this.isPaused = false;
        });
    }

    /* ==================================================
       EVENT ENTRY POINT
    ================================================== */

    /**
     * Main entry point for all emotion/action events.
     */
    handleEvent(event) {
        if (this.isTerminal) return;

        switch (event.type) {
            case 'RUN_COMPLETED':
                this._handleVictory();
                return;

            case 'RUN_FAILED':
                this._handleDefeat();
                return;

            case 'SKILL_USED':
            case 'ULTIMATE_USED':
                this._handleAction(event);
                return;

            default:
                this._handleEmotion(event);
        }
    }

    /* ==================================================
       TERMINAL STATES
    ================================================== */

    _handleVictory() {
        this.isTerminal = true;

        this.hero.emotion = {
            id: 'VICTORY_TRIUMPH',
            priority: TERMINAL_PRIORITY,
            remainingTime: 0,
            isTerminal: true
        };

        // Pet mirrors Hero (handled by UI)
    }

    _handleDefeat() {
        this.isTerminal = true;

        this.baron.emotion = {
            id: 'TRIUMPH',
            priority: TERMINAL_PRIORITY,
            remainingTime: 0,
            isTerminal: true
        };
    }

    /* ==================================================
       ACTION HANDLING (SKILLS / ULTIMATES)
    ================================================== */

    _handleAction(event) {
        const target = this._resolveTarget(event.source);
        if (!target) return;

        target.action = {
            id: event.actionId,
            remainingTime: event.durationMs ?? 0,
            isUltimate: event.type === 'ULTIMATE_USED'
        };
    }

    /* ==================================================
       EMOTION HANDLING
    ================================================== */

    _handleEmotion(event) {
        const emotionData = this._lookupEmotion(event);
        if (!emotionData) return;

        const target = this._resolveTarget(emotionData.target);
        if (!target) return;

        if (target.emotion.isTerminal) return;

        if (target.emotion.priority > emotionData.priority) {
            return;
        }

        target.emotion = {
            id: emotionData.id,
            priority: emotionData.priority,
            remainingTime: emotionData.durationMs,
            isTerminal: false
        };

        // Notify that emotion SFX should be played once
        this.events.emit('emotion_activated', {
            entity: target.name,
            emotion: emotionData.id
        });
    }

    _resolveTarget(source) {
        if (source === 'Hero' || source === 'Pet') {
            return this.hero;
        }
        if (source === 'Baron') {
            return this.baron;
        }
        return null;
    }

    /* ==================================================
       UPDATE LOOP
    ================================================== */

    update(deltaTimeMs) {
        if (this.isPaused || this.isTerminal) return;

        this._updateEntity(this.hero, deltaTimeMs);
        this._updateEntity(this.baron, deltaTimeMs);
    }

    _updateEntity(entity, deltaTimeMs) {
        // Update action first (higher priority)
        if (entity.action.id) {
            entity.action.remainingTime -= deltaTimeMs;
            if (entity.action.remainingTime <= 0) {
                entity.action.id = null;
                entity.action.remainingTime = 0;
                entity.action.isUltimate = false;
            }
        }

        // Update emotion
        if (
            entity.emotion.remainingTime > 0 &&
            !entity.emotion.isTerminal
        ) {
            entity.emotion.remainingTime -= deltaTimeMs;

            if (entity.emotion.remainingTime <= 0) {
                this._restoreBaseEmotion(entity);
            }
        }
    }

    _restoreBaseEmotion(entity) {
        if (entity.name === 'Hero') {
            entity.emotion = {
                id: 'NEUTRAL',
                priority: 0,
                remainingTime: 0,
                isTerminal: false
            };
        }

        if (entity.name === 'Baron') {
            const globalEmotion =
                this.run.systems?.baronAI?.getGlobalEmotion?.() ??
                'NEUTRAL';

            entity.emotion = {
                id: globalEmotion,
                priority: 0,
                remainingTime: 0,
                isTerminal: false
            };
        }
    }

    /* ==================================================
       LOOKUP TABLE (STUB)
       Will be replaced by data-driven mapping
    ================================================== */

    _lookupEmotion(event) {
        /**
         * This is intentionally minimal.
         * Full table will be injected as data.
         */
        switch (event.type) {
            case 'BIG_COMBO':
                return {
                    id: 'TRIUMPH',
                    priority: 4,
                    durationMs: 5000,
                    target: 'Hero'
                };

            case 'STRIKE':
                return {
                    id: 'FURIOUS',
                    priority: 4,
                    durationMs: 5000,
                    target: 'Baron'
                };

            default:
                return null;
        }
    }

    /* ==================================================
       OUTPUT FOR UI
    ================================================== */

    getResolvedVisualState() {
        return {
            hero: {
                emotion: this.hero.emotion.id,
                action: this.hero.action.id,
                isUltimate2D: this.hero.action.isUltimate
            },
            pet: {
                emotion: this.hero.emotion.id,
                action: null
            },
            baron: {
                emotion: this.baron.emotion.id,
                action: this.baron.action.id,
                isUltimate2D: this.baron.action.isUltimate
            }
        };
    }

    /* ==================================================
       DEBUG
    ================================================== */

    getDebugState() {
        return {
            paused: this.isPaused,
            terminal: this.isTerminal,
            hero: this.hero,
            baron: this.baron
        };
    }
}
