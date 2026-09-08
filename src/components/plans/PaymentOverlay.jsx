export default function PaymentOverlay({ phase }) {
  const messages = {
    creating: "Creating your subscription…",
    verifying: "Verifying your payment…",
    activating: "Activating your storage — please don't close this page.",
  };
  return (
    <div role="status" style={{
      position: "fixed", inset: 0, zIndex: 99,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(11,18,32,0.85)", backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "32px 40px", maxWidth: 360,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        boxShadow: "0 20px 60px var(--shadow-color)",
      }}>
        <div style={{
          width: 40, height: 40,
          border: "3px solid rgba(59,130,246,0.25)", borderTopColor: "#3B82F6",
          borderRadius: "50%", animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ fontSize: 14, color: "var(--text)", textAlign: "center", fontWeight: 500, lineHeight: 1.5 }}>
          {messages[phase]}
        </p>
      </div>
    </div>
  );
}
