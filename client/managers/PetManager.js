// client/managers/PetManager.js

/**
 * PetManager
 * ----------------------------------------------------
 * Canonical manager for a single Pet during a run.
 *
 * RESPONSIBILITIES:
 * - Own exactly ONE pet per run
 * - Control pet lifecycle and state
 * - Forward update calls when appropriate
 * - Enforce canonical pet states (ACTIVE / INCAPACITATED)
 *
 * HARD CANON RULES:
 * - A run can have only one pet
 * - Pet is always part of RunContext
 * - Pet may become mechanically inactive (incapacitated) in Final Act
 * - Pet is NEVER removed from RunContext mid-run
 */

const PET_STATES = {
    ACTIVE: 'active',
    INCAPACITATED: 'incapacitated'
};

export default class PetManager {
    constructor(runContext) {
        this.run = runContext;

        /* ==============================
           STATE
        ============================== */

        this.activePet = null;
        this.petState = PET_STATES.ACTIVE;

        /* ==============================
           INTERNAL FLAGS
        ============================== */

        this.isInitialized = false;

        /* ==============================
           EVENTS
        ============================== */

        this.events = this.run.events;
    }

    /* ==================================================
       INITIALIZATION
    ================================================== */

    /**
     * Initialize the single pet for this run.
     * Called once during RunContext initialization.
     */
    initPet(PetClass, petData) {
        if (this.isInitialized) {
            throw new Error('[PetManager] Pet already initialized.');
        }

        if (!PetClass) {
            throw new Error('[PetManager] PetClass is required.');
        }

        this.activePet = new PetClass(this.run, petData);
        this.petState = PET_STATES.ACTIVE;
        this.isInitialized = true;

        this.emit('pet_initialized', {
            petId: this.activePet.id,
            name: this.activePet.name
        });
    }

    /* ==================================================
       UPDATE LOOP
    ================================================== */

    /**
     * Update pet logic.
     * Pet updates are skipped if incapacitated.
     */
    update(deltaTime) {
        if (!this.activePet) return;

        if (this.petState === PET_STATES.INCAPACITATED) {
            return;
        }

        this.activePet.onUpdate?.(deltaTime);
    }

    /* ==================================================
       CANONICAL STATE TRANSITION
    ================================================== */

    /**
     * Canonical Final Act transition.
     * Pet becomes mechanically inactive but remains present.
     */
    setIncapacitated(reason = 'narrative') {
        if (!this.activePet) return;

        if (this.petState === PET_STATES.INCAPACITATED) {
            return;
        }

        this.petState = PET_STATES.INCAPACITATED;

        // Remove all pet-driven effects cleanly
        this.activePet.clearAllModifiers?.();

        // Optional hook for visuals / animation / VFX
        this.activePet.onIncapacitated?.(reason);

        this.emit('pet_incapacitated', {
            petId: this.activePet.id,
            reason
        });
    }

    /* ==================================================
       ACCESSORS
    ================================================== */

    getPet() {
        return this.activePet;
    }

    getPetState() {
        return this.petState;
    }

    isPetActive() {
        return this.activePet !== null &&
               this.petState === PET_STATES.ACTIVE;
    }

    /* ==================================================
       CLEANUP
    ================================================== */

    /**
     * Cleanup at run end.
     * Pet is never removed mid-run, only here.
     */
    cleanup() {
        if (!this.activePet) return;

        this.activePet.onCleanup?.();
        this.activePet = null;
        this.petState = PET_STATES.ACTIVE;
        this.isInitialized = false;
    }

    /* ==================================================
       DEBUG / INSPECTION
    ================================================== */

    getDebugState() {
        if (!this.activePet) return null;

        return {
            pet: this.activePet.getDebugState?.(),
            state: this.petState
        };
    }

    /* ==================================================
       EVENTS
    ================================================== */

    emit(eventName, payload) {
        this.events?.emit?.(eventName, payload);
    }
}
