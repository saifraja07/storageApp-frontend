export default function StatusBadge({ status }) {
  const map = {
    active:        { bg: "rgba(52,211,153,0.15)",  text: "var(--status-green-text)"  },
    authenticated: { bg: "rgba(56,189,248,0.15)",  text: "var(--status-blue-text)"  },
    pending:       { bg: "rgba(245,158,11,0.15)",  text: "var(--status-amber-text)"  },
    paused:        { bg: "rgba(234,179,8,0.15)",   text: "var(--status-amber-text)"  },
    cancelled:     { bg: "rgba(249,115,22,0.15)",  text: "var(--status-orange-text)"  },
    halted:        { bg: "rgba(239,68,68,0.15)",   text: "var(--status-red-text)"  },
    expired:       { bg: "rgba(239,68,68,0.15)",   text: "var(--status-red-text)"  },
    created:       { bg: "rgba(148,163,184,0.15)", text: "#94A3B8"  },
  };
  const c = map[status] || map.created;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.text, textTransform: "capitalize",
    }}>{status}</span>
  );
}
