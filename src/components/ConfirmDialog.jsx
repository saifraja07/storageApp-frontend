export default function ConfirmDialog({
  open,
  icon,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmDanger = false,
  alertOnly = false,
  onConfirm,
  onCancel,
  children,          // optional extra content (e.g. soft/hard delete buttons)
}) {
  if (!open) return null;

  const confirmBg = confirmDanger
    ? { normal: "#DC2626", hover: "#B91C1C" }
    : { normal: "var(--primary)", hover: "var(--primary-hover, #2563EB)" };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onCancel?.()}
      style={{
        position: "fixed", inset: 0, zIndex: 400,
        background: "rgba(0,0,0,0.65)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        animation: "cdFadeIn 0.15s ease",
      }}
    >
      <div
        style={{
          background: "#1a2433",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "28px 28px 24px",
          width: "100%", maxWidth: 400,
          boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
          animation: "cdSlideUp 0.18s ease",
        }}
      >
        {/* Icon */}
        {icon && (
          <div style={{ fontSize: 36, marginBottom: 14, textAlign: "center", display: "flex", justifyContent: "center" }}>
            {icon}
          </div>
        )}

        {/* Title */}
        <h3 style={{
          fontSize: 16, fontWeight: 700, color: "var(--text)",
          marginBottom: message ? 10 : 20,
          textAlign: icon ? "center" : "left",
        }}>
          {title}
        </h3>

        {/* Message */}
        {message && (
          <p style={{
            fontSize: 14, color: "var(--muted)", lineHeight: 1.65,
            marginBottom: 22, textAlign: icon ? "center" : "left",
          }}>
            {message}
          </p>
        )}

        {/* Custom children slot */}
        {children}

        {/* Buttons */}
        {!children && (
          <div style={{ display: "flex", gap: 10 }}>
            {!alertOnly && (
              <button
                onClick={onCancel}
                style={{
                  flex: 1, padding: "10px 0",
                  background: "var(--surface-hover)",
                  border: "1px solid var(--border)",
                  borderRadius: 9, color: "var(--text)",
                  fontSize: 14, fontWeight: 500,
                  cursor: "pointer", fontFamily: "Inter,sans-serif",
                  transition: "background 0.12s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
              >
                {cancelLabel}
              </button>
            )}
            <button
              onClick={onConfirm}
              style={{
                flex: 1, padding: "10px 0",
                background: confirmBg.normal,
                border: "none", borderRadius: 9,
                color: "#fff", fontSize: 14, fontWeight: 600,
                cursor: "pointer", fontFamily: "Inter,sans-serif",
                transition: "background 0.12s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = confirmBg.hover)}
              onMouseOut={(e) => (e.currentTarget.style.background = confirmBg.normal)}
            >
              {confirmLabel}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes cdFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cdSlideUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}
