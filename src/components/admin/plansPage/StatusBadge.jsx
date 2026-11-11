import { memo } from "react";

// What the API calls `displayStatus` (derived server-side from the raw Razorpay
// status + cancellation + dates), plus payment states for the payments table.
// Raw statuses are still understood so older responses keep rendering.
const GREEN = { bg: "rgba(16,185,129,0.15)", text: "var(--status-green-text)", border: "rgba(16,185,129,0.3)" };
const BLUE = { bg: "rgba(59,130,246,0.15)", text: "var(--status-blue-text)", border: "rgba(59,130,246,0.3)" };
const AMBER = { bg: "rgba(245,158,11,0.15)", text: "var(--status-amber-text)", border: "rgba(245,158,11,0.3)" };
const ORANGE = { bg: "rgba(249,115,22,0.15)", text: "var(--status-orange-text)", border: "rgba(249,115,22,0.3)" };
const RED = { bg: "rgba(239,68,68,0.15)", text: "var(--status-red-text-strong)", border: "rgba(239,68,68,0.3)" };
const GREY = { bg: "var(--surface-tint-strong)", text: "var(--muted)", border: "var(--border)" };

const STYLES = {
  // subscription display states
  active: GREEN,
  activating: BLUE,
  cancelling: ORANGE,
  cancelled: GREY,
  past_due: AMBER,
  paused: AMBER,
  halted: RED,
  expired: GREY,
  completed: GREY,
  incomplete: GREY,
  // payment states
  captured: GREEN,
  refunded: AMBER,
  partially_refunded: AMBER,
  // raw statuses (fallback for older API responses)
  authenticated: BLUE,
  pending: AMBER,
  created: GREY,
};

const LABELS = {
  active: "Active",
  activating: "Activating",
  cancelling: "Cancelling",
  cancelled: "Cancelled",
  past_due: "Payment failed",
  paused: "Paused",
  halted: "Ended · payment failed",
  expired: "Expired",
  completed: "Completed",
  incomplete: "Incomplete",
  captured: "Paid",
  refunded: "Refunded",
  partially_refunded: "Part refunded",
  authenticated: "Activating",
  pending: "Payment failed",
  created: "Incomplete",
};

const StatusBadge = memo(function StatusBadge({ status, label }) {
  const c = STYLES[status] || GREY;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.3,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {label ?? LABELS[status] ?? status}
    </span>
  );
});

export default StatusBadge;
