// BaronSpriteStage.js
// RESPONSIBILITY:
// Controls the animated sprite of the antagonist (Black Baron) in the lower stage.
//
// This file has been EXTENDED (not rewritten) to support:
// - Antagonist forms (default / architect)
// - Explicit form entry handling (REVEALED)
// - Terminal destruction sequence synchronization with DEFEATED avatar
//
// All existing sprite logic is preserved.

export default class BaronSpriteStage {
    constructor({ stageRoot, gameFlow, animationSystem }) {
        this.stageRoot = stageRoot;
        this.gameFlow = gameFlow;
        this.animationSystem = animationSystem;

        // EXISTING STATE — PRESERVED
        this.currentForm = 'default';
        this.currentAnimation = 'idle';

        // NEW (canon): terminal lock
        this.isDestroyed = false;

        // EXISTING: sprite container
        this.spriteContainer = this.stageRoot.querySelector('.baron-sprite');

        this._bindGameFlow();
        this._bindAnimationEvents();

        this._renderInitialSprite();
    }

    // ---------------------------------------------------------------------
    // GAME FLOW BINDINGS — EXTENDED
    // ---------------------------------------------------------------------

    _bindGameFlow() {
        // EXISTING behavior (preserved)
        this.gameFlow.on('ANTAGONIST_FORM_CHANGED', (form) => {
            if (this.isDestroyed) return;

            this.currentForm = form;

            // Reset animation state on form change
            this._playAnimation('idle');
        });

        // NEW (canon): explicit form entry moment
        this.gameFlow.on('ANTAGONIST_FORM_REVEALED', () => {
            if (this.isDestroyed) return;

            this._playAnimation('form_reveal');
        });

        // NEW (canon): final defeat of antagonist
        this.gameFlow.on('ANTAGONIST_DEFEATED', () => {
            this._playDestructionSequence();
        });
    }

    // ---------------------------------------------------------------------
    // ANIMATION EVENTS — PRESERVED
    // ---------------------------------------------------------------------

    _bindAnimationEvents() {
        // Existing animation callbacks remain unchanged
        this.animationSystem.on('ANIMATION_COMPLETE', (animKey) => {
            if (this.isDestroyed) return;

            // Return to idle after non-terminal animations
            if (animKey !== 'idle') {
                this._playAnimation('idle');
            }
        });
    }

    // ---------------------------------------------------------------------
    // RENDERING
    // ---------------------------------------------------------------------

    _renderInitialSprite() {
        if (!this.spriteContainer) return;

        this.spriteContainer.innerHTML = '';
        this._playAnimation('idle');
    }

    // ---------------------------------------------------------------------
    // ANIMATION CONTROL — PRESERVED + EXTENDED
    // ---------------------------------------------------------------------

    _playAnimation(animationKey) {
        if (!this.spriteContainer || this.isDestroyed) return;

        this.currentAnimation = animationKey;

        // EXISTING animation system call (preserved)
        this.animationSystem.play({
            target: this.spriteContainer,
            entityType: 'antagonist',
            entityId: 'baron',
            form: this.currentForm, // NEW (canon): pass form
            animation: animationKey
        });
    }

    // ---------------------------------------------------------------------
    // NEW (canon): TERMINAL DESTRUCTION SEQUENCE
    // ---------------------------------------------------------------------

    _playDestructionSequence() {
        if (!this.spriteContainer || this.isDestroyed) return;

        this.isDestroyed = true;

        // Stop any running animations
        this.animationSystem.stop(this.spriteContainer);

        // Play final destruction animation for current form
        this.animationSystem.play({
            target: this.spriteContainer,
            entityType: 'antagonist',
            entityId: 'baron',
            form: this.currentForm,
            animation: 'destroy'
        });

        // After destruction, no further animations are allowed
    }

    // ---------------------------------------------------------------------
    // EXISTING PUBLIC API — PRESERVED
    // ---------------------------------------------------------------------

    setVisible(isVisible) {
        if (!this.stageRoot) return;
        this.stageRoot.style.display = isVisible ? 'block' : 'none';
    }
}
