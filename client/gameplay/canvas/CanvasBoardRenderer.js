// client/gameplay/canvas/CanvasBoardRenderer.js

import { BoardLayer } from './BoardLayer.js';
import { PieceLayer } from './PieceLayer.js';

import { FXBudgetController } from './fx/FXBudgetController.js';
import { FXPriority } from './fx/FXPriority.js';

/**
 * CanvasBoardRenderer
 * ----------------------------------------------------
 * Central orchestrator for all canvas-based rendering.
 *
 * RESPONSIBILITIES:
 * - Board rendering
 * - Piece rendering
 * - FX rendering with priority & intensity control
 *
 * HARD CANON:
 * - No gameplay logic
 * - No timing logic
 * - Visual-only
 */

export class CanvasBoardRenderer {

    constructor({
        rootElement,
        boardSystem,
        eventBus,
        config,
        renderLoop,
        vfxIntensity = 'MED'
    }) {
        // --- Guardrails / defaults (do not change canonical responsibilities) ---
        // rootElement is mandatory for DOM attach; fallback to body to prevent hard crash.
        this.rootElement = rootElement || document.getElementById('gameRoot') || document.body;

        this.boardSystem = boardSystem;
        this.eventBus = eventBus;
        this.config = config;

        // renderLoop is optional for Stage 6.1.A bootstrap.
        // If not provided, use an internal minimal loop that calls render() on RAF.
        this.renderLoop = renderLoop || this._createFallbackRenderLoop();

        /* ==============================
           CANVAS
        ============================== */

        this.canvas = null;
        this.ctx = null;

        /* ==============================
           CORE LAYERS
        ============================== */

        this.boardLayer = null;
        this.pieceLayer = null;

        /* ==============================
           FX SYSTEM
        ============================== */

        this.fxLayers = []; // { layer, priority }

        // Keep intensity param, but initialize FXBudgetController safely:
        // - Some implementations accept an options object
        // - Some accept intensity token
        // We normalize to an options object, while preserving vfxIntensity semantics.
        this.vfxIntensity = vfxIntensity;
        this.fxBudget = this._createFXBudgetController(vfxIntensity);

        /* ==============================
           STATE
        ============================== */

        this.needsRedraw = true;

        // Ensure rootElement exists before DOM operations
        if (!this.rootElement) {
            throw new Error('CanvasBoardRenderer: rootElement is required (provide #gameRoot or document.body).');
        }

        this._initCanvas();
        this._initLayers();
        this._bindEvents();
        this._resize();

        // Register into render loop (safe even for fallback)
        this.renderLoop.register(this);
        this._requestRedraw();
    }

    /* ==================================================
       INITIALIZATION
    ================================================== */

    _initCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.classList.add('gameplay-canvas');

        this.ctx = this.canvas.getContext('2d', {
            alpha: false,
            desynchronized: true
        });

        // Guard against undefined rootElement (original crash point)
        // If rootElement is not an Element, fallback to body.
        const target =
            (this.rootElement && this.rootElement.appendChild)
                ? this.rootElement
                : document.body;

        target.appendChild(this.canvas);
    }

    _initLayers() {
        this.boardLayer = new BoardLayer({
            ctx: this.ctx,
            config: this.config
        });

        this.pieceLayer = new PieceLayer({
            ctx: this.ctx,
            config: this.config
        });
    }

    /* ==================================================
       FX REGISTRATION (CALLED EXTERNALLY)
    ================================================== */

    registerFXLayer(layer, priority) {
        // Keep canonical API, but sanitize inputs
        const safePriority =
            typeof priority === 'number'
                ? priority
                : (FXPriority && FXPriority.MEDIUM ? FXPriority.MEDIUM : 500);

        this.fxLayers.push({ layer, priority: safePriority });
    }

    /* ==================================================
       EVENTS
    ================================================== */

    _bindEvents() {
        // EventBus may not be fully wired in Stage 6.1.A. Guard to avoid hard crash.
        if (!this.eventBus || typeof this.eventBus.on !== 'function') {
            // Still allow rendering via render loop; board snapshots may be pulled lazily.
            return;
        }

        this.eventBus.on('BOARD_UPDATED', () => {
            this._updateBoardSnapshot();
            this._requestRedraw();
        });

        this.eventBus.on('BOARD_RESET', () => {
            this._updateBoardSnapshot();
            this.pieceLayer.clear();
            this._requestRedraw();
        });

        this.eventBus.on('PIECE_UPDATED', (pieceSnapshot) => {
            this.pieceLayer.updateActivePiece(pieceSnapshot);
            this._requestRedraw();
        });

        this.eventBus.on('GHOST_PIECE_UPDATED', (ghostSnapshot) => {
            this.pieceLayer.updateGhostPiece(ghostSnapshot);
            this._requestRedraw();
        });

        this.eventBus.on('SOFT_DROP_START', () => {
            this.pieceLayer.dropAnimator.onSoftDropStart();
            this._requestRedraw();
        });

        this.eventBus.on('SOFT_DROP_END', () => {
            this.pieceLayer.dropAnimator.onSoftDropEnd();
            this._requestRedraw();
        });

        this.eventBus.on('HARD_DROP', () => {
            this.pieceLayer.dropAnimator.onHardDrop();
            this._requestRedraw();
        });

        window.addEventListener('resize', () => {
            this._resize();
            this._requestRedraw();
        });
    }

    /* ==================================================
       SNAPSHOT
    ================================================== */

    _updateBoardSnapshot() {
        // Guard for Stage 6.1.A incremental wiring
        if (!this.boardSystem || typeof this.boardSystem.getBoardSnapshot !== 'function') return;

        const snapshot = this.boardSystem.getBoardSnapshot();
        if (snapshot) {
            this.boardLayer.updateSnapshot(snapshot);
        }
    }

    /* ==================================================
       RENDER LOOP
    ================================================== */

    render(deltaMs = 16) {
        if (!this.needsRedraw) return;
        this.needsRedraw = false;

        this._clear();

        /* ------------------------------
           CORE RENDER
        ------------------------------ */

        // If no events were bound, ensure snapshot is still updated opportunistically
        if (!this.boardLayer.lastSnapshot) {
            this._updateBoardSnapshot();
        }

        this.boardLayer.render();

        const snapshot = this.boardLayer.lastSnapshot;
        if (snapshot) {
            const cellSize = this._getCellSize(snapshot);
            this.pieceLayer.render(cellSize, deltaMs);
        }

        /* ------------------------------
           FX RENDER (BUDGETED)
        ------------------------------ */

        // Compatibility: if FXBudgetController implementation differs, degrade gracefully.
        const activeFX =
            (this.fxBudget && typeof this.fxBudget.filterFX === 'function')
                ? this.fxBudget.filterFX(this.fxLayers)
                : this.fxLayers;

        for (const { layer } of activeFX) {
            if (!layer) continue;

            if (typeof layer.update === 'function') layer.update(deltaMs);

            this.ctx.save();

            // Intensity scaling (optional)
            if (this.fxBudget && typeof this.fxBudget.scaleAlpha === 'function') {
                this.ctx.globalAlpha =
                    this.fxBudget.scaleAlpha(this.ctx.globalAlpha || 1);
            }

            if (typeof layer.render === 'function') {
                layer.render(this.ctx);
            }

            this.ctx.restore();
        }
    }

    _requestRedraw() {
        if (!this.needsRedraw) {
            this.needsRedraw = true;
            if (this.renderLoop && typeof this.renderLoop.requestFullRedraw === 'function') {
                this.renderLoop.requestFullRedraw();
            }
        }
    }

    /* ==================================================
       UTIL
    ================================================== */

    _clear() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.fillStyle = this.config?.colors?.background || '#0b0f14';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    _getCellSize(snapshot) {
        const w = this.canvas.width / snapshot.width;
        const h = this.canvas.height / snapshot.height;
        return Math.min(w, h);
    }

    _resize() {
        if (!this.canvas || !this.ctx) return;

        const rect =
            (this.rootElement && typeof this.rootElement.getBoundingClientRect === 'function')
                ? this.rootElement.getBoundingClientRect()
                : { width: window.innerWidth, height: window.innerHeight };

        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;

        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    destroy() {
        if (this.renderLoop && typeof this.renderLoop.unregister === 'function') {
            this.renderLoop.unregister(this);
        }

        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }

    /* ==================================================
       INTERNAL HELPERS
    ================================================== */

    _createFXBudgetController(vfxIntensity) {
        // Preferred: if FXBudgetController supports options, map intensity to sane budgets.
        // This keeps "AAA+ FX priority budget" intent without assuming implementation details.
        const token = (typeof vfxIntensity === 'string') ? vfxIntensity.toUpperCase() : 'MED';

        const presets = {
            LOW: { maxActiveFX: 6, softLimit: 4 },
            MED: { maxActiveFX: 10, softLimit: 7 },
            HIGH: { maxActiveFX: 14, softLimit: 10 }
        };

        const opts = presets[token] || presets.MED;

        try {
            // Most robust: pass options object
            return new FXBudgetController(opts);
        } catch (e) {
            // Fallback: some legacy implementations may accept token directly
            return new FXBudgetController(vfxIntensity);
        }
    }

    _createFallbackRenderLoop() {
        // Minimal render loop for Stage 6.1.A if system loop isn't wired yet.
        // - register(renderer): stores ref
        // - unregister(renderer): clears ref
        // - requestFullRedraw(): just toggles a flag; RAF will call render()
        let current = null;
        let rafId = null;

        const tick = (t) => {
            // 16ms default delta for stability; can be replaced later by canonical loop
            if (current && typeof current.render === 'function') current.render(16);
            rafId = window.requestAnimationFrame(tick);
        };

        return {
            register(renderer) {
                current = renderer;
                if (!rafId) rafId = window.requestAnimationFrame(tick);
            },
            unregister(renderer) {
                if (current === renderer) current = null;
                if (rafId) {
                    window.cancelAnimationFrame(rafId);
                    rafId = null;
                }
            },
            requestFullRedraw() {
                if (current) current.needsRedraw = true;
            }
        };
    }
}
