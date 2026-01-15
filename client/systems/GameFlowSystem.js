// client/systems/GameFlowSystem.js

import { resolveTimingModel } from './TimingModelResolver.js';

/**
 * GameFlowSystem
 * ----------------------------------------------------
 * Canonical director of a single run lifecycle.
 *
 * RESPONSIBILITIES:
 * - Level progression
 * - Act progression (10 levels per act)
 * - Minion activation/deactivation (Acts 1–9)
 * - Narrative breakpoint after Act 9
 * - Final Act (91–100) orchestration
 * - Run completion and failure
 *
 * HARD CANON RULES:
 * - GameFlowSystem never modifies gameplay systems directly
 * - GameFlowSystem owns flow, not mechanics
 * - Final Act is an explicit, documented exception
 */

const GAMEFLOW_STATES = {
    INIT_RUN: 'init_run',
    ACT_START: 'act_start',
    ACT_ACTIVE: 'act_active',
    ACT_END: 'act_end',
    FINAL_ACT: 'final_act',
    RUN_COMPLETE: 'run_complete',
    RUN_FAILED: 'run_failed'
};

export class GameFlowSystem {

    constructor(runContext, options = {}) {
        this.run = runContext;

        /* ==============================
           CONFIGURATION
        ============================== */

        this.levelsPerAct = options.levelsPerAct ?? 10;
        this.totalActs = options.totalActs ?? 10;
        this.totalLevels = this.levelsPerAct * this.totalActs;

        /* ==============================
           STATE
        ============================== */

        this.currentLevel = 1;
        this.currentAct = 1;
        this.state = GAMEFLOW_STATES.INIT_RUN;
        this.isRunActive = false;

        this.events = this.run.events;
    }

    /* ==================================================
       RUN INITIALIZATION
    ================================================== */

    startRun() {
        if (this.state !== GAMEFLOW_STATES.INIT_RUN) {
            throw new Error('[GameFlowSystem] Run already started.');
        }

        this.isRunActive = true;
        this.state = GAMEFLOW_STATES.ACT_START;

        /* --------------------------------------------------
           AAA+ TIMING MODEL INTEGRATION (NON-INTRUSIVE)
           --------------------------------------------------
           - Data-driven
           - Configured once per run
           - Does NOT alter GameFlow logic
        -------------------------------------------------- */

        try {
            const difficulty =
                this.run?.settings?.difficulty ??
                this.run?.difficulty ??
                1;

            const lockDelaySystem =
                this.run?.systems?.lockDelay ??
                this.run?.lockDelaySystem ??
                null;

            if (lockDelaySystem) {
                const timingModel = resolveTimingModel(difficulty);
                lockDelaySystem.configure(timingModel);
            }
        } catch (err) {
            console.warn('[GameFlowSystem] Timing model configuration skipped:', err);
        }

        /* -------------------------------------------------- */

        this.emit('run_started', {
            level: this.currentLevel,
            act: this.currentAct
        });

        this.startAct();
    }

    /* ==================================================
       ACT LIFECYCLE
    ================================================== */

    startAct() {
        if (!this.isRunActive) return;

        if (this.currentAct === this.totalActs) {
            this.startFinalAct();
            return;
        }

        this.state = GAMEFLOW_STATES.ACT_ACTIVE;

        this.emit('act_started', {
            act: this.currentAct
        });

        this.run.managers?.minion?.activateMinionForAct?.(this.currentAct);
    }

    onLevelCompleted() {
        if (!this.isRunActive) return;

        this.currentLevel++;

        if (
            this.currentLevel >
            this.currentAct * this.levelsPerAct
        ) {
            this.completeAct();
        }
    }

    completeAct() {
        this.state = GAMEFLOW_STATES.ACT_END;

        this.emit('act_completed', {
            act: this.currentAct
        });

        this.run.managers?.minion?.deactivateCurrentMinion?.();

        this.currentAct++;
        this.startAct();
    }

    /* ==================================================
       FINAL BREAKPOINT (AFTER ACT 9)
    ================================================== */

    startFinalAct() {
        this.state = GAMEFLOW_STATES.FINAL_ACT;

        this.emit('final_act_started', {
            act: this.currentAct
        });

        this.run.managers?.pet?.setIncapacitated?.(true);
    }

    /* ==================================================
       RUN TERMINATION
    ================================================== */

    completeRun() {
        if (!this.isRunActive) return;

        this.state = GAMEFLOW_STATES.RUN_COMPLETE;
        this.isRunActive = false;

        this.emit('run_completed');
        this.run.endRun?.('victory');
    }

    failRun() {
        if (!this.isRunActive) return;

        this.state = GAMEFLOW_STATES.RUN_FAILED;
        this.isRunActive = false;

        this.emit('run_failed');
        this.run.endRun?.('defeat');
    }

    /* ==================================================
       EVENTS
    ================================================== */

    emit(event, payload = {}) {
        this.events?.emit?.(event, payload);
    }
}
