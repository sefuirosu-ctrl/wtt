// BaronPanel.js
// RESPONSIBILITY:
// UI panel responsible for displaying the antagonist (Black Baron) 2D avatar,
// name, and emotional feedback.
//
// This file has been EXTENDED (not rewritten) to support:
// - Antagonist forms (default / architect)
// - Form entry state: REVEALED
// - Terminal visual state: DEFEATED (visual-only)
// All existing behavior is preserved.

import AvatarMediaRenderer from './common/AvatarMediaRenderer.js';

export default class BaronPanel {
    constructor({ uiRoot, gameFlow, emotionResolver, settingsProvider }) {
        this.uiRoot = uiRoot;
        this.gameFlow = gameFlow;
        this.emotionResolver = emotionResolver;

        // EXISTING: renderer dependency (path preserved)
        this.avatarRenderer = new AvatarMediaRenderer(settingsProvider);

        // EXISTING STATE — PRESERVED
        this.currentEmotion = 'NEUTRAL';

        // NEW (canon): antagonist form
        this.currentForm = 'default';

        // NEW (canon): terminal visual lock
        this.isTerminal = false;

        // EXISTING: avatar container element
        this.avatarContainer = this.uiRoot.querySelector('.baron-avatar');

        // Bindings
        this._bindGameFlow();
        this._bindEmotionResolver();

        // Initial render
        this._renderCurrentAvatar();
    }

    // ---------------------------------------------------------------------
    // EXISTING GAME FLOW BINDING — EXTENDED
    // ---------------------------------------------------------------------

    _bindGameFlow() {
        // EXISTING behavior (preserved)
        this.gameFlow.on('ANTAGONIST_FORM_CHANGED', (form) => {
            // NEW (canon): update form and reset emotion state
            this.currentForm = form;
            this.currentEmotion = 'NEUTRAL';

            // Reset terminal lock on form change (safety)
            this.isTerminal = false;

            this._renderCurrentAvatar();
        });

        // NEW (canon): terminal victory of player → Baron defeated
        this.gameFlow.on('PLAYER_VICTORY', () => {
            this._showTerminalDefeated();
        });
    }

    // ---------------------------------------------------------------------
    // EXISTING EMOTION RESOLVER BINDING — EXTENDED
    // ---------------------------------------------------------------------

    _bindEmotionResolver() {
        // EXISTING behavior (preserved)
        this.emotionResolver.on('ANTAGONIST_EMOTION', (emotionKey) => {
            // NEW (canon): ignore emotions during terminal state
            if (this.isTerminal) return;

            // Ignore REVEALED here — it is handled explicitly
            if (emotionKey === 'REVEALED') {
                this._showFormRevealed();
                return;
            }

            this.currentEmotion = emotionKey;
            this._renderCurrentAvatar();
        });
    }

    // ---------------------------------------------------------------------
    // RENDERING
    // ---------------------------------------------------------------------

    _renderCurrentAvatar() {
        if (!this.avatarContainer) return;

        // Clear existing avatar
        this.avatarContainer.innerHTML = '';

        const mediaElement = this.avatarRenderer.renderAvatar({
            entityType: 'antagonist',
            entityId: 'baron',
            emotionKey: this.currentEmotion,
            form: this.currentForm
        });

        this.avatarContainer.appendChild(mediaElement);
    }

    // ---------------------------------------------------------------------
    // NEW (canon): FORM ENTRY VISUAL
    // ---------------------------------------------------------------------

    _showFormRevealed() {
        if (!this.avatarContainer) return;

        // REVEALED is a one-time visual state
        this.avatarContainer.innerHTML = '';

        const mediaElement = this.avatarRenderer.renderAvatar({
            entityType: 'antagonist',
            entityId: 'baron',
            form: this.currentForm,
            terminalVisual: 'REVEALED'
        });

        this.avatarContainer.appendChild(mediaElement);
    }

    // ---------------------------------------------------------------------
    // NEW (canon): TERMINAL DEFEATED VISUAL
    // ---------------------------------------------------------------------

    _showTerminalDefeated() {
        if (!this.avatarContainer) return;

        this.isTerminal = true;

        this.avatarContainer.innerHTML = '';

        const mediaElement = this.avatarRenderer.renderAvatar({
            entityType: 'antagonist',
            entityId: 'baron',
            form: this.currentForm,
            terminalVisual: 'DEFEATED'
        });

        this.avatarContainer.appendChild(mediaElement);
    }

    // ---------------------------------------------------------------------
    // EXISTING PUBLIC API — PRESERVED
    // ---------------------------------------------------------------------

    setVisible(isVisible) {
        if (!this.uiRoot) return;
        this.uiRoot.style.display = isVisible ? 'block' : 'none';
    }
}
