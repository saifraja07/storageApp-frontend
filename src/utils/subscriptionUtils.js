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

export { fmtDate, fmtAmount, fmtMethod, getVisibleSubscription };
