// public/js/debug.js
// Debug utilities (ES module)

export function initDebug() {
  console.log('[DEBUG] Debug system initialized');

  window.__WOT_DEBUG__ = {
    ping() {
      console.log('[DEBUG] pong');
    }
  };
}
