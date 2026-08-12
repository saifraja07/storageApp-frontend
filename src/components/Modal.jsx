// ── Shared base modal ─────────────────────────────────────────────────────────
export default function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
        zIndex: 300, display: "flex", alignItems: "center",
        justifyContent: "center", padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "var(--surface-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "26px 28px",
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 24px 64px var(--shadow-color)",
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: 20,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", color: "var(--muted)",
              cursor: "pointer", fontSize: 22, lineHeight: 1, padding: 0,
            }}
          >×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
