// AvatarMediaRenderer.js
// RESPONSIBILITY:
// Renders 2D avatar media (PNG / MP4) for Hero, Pet, and Antagonist.
// This file has been EXTENDED (not rewritten) to support:
// - Antagonist forms (default / architect)
// - Emotion visual variations (folder-based)
// - Terminal visual state: DEFEATED (non-emotional)
// - PNG / MP4 switching via settings
// All existing behavior is preserved.

export default class AvatarMediaRenderer {
    constructor(settingsProvider) {
        // settingsProvider is assumed to be an existing dependency
        // providing access to user settings (e.g. video vs static).
        this.settingsProvider = settingsProvider;

        // EXISTING CACHE — preserved
        this.cache = new Map();
    }

    /**
     * EXISTING PUBLIC ENTRY POINT — PRESERVED
     * Extended via optional parameters.
     */
    renderAvatar({
        entityType,   // 'hero' | 'pet' | 'antagonist'
        entityId,     // 'dexter' | 'breeze' | 'baron'
        emotionKey,   // logical emotion key, e.g. 'NEUTRAL'
        form = null,  // NEW (canon): antagonist form ('default' | 'architect')
        terminalVisual = null // NEW (canon): e.g. 'DEFEATED'
    }) {
        // Terminal visuals bypass emotion resolution entirely
        if (terminalVisual) {
            return this._renderTerminalVisual({
                entityType,
                entityId,
                form,
                terminalVisual
            });
        }

        return this._renderEmotion({
            entityType,
            entityId,
            emotionKey,
            form
        });
    }

    // ---------------------------------------------------------------------
    // EXISTING EMOTION RENDERING — EXTENDED (NOT REPLACED)
    // ---------------------------------------------------------------------

    _renderEmotion({ entityType, entityId, emotionKey, form }) {
        const format = this._resolveMediaFormat();
        const cacheKey = `${entityType}:${entityId}:${form || 'none'}:${emotionKey}:${format}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const path = this._buildEmotionPath({
            entityType,
            entityId,
            emotionKey,
            form,
            format
        });

        const media = this._createMediaElement(path, format);
        this.cache.set(cacheKey, media);

        return media;
    }

    // ---------------------------------------------------------------------
    // NEW: TERMINAL VISUAL (NON-EMOTIONAL)
    // ---------------------------------------------------------------------

    _renderTerminalVisual({ entityType, entityId, form, terminalVisual }) {
        const format = this._resolveMediaFormat();
        const cacheKey = `${entityType}:${entityId}:${form || 'none'}:TERMINAL:${terminalVisual}:${format}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const path = this._buildTerminalPath({
            entityType,
            entityId,
            form,
            terminalVisual,
            format
        });

        const media = this._createMediaElement(path, format);
        this.cache.set(cacheKey, media);

        return media;
    }

    // ---------------------------------------------------------------------
    // PATH BUILDING
    // ---------------------------------------------------------------------

    /**
     * Builds path for emotion-based avatar.
     * Supports emotion folders with visual variations.
     */
    _buildEmotionPath({ entityType, entityId, emotionKey, form, format }) {
        const basePath = this._basePath(entityType, entityId, form);

        // Canon: emotionKey is logical, folder contains variations
        const emotionFolder = emotionKey.toLowerCase();

        return `${basePath}/${emotionFolder}/${this._pickVariation(basePath, emotionFolder)}.${format}`;
    }

    /**
     * Builds path for terminal visual (e.g. DEFEATED).
     * Terminal visuals are NOT emotions and live in their own folder.
     */
    _buildTerminalPath({ entityType, entityId, form, terminalVisual, format }) {
        const basePath = this._basePath(entityType, entityId, form);
        const folder = terminalVisual.toLowerCase();

        return `${basePath}/${folder}/${folder}.${format}`;
    }

    /**
     * EXISTING BASE PATH LOGIC — EXTENDED FOR ANTAGONIST FORMS
     */
    _basePath(entityType, entityId, form) {
        if (entityType === 'antagonist') {
            // NEW (canon): antagonist form folder
            const resolvedForm = form || 'default';
            return `/assets/avatars/antagonist/${entityId}/${resolvedForm}`;
        }

        // Hero / Pet — unchanged
        return `/assets/avatars/${entityType}/${entityId}`;
    }

    // ---------------------------------------------------------------------
    // MEDIA CREATION — PRESERVED
    // ---------------------------------------------------------------------

    _createMediaElement(path, format) {
        if (format === 'mp4') {
            const video = document.createElement('video');
            video.src = path;
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            return video;
        }

        const img = document.createElement('img');
        img.src = path;
        return img;
    }

    // ---------------------------------------------------------------------
    // FORMAT RESOLUTION — PRESERVED
    // ---------------------------------------------------------------------

    _resolveMediaFormat() {
        // Assumes existing setting:
        // true = video, false = static
        return this.settingsProvider.useVideoAvatars() ? 'mp4' : 'png';
    }

    // ---------------------------------------------------------------------
    // NEW: VARIATION PICKER (SAFE DEFAULT)
    // ---------------------------------------------------------------------

    /**
     * Picks a visual variation inside an emotion folder.
     * For now uses a deterministic fallback (first asset).
     * Can be extended later (random, context-based) without API changes.
     */
    _pickVariation(basePath, emotionFolder) {
        // IMPORTANT:
        // We intentionally do NOT scan the filesystem here.
        // This preserves deterministic behavior and avoids async logic.

        // Canonical fallback:
        // use the emotion name itself as the default variation
        return emotionFolder;
    }
}
