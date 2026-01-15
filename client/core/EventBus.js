// client/core/EventBus.js

/**
 * EventBus
 * ----------------------------------------------------
 * Minimal, deterministic event bus.
 *
 * Canon intent:
 * - Centralized event dispatch
 * - Systems publish gameplay events; UI/visual layers consume
 * - No arbitrary code evaluation
 */

export class EventBus {
    constructor() {
        /** @type {Map<string, Set<Function>>} */
        this._listeners = new Map();
    }

    /**
     * Subscribe.
     * @param {string} eventName
     * @param {(payload:any)=>void} handler
     * @returns {() => void} unsubscribe
     */
    on(eventName, handler) {
        if (!eventName || typeof handler !== 'function') {
            console.warn('[EventBus] Invalid subscription', eventName, handler);
            return () => {};
        }

        const set = this._listeners.get(eventName) ?? new Set();
        set.add(handler);
        this._listeners.set(eventName, set);

        return () => this.off(eventName, handler);
    }

    /**
     * Unsubscribe.
     * @param {string} eventName
     * @param {(payload:any)=>void} handler
     */
    off(eventName, handler) {
        const set = this._listeners.get(eventName);
        if (!set) return;
        set.delete(handler);
        if (set.size === 0) this._listeners.delete(eventName);
    }

    /**
     * Emit.
     * @param {string} eventName
     * @param {any} payload
     */
    emit(eventName, payload = undefined) {
        const set = this._listeners.get(eventName);
        if (!set || set.size === 0) return;

        // Deterministic iteration order.
        for (const handler of Array.from(set)) {
            try {
                handler(payload);
            } catch (err) {
                console.error(`[EventBus] Listener error for ${eventName}`, err);
            }
        }
    }

    /**
     * Debug helper.
     */
    getListenerCount(eventName) {
        return this._listeners.get(eventName)?.size ?? 0;
    }
}
