import { memo } from "react";

// Colors for every status the Subscription model can have
// (see SUBSCRIPTION_STATUSES in backend/models/subscriptionModel.js)
const STATUS_STYLES = {
  active:        { bg: "rgba(16,185,129,0.15)",  text: "var(--status-green-text)", border: "rgba(16,185,129,0.3)" },
  authenticated: { bg: "rgba(59,130,246,0.15)",   text: "var(--status-blue-text)", border: "rgba(59,130,246,0.3)" },
  pending:       { bg: "rgba(245,158,11,0.15)",   text: "var(--status-amber-text)", border: "rgba(245,158,11,0.3)" },
  paused:        { bg: "rgba(245,158,11,0.15)",   text: "var(--status-amber-text)", border: "rgba(245,158,11,0.3)" },
  cancelled:     { bg: "rgba(239,68,68,0.15)",    text: "var(--status-red-text-strong)", border: "rgba(239,68,68,0.3)" },
  halted:        { bg: "rgba(239,68,68,0.15)",    text: "var(--status-red-text-strong)", border: "rgba(239,68,68,0.3)" },
  expired:       { bg: "rgba(239,68,68,0.15)",    text: "var(--status-red-text-strong)", border: "rgba(239,68,68,0.3)" },
  completed:     { bg: "var(--surface-tint-strong)",  text: "var(--muted)", border: "var(--border)" },
  created:       { bg: "var(--surface-tint-strong)",  text: "var(--muted)", border: "var(--border)" },
};

const StatusBadge = memo(function StatusBadge({ status }) {
  const c = STATUS_STYLES[status] || STATUS_STYLES.created;
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
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
});

export default StatusBadge;
