import { PieceAnimator } from './PieceAnimator.js';
import { DropAnimator } from './DropAnimator.js';

/**
 * PieceLayer
 *
 * RESPONSIBILITY:
 * Visual-only rendering of:
 * - active falling piece (with animation)
 * - ghost piece (static)
 *
 * Canon:
 * - Stage 5.0.2 — Piece Animation System
 * - Stage 5.0.2.2 — Hard / Soft Drop Animation
 * - Canvas-only
 * - Logic authoritative
 *
 * PieceLayer:
 * - does NOT move pieces
 * - does NOT validate placement
 * - does NOT rotate pieces
 *
 * It only renders visual interpolation of logic snapshots.
 */

export class PieceLayer {

    constructor({
        ctx,
        config
    }) {
        this.ctx = ctx;
        this.config = config;

        // Visual animators (visual-only)
        this.animator = new PieceAnimator();
        this.dropAnimator = new DropAnimator();

        // Snapshots
        this.activePiece = null;
        this.ghostPiece = null;

        // Internal timing (provided by render loop)
        this._deltaMs = 0;
    }

    // -----------------------------------------------------------------
    // SNAPSHOT UPDATE
    // -----------------------------------------------------------------

    updateActivePiece(pieceSnapshot) {
        this.activePiece = pieceSnapshot;

        if (pieceSnapshot) {
            this.animator.setTarget(pieceSnapshot);
        } else {
            this.animator.reset();
        }
    }

    updateGhostPiece(ghostSnapshot) {
        this.ghostPiece = ghostSnapshot;
    }

    // -----------------------------------------------------------------
    // RENDER
    // -----------------------------------------------------------------

    render(cellSize, deltaMs = 16) {
        if (!cellSize) return;

        this._deltaMs = deltaMs;

        this.animator.update(deltaMs);
        this.dropAnimator.update(deltaMs);

        // Ghost piece first
        if (this.ghostPiece) {
            this._drawPiece(this.ghostPiece, cellSize, true);
        }

        const animatedPiece = this.animator.getInterpolated();
        if (animatedPiece) {
            animatedPiece.position.y = this.dropAnimator.apply(
                animatedPiece.position.y,
                deltaMs
            );

            this._drawPiece(animatedPiece, cellSize, false);
        }
    }

    // -----------------------------------------------------------------
    // DRAWING
    // -----------------------------------------------------------------

    _drawPiece(piece, cellSize, isGhost) {
        const { ctx } = this;
        const { blocks, type, position } = piece;

        ctx.save();

        const baseColor =
            this.config.colors.blocks[type] ||
            this.config.colors.blocks.default;

        ctx.fillStyle = isGhost
            ? this._applyGhostStyle(baseColor)
            : baseColor;

        for (const block of blocks) {
            const x = (position.x + block.x) * cellSize;
            const y = (position.y + block.y) * cellSize;

            this._drawBlock(x, y, cellSize);
        }

        ctx.restore();
    }

    _drawBlock(x, y, size) {
        const r = this.config.cell.cornerRadius;
        const ctx = this.ctx;

        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + size - r, y);
        ctx.quadraticCurveTo(x + size, y, x + size, y + r);
        ctx.lineTo(x + size, y + size - r);
        ctx.quadraticCurveTo(x + size, y + size, x + size - r, y + size);
        ctx.lineTo(x + r, y + size);
        ctx.quadraticCurveTo(x, y + size, x, y + size - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
    }

    // -----------------------------------------------------------------
    // GHOST STYLE
    // -----------------------------------------------------------------

    _applyGhostStyle(color) {
        if (!color.startsWith('#')) return color;

        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);

        return `rgba(${r}, ${g}, ${b}, 0.25)`;
    }

    // -----------------------------------------------------------------
    // PUBLIC API
    // -----------------------------------------------------------------

    clear() {
        this.activePiece = null;
        this.ghostPiece = null;
        this.animator.reset();
        this.dropAnimator.reset();
    }
}
