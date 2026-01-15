// client/engine/BoardState.js

/**
 * BoardState
 * ----------------------------------------------------
 * Minimal deterministic Tetris board state + active piece.
 * This is Stage 6.1.A bootstrap implementation:
 * - Enough to spawn, move, rotate, drop, lock, clear lines
 * - Exposes clone() and getBoardSnapshot() for CanvasBoardRenderer/BoardLayer
 * - Implements the method surface expected by BoardSystem so
 *   skills/pets can be wired later without refactor.
 */

const PIECES = {
    I: [
        // rot 0
        [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
        // rot 1
        [{ x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
        // rot 2
        [{ x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
        // rot 3
        [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }]
    ],
    O: [
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]
    ],
    T: [
        [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }],
        [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }],
        [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }],
        [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }]
    ],
    S: [
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }],
        [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }],
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }],
        [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }]
    ],
    Z: [
        [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
        [{ x: 1, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }],
        [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
        [{ x: 1, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }]
    ],
    J: [
        [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 1 }],
        [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
        [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }],
        [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: -1, y: -1 }]
    ],
    L: [
        [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }],
        [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: -1 }],
        [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: -1 }],
        [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 1 }]
    ]
};

function mulberry32(seed) {
    let t = seed >>> 0;
    return function () {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

export class BoardState {
    constructor({ width = 10, height = 20, seed = 1 } = {}) {
        this.width = width;
        this.height = height;

        /** @type {(null|{type:string})[][]} */
        this.grid = Array.from({ length: height }, () =>
            Array.from({ length: width }, () => null)
        );

        this._rng = mulberry32(seed);
        this._bag = [];

        this.active = null; // {type, x, y, rot}
        this.hold = null;
        this.holdUsed = false;

        this.gameOver = false;

        // Gravity model (ms per row). Stage 6.1 uses a constant baseline.
        this.gravityMs = 800;
        this.softDropMultiplier = 20;
        this._gravityTimer = 0;

        this.spawnPiece();
    }

    // ==================================================
    // SNAPSHOT (for Canvas renderer)
    // ==================================================

    /**
     * Returns board snapshot in the format expected by BoardLayer
     * @returns {{ width: number, height: number, cells: Array }}
     */
    clone() {
        return {
            width: this.width,
            height: this.height,
            cells: this.grid.map(row => row.map(c => (c ? { type: c.type } : null)))
        };
    }

    /**
     * Alias for clone() - used by BoardSystem interface
     * @returns {{ width: number, height: number, cells: Array }}
     */
    getBoardSnapshot() {
        return this.clone();
    }

    getActivePieceSnapshot() {
        if (!this.active) return null;
        return {
            type: this.active.type,
            position: { x: this.active.x, y: this.active.y },
            blocks: this._getBlocks(this.active.type, this.active.rot)
        };
    }

    getGhostPieceSnapshot() {
        if (!this.active) return null;
        const ghost = { ...this.active };
        while (this._canPlace(ghost.type, ghost.x, ghost.y + 1, ghost.rot)) {
            ghost.y++;
        }
        return {
            type: ghost.type,
            position: { x: ghost.x, y: ghost.y },
            blocks: this._getBlocks(ghost.type, ghost.rot)
        };
    }

    // ==================================================
    // UPDATE
    // ==================================================

    /**
     * @param {number} deltaMs
     * @param {{ softDrop?:boolean }} input
     * @returns {{ moved?:boolean, touchedGround?:boolean, locked?:boolean, linesCleared?:number }}
     */
    update(deltaMs, input = {}) {
        if (this.gameOver) return {};
        if (!this.active) return {};

        const gravityStep = input.softDrop
            ? this.gravityMs / this.softDropMultiplier
            : this.gravityMs;

        this._gravityTimer += deltaMs;
        let moved = false;

        while (this._gravityTimer >= gravityStep) {
            this._gravityTimer -= gravityStep;
            const res = this._stepDown();
            moved = moved || res.moved;
            if (res.touchedGround) {
                return { moved, touchedGround: true };
            }
        }

        return { moved };
    }

    // ==================================================
    // INPUT ACTIONS (called by controller)
    // ==================================================

    move(dx) {
        if (!this.active) return false;
        const nextX = this.active.x + dx;
        if (this._canPlace(this.active.type, nextX, this.active.y, this.active.rot)) {
            this.active.x = nextX;
            return true;
        }
        return false;
    }

    rotate(dir = 1) {
        if (!this.active) return false;
        const nextRot = (this.active.rot + (dir > 0 ? 1 : 3)) % 4;

        // Minimal wall-kick set (enough for bootstrap).
        const kicks = [
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: -1 },
            { x: -2, y: 0 },
            { x: 2, y: 0 }
        ];

        for (const k of kicks) {
            const nx = this.active.x + k.x;
            const ny = this.active.y + k.y;
            if (this._canPlace(this.active.type, nx, ny, nextRot)) {
                this.active.x = nx;
                this.active.y = ny;
                this.active.rot = nextRot;
                return true;
            }
        }
        return false;
    }

    hardDrop() {
        if (!this.active) return { locked: false, linesCleared: 0 };
        while (this._canPlace(this.active.type, this.active.x, this.active.y + 1, this.active.rot)) {
            this.active.y++;
        }
        const lockRes = this.lockActive();
        return lockRes;
    }

    holdPiece() {
        if (!this.active || this.holdUsed) return false;
        const current = this.active.type;
        if (!this.hold) {
            this.hold = current;
            this.spawnPiece();
        } else {
            const swap = this.hold;
            this.hold = current;
            this._spawnSpecific(swap);
        }
        this.holdUsed = true;
        return true;
    }

    lockActive() {
        if (!this.active) return { locked: false, linesCleared: 0 };

        const blocks = this._getBlocks(this.active.type, this.active.rot);
        for (const b of blocks) {
            const x = this.active.x + b.x;
            const y = this.active.y + b.y;
            if (y < 0) {
                this.gameOver = true;
                return { locked: false, linesCleared: 0 };
            }
            this.grid[y][x] = { type: this.active.type };
        }

        const linesCleared = this._clearLines();
        this.spawnPiece();
        return { locked: true, linesCleared };
    }

    // ==================================================
    // BOARDSystem surface (stubs or simple impl)
    // ==================================================

    isNearOverflow() {
        // Simple: overflow if any block in top 2 rows.
        for (let y = 0; y < 2; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x]) return true;
            }
        }
        return false;
    }

    findCriticalZones() {
        // Bootstrap: return empty set.
        return [];
    }

    smoothSurface() {
        // Bootstrap: no-op.
    }

    smoothZone(_zone) {
        // Bootstrap: no-op.
    }

    selectDestructionTargets(count) {
        // Deterministic scan from bottom.
        const targets = [];
        for (let y = this.height - 1; y >= 0; y--) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x]) {
                    targets.push({ x, y });
                    if (targets.length >= count) return targets;
                }
            }
        }
        return targets;
    }

    clearCell(cell) {
        if (!cell) return;
        const { x, y } = cell;
        if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
            this.grid[y][x] = null;
        }
    }

    selectRandomTargets(count) {
        const filled = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x]) filled.push({ x, y });
            }
        }
        const out = [];
        for (let i = 0; i < count && filled.length > 0; i++) {
            const idx = Math.floor(this._rng() * filled.length);
            out.push(filled.splice(idx, 1)[0]);
        }
        return out;
    }

    selectMassiveDestructionZones() {
        // Bootstrap: clear bottom half as one zone.
        return [{ y0: Math.floor(this.height / 2), y1: this.height - 1 }];
    }

    clearZone(zone) {
        if (!zone) return;
        const y0 = Math.max(0, zone.y0 ?? 0);
        const y1 = Math.min(this.height - 1, zone.y1 ?? this.height - 1);
        for (let y = y0; y <= y1; y++) {
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = null;
            }
        }
    }

    completeNearestLine() {
        // Bootstrap: find a line with >= width-1 blocks and fill it.
        for (let y = this.height - 1; y >= 0; y--) {
            let filled = 0;
            for (let x = 0; x < this.width; x++) if (this.grid[y][x]) filled++;
            if (filled >= this.width - 1) {
                for (let x = 0; x < this.width; x++) this.grid[y][x] = { type: 'I' };
                this._clearLines();
                return;
            }
        }
    }

    clearInstabilityFlags() {
        // Bootstrap: no-op.
    }

    // ==================================================
    // INTERNAL
    // ==================================================

    spawnPiece() {
        this.holdUsed = false;

        const type = this._nextFromBag();
        this._spawnSpecific(type);
    }

    _spawnSpecific(type) {
        const spawnX = Math.floor(this.width / 2);
        const spawnY = 0;
        const rot = 0;

        const candidate = { type, x: spawnX, y: spawnY, rot };
        if (!this._canPlace(type, candidate.x, candidate.y, candidate.rot)) {
            // Try slightly higher spawn for tall stacks.
            candidate.y = -1;
        }
        if (!this._canPlace(type, candidate.x, candidate.y, candidate.rot)) {
            this.gameOver = true;
            this.active = null;
            return;
        }

        this.active = candidate;
    }

    _stepDown() {
        if (!this.active) return { moved: false, touchedGround: false };
        if (this._canPlace(this.active.type, this.active.x, this.active.y + 1, this.active.rot)) {
            this.active.y += 1;
            return { moved: true, touchedGround: false };
        }
        return { moved: false, touchedGround: true };
    }

    _clearLines() {
        let cleared = 0;
        for (let y = this.height - 1; y >= 0; y--) {
            let full = true;
            for (let x = 0; x < this.width; x++) {
                if (!this.grid[y][x]) {
                    full = false;
                    break;
                }
            }
            if (full) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array.from({ length: this.width }, () => null));
                cleared++;
                y++; // re-check this index after shift
            }
        }
        return cleared;
    }

    _getBlocks(type, rot) {
        const arr = PIECES[type] ?? PIECES.I;
        return arr[rot % 4];
    }

    _canPlace(type, x, y, rot) {
        const blocks = this._getBlocks(type, rot);
        for (const b of blocks) {
            const px = x + b.x;
            const py = y + b.y;
            if (px < 0 || px >= this.width) return false;
            if (py >= this.height) return false;
            if (py >= 0 && this.grid[py][px]) return false;
        }
        return true;
    }

    _nextFromBag() {
        if (this._bag.length === 0) {
            this._bag = Object.keys(PIECES);
            // Fisher-Yates shuffle using deterministic RNG.
            for (let i = this._bag.length - 1; i > 0; i--) {
                const j = Math.floor(this._rng() * (i + 1));
                const t = this._bag[i];
                this._bag[i] = this._bag[j];
                this._bag[j] = t;
            }
        }
        return this._bag.pop();
    }
}