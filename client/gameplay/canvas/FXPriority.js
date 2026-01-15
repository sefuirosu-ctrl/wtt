// client/gameplay/canvas/FXPriority.js
// Shim layer: guarantees named export FXPriority

import FXPriorityDefault from "./fx/FXPriority.js";

// Named export (what renderer expects)
export const FXPriority = FXPriorityDefault;

// Default export (keeps compatibility)
export default FXPriorityDefault;

// Forward any additional named exports (safe)
export * from "./fx/FXPriority.js";
