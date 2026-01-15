// EmotionSoundController.js
// RESPONSIBILITY:
// Bridges logical emotion events to AudioManager playback using EmotionSoundMap.
//
// Canon:
// - Pages 36, 37 (Emotions)
// - Page 42 (Audio Architecture)
// - Stage 4.4.2 / 4.4.3
//
// This controller contains NO game logic and NO UI logic.

import { EmotionSoundMap } from '../mapping/emotion_sound_map.js';

export default class EmotionSoundController {
    constructor({ audioManager, emotionResolver }) {
        this.audioManager = audioManager;
        this.emotionResolver = emotionResolver;

        this._bindEmotionEvents();
    }

    // -----------------------------------------------------------------
    // EVENT BINDING
    // -----------------------------------------------------------------

    _bindEmotionEvents() {
        // Hero emotions
        this.emotionResolver.on('HERO_EMOTION', (emotionKey) => {
            this._handleEmotion('hero', emotionKey);
        });

        // Pet emotions
        this.emotionResolver.on('PET_EMOTION', (emotionKey) => {
            this._handleEmotion('pet', emotionKey);
        });

        // Antagonist emotions
        this.emotionResolver.on('ANTAGONIST_EMOTION', (emotionKey) => {
            this._handleEmotion('antagonist', emotionKey);
        });
    }

    // -----------------------------------------------------------------
    // CORE HANDLER
    // -----------------------------------------------------------------

    _handleEmotion(entityType, emotionKey) {
        const mapping = EmotionSoundMap[entityType]?.[emotionKey];

        // No sound defined for this emotion
        if (!mapping) return;

        const {
            cue,
            channel,
            maxDuration
        } = mapping;

        if (!cue) return;

        const soundPath = this._resolveSoundPath(entityType, cue);

        this.audioManager.play(channel, soundPath, {
            maxDuration
        });
    }

    // -----------------------------------------------------------------
    // PATH RESOLUTION
    // -----------------------------------------------------------------

    _resolveSoundPath(entityType, cue) {
        return `/assets/audio/${entityType}/${cue}.mp3`;
    }
}
