// emotion_sound_map.js
// RESPONSIBILITY:
// Maps logical emotions to sound cues.
// This file contains NO playback logic.
//
// Canon:
// - Pages 36, 37, 38, 42
// - Emotions are logical, sounds are cues.

export const EmotionSoundMap = {
    hero: {
        NEUTRAL: null,

        SMILE: {
            cue: 'hero_positive_light',
            channel: 'Emotion',
            maxDuration: 4000
        },

        HAPPY: {
            cue: 'hero_positive_medium',
            channel: 'Emotion',
            maxDuration: 4000
        },

        EXCITED: {
            cue: 'hero_positive_strong',
            channel: 'Emotion',
            maxDuration: 4000
        },

        TRIUMPH: {
            cue: 'hero_triumph',
            channel: 'Emotion',
            maxDuration: 4000
        },

        FOCUSED: {
            cue: 'hero_focus',
            channel: 'Emotion',
            maxDuration: 4000
        },

        RELIEF: {
            cue: 'hero_relief',
            channel: 'Emotion',
            maxDuration: 4000
        },

        WORRIED: {
            cue: 'hero_negative_light',
            channel: 'Emotion',
            maxDuration: 4000
        },

        PANIC: {
            cue: 'hero_negative_strong',
            channel: 'Emotion',
            maxDuration: 4000
        },

        ANGRY: {
            cue: 'hero_frustration',
            channel: 'Emotion',
            maxDuration: 4000
        },

        VICTORY_TRIUMPH: {
            cue: 'hero_victory',
            channel: 'Terminal',
            maxDuration: 4000
        },

        DEFEAT: {
            cue: 'hero_defeat',
            channel: 'Terminal',
            maxDuration: 4000
        }
    },

    pet: {
        NEUTRAL: null,

        HAPPY: {
            cue: 'pet_positive',
            channel: 'Emotion',
            maxDuration: 4000
        },

        EXCITED: {
            cue: 'pet_excited',
            channel: 'Emotion',
            maxDuration: 4000
        },

        WORRIED: {
            cue: 'pet_worried',
            channel: 'Emotion',
            maxDuration: 4000
        },

        PANIC: {
            cue: 'pet_panic',
            channel: 'Emotion',
            maxDuration: 4000
        },

        TRIUMPH: {
            cue: 'pet_triumph',
            channel: 'Emotion',
            maxDuration: 4000
        },

        INCAPACITATED: {
            cue: 'pet_incapacitated',
            channel: 'Emotion',
            maxDuration: 4000
        }
    },

    antagonist: {
        NEUTRAL: null,

        AMUSED: {
            cue: 'baron_amused',
            channel: 'Emotion',
            maxDuration: 4000
        },

        DISDAIN: {
            cue: 'baron_disdain',
            channel: 'Emotion',
            maxDuration: 4000
        },

        ANGRY: {
            cue: 'baron_anger',
            channel: 'Emotion',
            maxDuration: 4000
        },

        TRIUMPH: {
            cue: 'baron_triumph',
            channel: 'Terminal',
            maxDuration: 4000
        },

        REVEALED: {
            cue: 'baron_reveal',
            channel: 'Emotion',
            maxDuration: 4000
        },

        // Visual-only terminal state — no sound here
        DEFEATED: null
    }
};
