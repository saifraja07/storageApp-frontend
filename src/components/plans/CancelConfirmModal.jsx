import { TriangleAlert, Package, Lock, Calendar, Banknote } from "lucide-react";

export default function CancelConfirmModal({ endDate, onConfirm, onClose, loading }) {
  const consequences = [
    { icon: Package, text: `Storage drops to 500 MB (Free tier) at end of billing period.` },
    { icon: Lock, text: "Files exceeding free tier limit will become inaccessible (deleted)." },
    { icon: Calendar, text: `Premium access continues until your billing period ends${endDate ? ` (${endDate})` : ""}.` },
    { icon: Banknote, text: "No refund for the current billing period — you keep access until it ends." },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--surface-elevated)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 18, padding: "28px 24px", maxWidth: 440, width: "100%",
          boxShadow: "0 32px 80px var(--shadow-color)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
            <TriangleAlert size={22} aria-hidden="true" />
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--status-red-text)", marginBottom: 4 }}>Cancel Subscription?</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
              Before you proceed, here's what happens when you cancel your current plan:
            </p>
          </div>
        </div>

        {/* Consequences list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {consequences.map((c, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              background: "var(--surface-tint)", border: "1px solid var(--surface-tint-strong)",
              borderRadius: 10, padding: "10px 12px",
            }}>
              <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1, display: "flex" }}>
                <c.icon size={16} aria-hidden="true" />
              </span>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{c.text}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1, padding: "11px 16px", borderRadius: 10, fontSize: 14, fontWeight: 600,
              background: "var(--surface-tint-strong)", border: "1px solid var(--border)",
              color: "var(--text)", cursor: "pointer",
            }}
          >Keep My Plan</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, padding: "11px 16px", borderRadius: 10, fontSize: 14, fontWeight: 600,
              background: loading ? "rgba(239,68,68,0.4)" : "rgba(239,68,68,0.85)",
              border: "1px solid rgba(239,68,68,0.5)",
              color: "#fff", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Cancelling…
              </>
            ) : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
