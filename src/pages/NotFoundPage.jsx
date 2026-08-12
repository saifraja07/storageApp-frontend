import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)", color: "var(--text)",
      fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24,
    }}>
      <div style={{ fontSize: 72, marginBottom: 24, opacity: 0.8 }}>☁️</div>
      <div style={{ fontSize: "clamp(64px,12vw,120px)", fontWeight: 800, color: "var(--surface-tint-strong)", lineHeight: 1, marginBottom: -20, letterSpacing: -4 }}>404</div>
      <h1 style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 700, marginBottom: 16, letterSpacing: "-0.5px" }}>Page Not Found</h1>
      <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: 36, maxWidth: 400, lineHeight: 1.7 }}>
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link to="/" style={{
          background: "var(--primary)", color: "#fff", textDecoration: "none",
          padding: "12px 24px", borderRadius: 9, fontSize: 14, fontWeight: 600,
        }}>Return Home</Link>
        <Link to="/directory" style={{
          background: "var(--surface)", color: "var(--text)", textDecoration: "none",
          padding: "12px 24px", borderRadius: 9, fontSize: 14, fontWeight: 600,
          border: "1px solid var(--border)",
        }}>Go to My Drive</Link>
      </div>
    </div>
  );
}
