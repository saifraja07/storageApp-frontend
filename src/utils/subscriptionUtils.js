// ─── Subscription formatting helpers ──────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtAmount(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function fmtMethod(method) {
  if (!method) return "—";
  return method.toLowerCase() === "upi" ? "UPI" : method.charAt(0).toUpperCase() + method.slice(1);
}

// The API can return rows that aren't a subscription from the user's point of
// view: an unfinished checkout ("created"), or one cancelled before it was ever
// paid. Those must never reach the UI.
function getVisibleSubscription(subscription) {
  if (!subscription) return null;
  if (subscription.status === "created") return null;
  if (subscription.status === "cancelled" && !subscription.currentEnd) return null;
  return subscription;
}

// Whole days from now until `iso` (0 once it has passed).
function daysUntil(iso) {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

function fmtDaysLeft(days) {
  if (days <= 0) return "Ends today";
  return days === 1 ? "1 day left" : `${days} days left`;
}

export { fmtDate, fmtAmount, fmtMethod, getVisibleSubscription, daysUntil, fmtDaysLeft };
