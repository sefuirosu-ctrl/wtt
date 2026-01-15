// client/gameplay/canvas/fx/VFXIntensityLevels.js

/**
 * VFXIntensityLevels
 *
 * Canonical visual intensity presets.
 *
 * Used to scale alpha, distortion and screen shake.
 */

export const VFXIntensityLevels = {
    MIN: {
        alphaMultiplier: 0.4,
        distortionMultiplier: 0.3,
        shakeMultiplier: 0.3,
        maxActiveFX: 1
    },

    MED: {
        alphaMultiplier: 0.7,
        distortionMultiplier: 0.6,
        shakeMultiplier: 0.6,
        maxActiveFX: 2
    },

    MAX: {
        alphaMultiplier: 1.0,
        distortionMultiplier: 1.0,
        shakeMultiplier: 1.0,
        maxActiveFX: 3
    }
};
