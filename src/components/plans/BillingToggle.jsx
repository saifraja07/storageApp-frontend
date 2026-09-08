export default function BillingToggle({ mode, onModeChange }) {
  return (
        <div style={{
          display: "inline-flex", gap: 4, marginBottom: 24,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 10, padding: 4,
        }}>
          {["monthly", "yearly"].map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              style={{
                padding: "7px 18px", borderRadius: 7, border: "none",
                fontSize: 13, fontWeight: 600, fontFamily: "Inter,sans-serif",
                background: mode === m ? "var(--primary)" : "transparent",
                color: mode === m ? "#fff" : "var(--muted)",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {m === "yearly" ? (
                <span>Yearly <span style={{ fontSize: 10, color: mode === "yearly" ? "rgba(255,255,255,0.7)" : "var(--primary)", marginLeft: 4 }}>(2 months off)</span></span>
              ) : "Monthly"}
            </button>
          ))}
        </div>
  );
}
