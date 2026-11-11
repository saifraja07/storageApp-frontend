import { memo } from "react";
import { Receipt, Inbox } from "lucide-react";
import { SkeletonRow } from "../../SkeletonLoading.jsx";
import StatusBadge from "./StatusBadge";
import { formatINR, fmtDay } from "./money";

// The latest payments received. A payment stays here whatever happened to the
// subscription afterwards — cancelled, expired, even a deleted account.
// Rows wrap instead of scrolling sideways, so it reads the same on a phone.
const RecentPayments = memo(function RecentPayments({ loading, payments }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid var(--border)",
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Receipt size={15} aria-hidden="true" /> Recent Payments
      </div>

      {loading && [...Array(4)].map((_, i) => <SkeletonRow key={i} />)}

      {!loading && payments.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 18px", color: "var(--muted)" }}>
          <div style={{ fontSize: 32, marginBottom: 10, display: "flex", justifyContent: "center" }}>
            <Inbox size={32} aria-hidden="true" />
          </div>
          <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 13 }}>No payments yet</div>
        </div>
      )}

      {!loading && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {payments.map((p) => (
            <li
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "6px 16px",
                padding: "12px 18px",
                borderBottom: "1px solid var(--border)",
                transition: "background 0.1s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ minWidth: 0, flex: "1 1 150px" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  {p.planName} · {p.cycle} · {fmtDay(p.paidAt)}
                </div>
              </div>

              <div style={{ textAlign: "right", flex: "0 0 auto" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{formatINR(p.amount)}</div>
                {p.status !== "captured" && (
                  <div style={{ marginTop: 3 }}>
                    <StatusBadge status={p.status} label={`−${formatINR(p.refundedAmount)} refunded`} />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default RecentPayments;
