import { memo } from "react";

// Colors for every status the Subscription model can have
// (see SUBSCRIPTION_STATUSES in backend/models/subscriptionModel.js)
const STATUS_STYLES = {
  active:        { bg: "rgba(16,185,129,0.15)",  text: "#34D399", border: "rgba(16,185,129,0.3)" },
  authenticated: { bg: "rgba(59,130,246,0.15)",   text: "#93C5FD", border: "rgba(59,130,246,0.3)" },
  pending:       { bg: "rgba(245,158,11,0.15)",   text: "#FCD34D", border: "rgba(245,158,11,0.3)" },
  paused:        { bg: "rgba(245,158,11,0.15)",   text: "#FCD34D", border: "rgba(245,158,11,0.3)" },
  cancelled:     { bg: "rgba(239,68,68,0.15)",    text: "#F87171", border: "rgba(239,68,68,0.3)" },
  halted:        { bg: "rgba(239,68,68,0.15)",    text: "#F87171", border: "rgba(239,68,68,0.3)" },
  expired:       { bg: "rgba(239,68,68,0.15)",    text: "#F87171", border: "rgba(239,68,68,0.3)" },
  completed:     { bg: "rgba(255,255,255,0.07)",  text: "var(--muted)", border: "var(--border)" },
  created:       { bg: "rgba(255,255,255,0.07)",  text: "var(--muted)", border: "var(--border)" },
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
