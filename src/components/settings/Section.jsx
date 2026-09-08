export default function Section({ title, children }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        marginBottom: 20,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
          {title}
        </h3>
      </div>

      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  );
}
