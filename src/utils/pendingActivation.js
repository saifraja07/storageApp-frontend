// ─── "Paid, waiting for activation" memory ────────────────────────────────────
// After a successful payment our webhook can take a while to activate the plan, and
// the API deliberately hides unfinished checkouts. Without this, a user who reloads
// right after paying would see the Free plan. We remember the payment on this device
// and show an "Activating…" state until the real subscription shows up.

const PENDING_KEY = "pendingActivation";

export const PENDING_TTL = 15 * 60 * 1000; // stop waiting (and showing it) after 15 minutes
export const PENDING_POLL_MS = 6000;

// Subscription statuses that mean "this checkout has settled one way or another"
export const TERMINAL_STATUSES = new Set(["active", "pending", "paused", "cancelled", "halted", "expired"]);

export function readPending(userId) {
  try {
    const p = JSON.parse(localStorage.getItem(PENDING_KEY));
    if (!p || p.userId !== userId) return null; // never leak across accounts on a shared device
    if (Date.now() - p.at > PENDING_TTL) {
      localStorage.removeItem(PENDING_KEY);
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

export function writePending(record) {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(record)); } catch { /* storage unavailable */ }
}

export function removePending() {
  try { localStorage.removeItem(PENDING_KEY); } catch { /* storage unavailable */ }
}
