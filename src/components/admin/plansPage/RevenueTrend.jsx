import { memo } from "react";
import { ChartColumn } from "lucide-react";
import { formatINR, monthShort } from "./money";

// Revenue received per month (net of refunds) for the last few months. Plain
// CSS bars — no chart library needed for six numbers.
const RevenueTrend = memo(function RevenueTrend({ loading, months }) {
  const max = Math.max(1, ...months.map((m) => m.revenue));
  const total = months.reduce((sum, m) => sum + m.revenue, 0);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "16px 18px",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text)",
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <ChartColumn size={15} aria-hidden="true" /> Revenue by month
      </div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 14 }}>
        Money received, net of refunds · {formatINR(total)} over {months.length || 6} months
      </div>

      <div
        role="img"
        aria-label="Revenue received per month"
        style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140, opacity: loading ? 0.4 : 1 }}
      >
        {months.map((m) => (
          <div
            key={m.month}
            title={`${m.month}: ${formatINR(m.revenue)} from ${m.payments} payment${m.payments === 1 ? "" : "s"}`}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", minWidth: 0 }}
          >
            <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4, whiteSpace: "nowrap" }}>
              {m.revenue > 0 ? formatINR(m.revenue) : "—"}
            </div>
            <div
              style={{
                width: "100%",
                maxWidth: 38,
                height: `${Math.max((m.revenue / max) * 100, m.revenue > 0 ? 4 : 1)}%`,
                borderRadius: "4px 4px 0 0",
                background: m.revenue > 0 ? "#10B981" : "var(--border)",
                transition: "height 0.3s",
              }}
            />
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>{monthShort(m.month)}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default RevenueTrend;
