// client/systems/BoardSystem.js

/**
 * BoardSystem
 * ----------------------------------------------------
 * Canonical interface for ALL interactions with
 * the Tetris playfield.
 *
 * Rules:
 * - No direct board access outside this system
 * - All destructive or stabilizing actions go through here
 * - Must remain deterministic
 * - Used by Characters, Pets, and Black Baron
 */

export default class BoardSystem {
    constructor(boardState) {
        // boardState is an internal representation (grid, matrix, etc.)
        this.board = boardState;
    }

    /* ==================================================
       QUERY METHODS (READ-ONLY)
    ================================================== */

    /**
     * Returns a snapshot of the current board state
     * (used by AI, pets, analysis, debug)
     */
    getBoardSnapshot() {
        return this.board.clone();
    }

    /**
     * Checks if the board is in a critical state
     * (near game-over, high stacks, etc.)
     */
    isCritical() {
        return this.board.isNearOverflow();
    }

    /**
     * Returns a list of unstable or dangerous zones
     */
    getCriticalZones() {
        return this.board.findCriticalZones();
    }

    /* ==================================================
       STABILIZATION METHODS
    ================================================== */

    /**
     * Removes instability markers, smooths uneven stacks,
     * but DOES NOT clear full lines.
     *
     * Used by:
     * - Alexielle
     * - Lucia (via skills)
     * - Zirielle (Ultimate)
     */
    stabilizeField() {
        this.board.smoothSurface();
    }

    /**
     * Stabilizes only the most dangerous areas
     * without touching safe zones.
     *
     * Used by:
     * - Lucia (Miracle Grace)
     * - Zirielle (Absolute Zero)
     */
    stabilizeCriticalZones() {
        const zones = this.getCriticalZones();
        zones.forEach(zone => this.board.smoothZone(zone));
    }

    /* ==================================================
       DESTRUCTION METHODS (CONTROLLED)
    ================================================== */

    /**
     * Destroys a specific number of blocks chosen
     * by deterministic priority rules.
     *
     * Used by:
     * - Zirielle
     */
    destroyTargetedBlocks(count) {
        const targets = this.board.selectDestructionTargets(count);
        targets.forEach(cell => this.board.clearCell(cell));
    }

    /**
     * Destroys blocks using a seeded deterministic random.
     *
     * Used by:
     * - Edea (Dragon)
     */
    destroyRandomBlocks(count) {
        const targets = this.board.selectRandomTargets(count);
        targets.forEach(cell => this.board.clearCell(cell));
    }

    /**
     * High-impact destruction event.
     * Clears multiple layers or zones according to fixed rules.
     *
     * Used by:
     * - Edea (Ultimate)
     * - Black Baron (late phases)
     */
    triggerMassiveDestruction() {
        const zones = this.board.selectMassiveDestructionZones();
        zones.forEach(zone => this.board.clearZone(zone));
    }

    /* ==================================================
       NON-DESTRUCTIVE HELPERS
    ================================================== */

    /**
     * Attempts to complete near-finished lines.
     * Fails gracefully if conditions are not met.
     *
     * Used by:
     * - Lucia
     */
    attemptNearLineCompletion(successChance) {
        if (Math.random() <= successChance) {
            this.board.completeNearestLine();
        }
    }

    /**
     * Clears instability markers without modifying blocks.
     *
     * Used by:
     * - Alexielle
     */
    clearInstabilityMarkers() {
        this.board.clearInstabilityFlags();
    }
}
