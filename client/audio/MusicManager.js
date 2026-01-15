// MusicManager.js
// RESPONSIBILITY:
// Controls background music based on PressureSystem and GameFlow.
//
// Canon:
// - Pages 11, 36, 42, 43
// - Stage 4.4.4
//
// Music is layer-based and pressure-driven.
// MusicManager does NOT decide pressure; it reacts to it.

export default class MusicManager {
    constructor({ audioManager, pressureSystem, gameFlow }) {
        this.audioManager = audioManager;
        this.pressureSystem = pressureSystem;
        this.gameFlow = gameFlow;

        this.currentLayer = null;
        this.isFinalAct = false;
        this.isTerminal = false;

        this._bindPressure();
        this._bindGameFlow();
    }

    // -----------------------------------------------------------------
    // PRESSURE BINDING
    // -----------------------------------------------------------------

    _bindPressure() {
        this.pressureSystem.on('PRESSURE_CHANGED', (value) => {
            if (this.isTerminal || this.isFinalAct) return;

            if (value < 0.3) {
                this._setLayer('base');
            } else if (value < 0.6) {
                this._setLayer('pressure_low');
            } else {
                this._setLayer('pressure_high');
            }
        });
    }

    // -----------------------------------------------------------------
    // GAME FLOW BINDING
    // -----------------------------------------------------------------

    _bindGameFlow() {
        this.gameFlow.on('FINAL_ACT_STARTED', () => {
            this.isFinalAct = true;
            this._setLayer('final_act', true);
        });

        this.gameFlow.on('PLAYER_VICTORY', () => {
            this.isTerminal = true;
            this._setLayer('victory', true);
        });

        this.gameFlow.on('PLAYER_DEFEAT', () => {
            this.isTerminal = true;
            this._setLayer('defeat', true);
        });
    }

    // -----------------------------------------------------------------
    // CORE MUSIC CONTROL
    // -----------------------------------------------------------------

    _setLayer(layerName, force = false) {
        if (!force && this.currentLayer === layerName) return;

        this.currentLayer = layerName;

        this.audioManager.stop('Music');

        const path = this._resolveMusicPath(layerName);

        this.audioManager.play('Music', path, {
            loop: true
        });
    }

    // -----------------------------------------------------------------
    // PATH RESOLUTION
    // -----------------------------------------------------------------

    _resolveMusicPath(layer) {
        return `/assets/audio/music/${layer}.mp3`;
    }
}
