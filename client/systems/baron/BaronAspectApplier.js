// client/systems/baron/BaronAspectApplier.js

/**
 * BaronAspectApplier
 * ----------------------------------------------------
 * Canonical translator between:
 * - MinionProfile (Acts 1–9)
 * - Final Architect Aspect (Act 10)
 *
 * RESPONSIBILITIES:
 * - Apply and remove pressure biases
 * - Apply and remove Baron AI behavior biases
 * - Guarantee exclusivity of active aspect
 *
 * HARD CANON RULES:
 * - Only ONE aspect may be active at a time
 * - Minion aspects and Final Architect aspect are mutually exclusive
 * - Final Act replaces Minion behavior, it does NOT extend it
 */

export default class BaronAspectApplier {
    constructor(runContext) {
        this.run = runContext;

        /* ==============================
           STATE
        ============================== */

        this.activeAspect = null;

        /* ==============================
           SYSTEM REFERENCES
        ============================== */

        this.pressure = this.run.systems.pressure;
        this.baronAI = this.run.systems.baronAI;

        this.events = this.run.events;
    }

    /* ==================================================
       MINION ASPECT (ACTS 1–9)
    ================================================== */

    /**
     * Apply a MinionProfile aspect.
     * Used exclusively during Acts 1–9.
     */
    applyMinionAspect(minionProfile) {
        if (!minionProfile) return;

        this.clearActiveAspect();

        this.activeAspect = {
            type: 'minion',
            id: minionProfile.id
        };

        if (minionProfile.pressureBias) {
            this.pressure.pushBias(minionProfile.pressureBias);
        }

        if (minionProfile.baronBehaviorBias) {
            this.baronAI.pushBehaviorBias(
                minionProfile.baronBehaviorBias
            );
        }

        this.emit('baron_aspect_applied', {
            type: 'minion',
            id: minionProfile.id
        });
    }

    /**
     * Remove current Minion aspect.
     */
    removeMinionAspect(minionProfile) {
        if (!this.activeAspect) return;
        if (this.activeAspect.type !== 'minion') return;

        if (minionProfile?.pressureBias) {
            this.pressure.popBias(minionProfile.pressureBias);
        }

        if (minionProfile?.baronBehaviorBias) {
            this.baronAI.popBehaviorBias(
                minionProfile.baronBehaviorBias
            );
        }

        this.clearActiveAspect();
    }

    /* ==================================================
       FINAL ARCHITECT ASPECT (ACT 10)
    ================================================== */

    /**
     * Apply the Final Architect aspect.
     * Canonical replacement of all Minion behavior.
     */
    applyFinalArchitectAspect(finalAspectProfile) {
        if (!finalAspectProfile) return;

        this.clearActiveAspect();

        this.activeAspect = {
            type: 'final_architect',
            id: finalAspectProfile.id
        };

        // Apply overwhelming pressure
        if (finalAspectProfile.pressureBias) {
            this.pressure.pushBias(
                finalAspectProfile.pressureBias
            );
        }

        // Apply absolute Baron behavior
        if (finalAspectProfile.baronBehaviorBias) {
            this.baronAI.pushBehaviorBias(
                finalAspectProfile.baronBehaviorBias
            );
        }

        this.emit('baron_aspect_applied', {
            type: 'final_architect',
            id: finalAspectProfile.id
        });
    }

    /**
     * Remove Final Architect aspect.
     * Called only on run end.
     */
    removeFinalArchitectAspect(finalAspectProfile) {
        if (!this.activeAspect) return;
        if (this.activeAspect.type !== 'final_architect') return;

        if (finalAspectProfile?.pressureBias) {
            this.pressure.popBias(
                finalAspectProfile.pressureBias
            );
        }

        if (finalAspectProfile?.baronBehaviorBias) {
            this.baronAI.popBehaviorBias(
                finalAspectProfile.baronBehaviorBias
            );
        }

        this.clearActiveAspect();
    }

    /* ==================================================
       INTERNAL HELPERS
    ================================================== */

    /**
     * Removes any currently active aspect cleanly.
     */
    clearActiveAspect() {
        this.activeAspect = null;
    }

    /* ==================================================
       DEBUG / INSPECTION
    ================================================== */

    getActiveAspect() {
        return this.activeAspect;
    }

    getDebugState() {
        if (!this.activeAspect) return null;

        return {
            activeAspect: this.activeAspect
        };
    }

    /* ==================================================
       EVENTS
    ================================================== */

    emit(eventName, payload) {
        this.events?.emit?.(eventName, payload);
    }
}
