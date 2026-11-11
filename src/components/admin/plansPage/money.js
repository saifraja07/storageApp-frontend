// ₹ formatting for the admin revenue UI. Whole rupees stay whole ("₹1,599");
// fractional amounts (MRR from yearly plans, refunds) get two decimals.
export function formatINR(amount) {
  const n = Number(amount || 0);
  const whole = Number.isInteger(n);
  return `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  })}`;
}

// "2026-11" → "Nov"
export function monthShort(key) {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-IN", {
    month: "short",
    timeZone: "UTC",
  });
}

// "10 Nov 2026" — a date without the time-of-day noise.
export function fmtDay(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
