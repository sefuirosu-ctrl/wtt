// client/telemetry/RunTelemetryRecorder.js

/**
 * RunTelemetryRecorder
 *
 * RESPONSIBILITY:
 * - Record high-level run metrics
 * - Provide post-run summary
 *
 * Canon:
 * - Stage 6.1.C — Telemetry foundation
 * - Read-only observer
 */

export class RunTelemetryRecorder {

    constructor(eventBus) {
        this.events = eventBus;
        this.reset();

        this._bind();
    }

    reset() {
        this.data = {
            startTime: performance.now(),
            endTime: null,

            maxPressure: 0,
            pressureSpikes: 0,

            linesCleared: 0,
            combosTriggered: 0,

            skillsUsed: {},
            actsReached: 1,
            causeOfDeath: null
        };
    }

    _bind() {
        this.events.on('pressure_changed', ({ value, spike }) => {
            this.data.maxPressure = Math.max(this.data.maxPressure, value);
            if (spike) this.data.pressureSpikes++;
        });

        this.events.on('line_cleared', ({ count }) => {
            this.data.linesCleared += count;
        });

        this.events.on('combo_triggered', ({ combo }) => {
            this.data.combosTriggered++;
        });

        this.events.on('skill_used', ({ skillId }) => {
            this.data.skillsUsed[skillId] =
                (this.data.skillsUsed[skillId] || 0) + 1;
        });

        this.events.on('act_started', ({ act }) => {
            this.data.actsReached = Math.max(this.data.actsReached, act);
        });

        this.events.on('run_failed', ({ reason }) => {
            this.data.causeOfDeath = reason || 'unknown';
            this.data.endTime = performance.now();
        });

        this.events.on('run_completed', () => {
            this.data.endTime = performance.now();
        });
    }

    getSummary() {
        const durationMs =
            (this.data.endTime || performance.now()) - this.data.startTime;

        return {
            ...this.data,
            durationSec: Math.round(durationMs / 1000)
        };
    }
}
