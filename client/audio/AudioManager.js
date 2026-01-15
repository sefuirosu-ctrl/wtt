// AudioManager.js
// RESPONSIBILITY:
// Centralized audio playback and channel management.
// This is the ONLY entry point for playing any sound in the game.
//
// Canon:
// - Pages 35, 36, 38, 42
// - Stage 4.4 — Sound Integration
//
// Channels:
// UI, Emotion, Gameplay, Music, Terminal
//
// Priority:
// Terminal > Emotion > Gameplay > UI
//
// Timing:
// - Emotion & Terminal sounds: 4 seconds
// - Gameplay sounds: short, non-looping
//
// NOTE:
// This file does NOT know about emotions, skills, UI, or gameplay logic.
// It only executes audio requests.

export default class AudioManager {
    constructor(settingsProvider) {
        this.settingsProvider = settingsProvider;

        // -----------------------------------------------------------------
        // CHANNEL DEFINITIONS (CANON)
        // -----------------------------------------------------------------
        this.channels = {
            UI: this._createChannel(),
            Emotion: this._createChannel(),
            Gameplay: this._createChannel(),
            Music: this._createChannel(true),
            Terminal: this._createChannel()
        };

        // Priority order (higher overrides lower)
        this.channelPriority = [
            'Terminal',
            'Emotion',
            'Gameplay',
            'UI'
        ];

        // Global pause state
        this.isPaused = false;
        this.isTerminalLocked = false;
    }

    // -----------------------------------------------------------------
    // PUBLIC API
    // -----------------------------------------------------------------

    play(channelName, soundPath, options = {}) {
        if (!this.channels[channelName]) return;

        // Terminal lock: only Terminal sounds allowed
        if (this.isTerminalLocked && channelName !== 'Terminal') {
            return;
        }

        const channel = this.channels[channelName];
        const audio = this._createAudio(soundPath, options);

        channel.current = audio;
        audio.play();
    }

    stop(channelName) {
        const channel = this.channels[channelName];
        if (!channel || !channel.current) return;

        channel.current.pause();
        channel.current.currentTime = 0;
        channel.current = null;
    }

    stopAll(channelName) {
        if (channelName) {
            this.stop(channelName);
            return;
        }

        Object.keys(this.channels).forEach(name => {
            this.stop(name);
        });
    }

    // -----------------------------------------------------------------
    // PAUSE / RESUME
    // -----------------------------------------------------------------

    pauseAll() {
        this.isPaused = true;

        Object.values(this.channels).forEach(channel => {
            if (channel.current && !channel.isMusic) {
                channel.current.pause();
            }
        });

        // Music is faded down, not stopped
        if (this.channels.Music.current) {
            this._fadeVolume(this.channels.Music.current, 0.2, 300);
        }
    }

    resumeAll() {
        this.isPaused = false;

        Object.values(this.channels).forEach(channel => {
            if (channel.current && !channel.isMusic) {
                channel.current.play();
            }
        });

        if (this.channels.Music.current) {
            this._fadeVolume(this.channels.Music.current, 1.0, 300);
        }
    }

    // -----------------------------------------------------------------
    // TERMINAL STATE
    // -----------------------------------------------------------------

    lockTerminal() {
        this.isTerminalLocked = true;

        // Stop everything except Terminal
        Object.keys(this.channels).forEach(name => {
            if (name !== 'Terminal') {
                this.stop(name);
            }
        });
    }

    unlockTerminal() {
        this.isTerminalLocked = false;
    }

    // -----------------------------------------------------------------
    // INTERNAL HELPERS
    // -----------------------------------------------------------------

    _createChannel(isMusic = false) {
        return {
            current: null,
            isMusic
        };
    }

    _createAudio(path, options) {
        const audio = new Audio(path);

        audio.volume = this.settingsProvider.getVolume
            ? this.settingsProvider.getVolume()
            : 1.0;

        audio.loop = !!options.loop;

        // Canon: emotions & terminal are 4 seconds max
        if (options.maxDuration) {
            setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
            }, options.maxDuration);
        }

        return audio;
    }

    _fadeVolume(audio, targetVolume, durationMs) {
        const startVolume = audio.volume;
        const startTime = performance.now();

        const step = (now) => {
            const t = Math.min((now - startTime) / durationMs, 1);
            audio.volume = startVolume + (targetVolume - startVolume) * t;

            if (t < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    }
}
