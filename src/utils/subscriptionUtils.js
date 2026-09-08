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

export { fmtDate, fmtAmount };
