/**
 * CanvasConfig
 *
 * RESPONSIBILITY:
 * Centralized visual configuration for Canvas-based gameplay rendering.
 *
 * Canon:
 * - Stage 5.0 — Gameplay Visual Layer
 * - Pure visual parameters only
 * - No gameplay logic
 *
 * This config is intentionally static and declarative.
 * Runtime changes should be handled by higher-level systems.
 */

export const CanvasConfig = {

    // -----------------------------------------------------------------
    // BOARD DIMENSIONS
    // -----------------------------------------------------------------

    board: {
        defaultWidth: 10,
        defaultHeight: 20,

        // Padding around the board inside canvas (in px)
        padding: {
            top: 8,
            right: 8,
            bottom: 8,
            left: 8
        }
    },

    // -----------------------------------------------------------------
    // CELL VISUALS
    // -----------------------------------------------------------------

    cell: {
        // Base cell size multiplier (actual size depends on canvas size)
        scale: 1.0,

        // Border between cells
        gap: 1,

        // Rounded corners for blocks
        cornerRadius: 2
    },

    // -----------------------------------------------------------------
    // COLORS (DEFAULT THEME)
    // -----------------------------------------------------------------

    colors: {
        background: '#0b0e13',
        grid: '#1c2330',

        emptyCell: '#0b0e13',

        blocks: {
            I: '#5fd3ff',
            O: '#ffd966',
            T: '#b98cff',
            S: '#7dff8b',
            Z: '#ff6b6b',
            J: '#6b8cff',
            L: '#ff9f43',

            // Fallback if type is unknown
            default: '#aaaaaa'
        },

        // Visual warning when board is critical
        criticalOverlay: 'rgba(255, 80, 80, 0.15)'
    },

    // -----------------------------------------------------------------
    // GRID
    // -----------------------------------------------------------------

    grid: {
        lineWidth: 1,
        showGrid: true
    },

    // -----------------------------------------------------------------
    // PERFORMANCE & QUALITY
    // -----------------------------------------------------------------

    performance: {
        // If true, disable expensive visual features
        lowQualityMode: false
    },

    // -----------------------------------------------------------------
    // ACCESSIBILITY & SCALING
    // -----------------------------------------------------------------

    accessibility: {
        // Global visual scale (e.g. for UI zoom)
        globalScale: 1.0,

        // High contrast mode support (future)
        highContrast: false
    }
};
