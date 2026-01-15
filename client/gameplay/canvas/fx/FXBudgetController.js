// client/gameplay/canvas/fx/FXBudgetController.js
// FX budget controller (limits concurrent FX load)

import FXPriority from "./FXPriority.js";

class FXBudgetController {
  constructor({
    maxActiveFX = 12,
    softLimit = 8
  } = {}) {
    this.maxActiveFX = maxActiveFX;
    this.softLimit = softLimit;
    this.activeFX = [];
  }

  /**
   * Try to register FX instance
   * @param {{ priority:number, id?:string }} fx
   * @returns {boolean} accepted
   */
  tryRegister(fx) {
    if (!fx || typeof fx.priority !== "number") return false;

    fx.priority = FXPriority.clamp(fx.priority);

    // Under soft limit → always accept
    if (this.activeFX.length < this.softLimit) {
      this.activeFX.push(fx);
      return true;
    }

    // Hard cap reached → reject low priority
    if (this.activeFX.length >= this.maxActiveFX) {
      const lowest = this._findLowestPriority();
      if (!lowest || lowest.priority >= fx.priority) {
        return false;
      }
      this._remove(lowest);
    }

    this.activeFX.push(fx);
    return true;
  }

  unregister(fx) {
    this._remove(fx);
  }

  clear() {
    this.activeFX.length = 0;
  }

  _findLowestPriority() {
    let lowest = null;
    for (const fx of this.activeFX) {
      if (!lowest || fx.priority < lowest.priority) lowest = fx;
    }
    return lowest;
  }

  _remove(fx) {
    const idx = this.activeFX.indexOf(fx);
    if (idx !== -1) this.activeFX.splice(idx, 1);
  }
}

// IMPORTANT: provide BOTH named + default exports
export { FXBudgetController };
export default FXBudgetController;
