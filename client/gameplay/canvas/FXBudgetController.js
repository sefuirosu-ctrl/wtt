// client/gameplay/canvas/FXBudgetController.js
// Shim layer: guarantees named export FXBudgetController

import FXBudgetControllerDefault from "./fx/FXBudgetController.js";

// Named export (what renderer expects)
export const FXBudgetController = FXBudgetControllerDefault;

// Default export (keeps compatibility)
export default FXBudgetControllerDefault;

// Forward any additional named exports (safe)
export * from "./fx/FXBudgetController.js";
