// client/telemetry/InputReplayRecorder.js

/**
 * InputReplayRecorder
 *
 * RESPONSIBILITY:
 * - Record player input with timestamps
 *
 * Canon:
 * - Stage 6.1.C — Replay foundation
 * - No playback yet
 */

export class InputReplayRecorder {

    constructor() {
        this.reset();
    }

    reset() {
        this.startTime = performance.now();
        this.inputs = [];
    }

    recordInput(type, key) {
        this.inputs.push({
            time: performance.now() - this.startTime,
            type,
            key
        });
    }

    export() {
        return {
            startTime: this.startTime,
            inputs: this.inputs
        };
    }
}
