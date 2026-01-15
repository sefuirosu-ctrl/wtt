/**
 * BoardLayer
 *
 * RESPONSIBILITY:
 * Visual-only rendering layer for the board grid and static blocks.
 *
 * Canon:
 * - Stage 5.0 — Gameplay Visual Layer
 * - Canvas-only implementation
 * - No gameplay logic
 *
 * BoardLayer:
 * - draws grid
 * - draws occupied cells
 * - reacts to board snapshots
 *
 * Does NOT:
 * - move pieces
 * - animate
 * - apply effects
 */

export class BoardLayer {

    constructor({
        ctx,
        config
    }) {
        this.ctx = ctx;
        this.config = config;

        this.lastSnapshot = null;
    }

    // -----------------------------------------------------------------
    // SNAPSHOT UPDATE
    // -----------------------------------------------------------------

    /**
     * Update board snapshot for rendering.
     * @param {Object} snapshot
     */
    updateSnapshot(snapshot) {
        this.lastSnapshot = snapshot;
    }

    // -----------------------------------------------------------------
    // RENDER
    // -----------------------------------------------------------------

    /**
     * Render grid and blocks based on the last snapshot.
     */
    render() {
        if (!this.lastSnapshot) return;

        const { width, height } = this.lastSnapshot;
        const cellSize = this._getCellSize(width, height);

        if (this.config.grid.showGrid) {
            this._drawGrid(width, height, cellSize);
        }

        this._drawCells(width, height, cellSize);
    }

    // -----------------------------------------------------------------
    // GRID
    // -----------------------------------------------------------------

    _drawGrid(width, height, cellSize) {
        const { ctx } = this;

        ctx.save();
        ctx.strokeStyle = this.config.colors.grid;
        ctx.lineWidth = this.config.grid.lineWidth;

        for (let y = 0; y <= height; y++) {
            const py = y * cellSize;
            ctx.beginPath();
            ctx.moveTo(0, py);
            ctx.lineTo(width * cellSize, py);
            ctx.stroke();
        }

        for (let x = 0; x <= width; x++) {
            const px = x * cellSize;
            ctx.beginPath();
            ctx.moveTo(px, 0);
            ctx.lineTo(px, height * cellSize);
            ctx.stroke();
        }

        ctx.restore();
    }

    // -----------------------------------------------------------------
    // CELLS
    // -----------------------------------------------------------------

    _drawCells(width, height, cellSize) {
        const { ctx } = this;
        const cells = this.lastSnapshot.cells;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = cells[y][x];
                if (!cell || cell.isEmpty) continue;

                this._drawCell(x, y, cell, cellSize);
            }
        }
    }

    _drawCell(x, y, cell, cellSize) {
        const { ctx } = this;
        const radius = this.config.cell.cornerRadius;

        ctx.save();
        ctx.fillStyle =
            this.config.colors.blocks[cell.type] ||
            this.config.colors.blocks.default;

        const px = x * cellSize;
        const py = y * cellSize;

        this._drawRoundedRect(
            px,
            py,
            cellSize,
            cellSize,
            radius
        );

        ctx.restore();
    }

    // -----------------------------------------------------------------
    // UTILITIES
    // -----------------------------------------------------------------

    _getCellSize(width, height) {
        // BoardLayer assumes canvas already sized correctly
        const availableWidth = this.ctx.canvas.width;
        const availableHeight = this.ctx.canvas.height;

        const cellWidth = availableWidth / width;
        const cellHeight = availableHeight / height;

        return Math.min(cellWidth, cellHeight) * this.config.cell.scale;
    }

    _drawRoundedRect(x, y, w, h, r) {
        const { ctx } = this;

        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
    }
}
