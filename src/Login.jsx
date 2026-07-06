import { useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginUser } from "./api/userApi";
import { UserContext } from "./context/UserContext";
import GoogleAuthButton from "./components/GoogleAuthButton";

const spinnerStyle = {
  width: 16,
  height: 16,
  border: "2px solid rgba(255,255,255,0.35)",
  borderTopColor: "#fff",
  borderRadius: "50%",
  animation: "spin 0.7s linear infinite",
  display: "inline-block",
  flexShrink: 0,
};

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [serverError, setServerError] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { refreshUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    new URLSearchParams(location.search).get("redirect") || "/directory";

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (serverError) setServerError("");
    if (googleError) setGoogleError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setServerError("Please enter a valid email address.");
      return;
    }
    if (formData.password.length < 4) {
      setServerError("Password must be at least 4 characters.");
      return;
    }
    setIsLoading(true);
    try {
      await loginUser({...formData, email: trimmedEmail});
      await refreshUser();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.error || "Invalid email or password!");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = (hasErr) => ({
    width: "100%",
    padding: "11px 14px",
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${hasErr ? "#EF4444" : "var(--border)"}`,
    borderRadius: 8,
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.15s",
    fontFamily: "Inter, sans-serif",
  });

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--muted)",
    marginBottom: 6,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 32,
          textDecoration: "none",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            background: "var(--primary)",
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          ☁️
        </div>
        <span style={{ fontWeight: 700, fontSize: 18, color: "var(--text)" }}>
          Cloud Storage
        </span>
      </Link>

      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "36px 32px",
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 6,
            color: "var(--text)",
          }}
        >
          Welcome back
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 28 }}>
          Sign in to your Haadi Cloud account
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
          <div>
            <label style={labelStyle}>Email address</label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your Email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle(!!serverError)}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e) =>
                (e.target.style.borderColor = serverError
                  ? "#EF4444"
                  : "var(--border)")
              }
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle(!!serverError)}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e) =>
                (e.target.style.borderColor = serverError
                  ? "#EF4444"
                  : "var(--border)")
              }
            />
          </div>
          {serverError && (
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                color: "#FCA5A5",
              }}
            >
              {serverError}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: 12,
              background: isLoading ? "rgba(59,130,246,0.6)" : "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: 9,
              fontSize: 15,
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "Inter, sans-serif",
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 0.15s",
            }}
            onMouseOver={(e) =>
              !isLoading &&
              (e.currentTarget.style.background = "var(--primary-hover)")
            }
            onMouseOut={(e) =>
              !isLoading &&
              (e.currentTarget.style.background = "var(--primary)")
            }
          >
            {isLoading && <span style={spinnerStyle} />}
            {isLoading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "22px 0",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            or continue with
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* Google button wrapper — always full width, loading state overlays the real button */}
        <GoogleAuthButton
          onSuccess={async () => {
            await refreshUser();
            navigate(redirectTo, { replace: true });
          }}
          onError={(msg) => setGoogleError(msg)}
        />

        {googleError && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              color: "#FCA5A5",
              marginTop: 12,
            }}
          >
            {googleError}
          </div>
        )}

        {/* ── "By continuing…" legal line ──────────────────────────────── */}
        <p
          style={{
            marginTop: "14px",
            fontSize: "12.5px",
            textAlign: "center",
            color: "#6b7280",
            lineHeight: "1.55",
            maxWidth: "100%",
          }}
        >
          By continuing, you agree to our{" "}
          <Link
            to="/terms"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Terms of Service
          </Link>
          . and acknowledge that you have read our{" "}
          <br className="desktop-only" />
          <Link
            to="/privacy"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Privacy Policy
          </Link>
          .
        </p>

        <p
          style={{
            textAlign: "center",
            fontSize: 14,
            color: "var(--muted)",
            marginTop: 24,
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "var(--primary)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
