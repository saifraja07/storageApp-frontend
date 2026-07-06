import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { sendOtp, verifyOtp } from "./api/authApi";
import { registerUser } from "./api/userApi";
import { UserContext } from "./context/UserContext";
import GoogleAuthButton from "./components/GoogleAuthButton";

const spinnerStyle = {
  width: 15,
  height: 15,
  border: "2px solid rgba(255,255,255,0.35)",
  borderTopColor: "#fff",
  borderRadius: "50%",
  animation: "spin 0.7s linear infinite",
  display: "inline-block",
  flexShrink: 0,
};

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    otp: "",
    password: "",
    general: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [googleError, setGoogleError] = useState("");
  const { refreshUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    new URLSearchParams(location.search).get("redirect") || "/directory";

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (googleError) setGoogleError("");
    if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
        email: "",
        otp: "",
        general: "",
      }));
      setOtpSent(false);
      setOtpVerified(false);
      setCountdown(0);
    } else {
      setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (trimmedEmail) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrors((prev) => ({ ...prev, email: "Please Enter Valid Email" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, email: "" }));
    return true;
  };

  const handleSendOtp = async () => {
    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter your email first.",
      }));
      return;
    } else if (!validateEmail(trimmedEmail)) return;
    try {
      setIsSending(true);
      await sendOtp(trimmedEmail);
      setOtpSent(true);
      setCountdown(60);
      setErrors((prev) => ({ ...prev, email: "", general: "" }));
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        email: err.response?.data?.error || "Failed to send OTP.",
      }));
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{4}$/.test(otp)) {
      setErrors((prev) => ({
        ...prev,
        otp: "Please enter a valid 4-digit code.",
      }));
      return;
    }
    try {
      setIsVerifying(true);
      await verifyOtp(formData.email.trim(), otp);
      setOtpVerified(true);
      setErrors((prev) => ({ ...prev, otp: "", general: "" }));
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        otp: err.response?.data?.error || "Invalid or expired OTP.",
      }));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    const nameError = trimmedName ? "" : "Please enter your name.";
    const otpFieldError = otpVerified
      ? ""
      : "Please verify your email with OTP.";
    const passwordError =
      formData.password.length < 4
        ? "Password must be at least 4 characters."
        : "";

    if (nameError || otpFieldError || passwordError) {
      setErrors((prev) => ({
        ...prev,
        name: nameError,
        otp: otpFieldError,
        password: passwordError,
      }));
      return;
    }

    try {
      setErrors((prev) => ({
        ...prev,
        general: "",
      }));
      setIsSubmitting(true);
      await registerUser({
        ...formData,
        name: trimmedName,
        email: formData.email.trim(),
        otp,
      });
      await refreshUser();
      setIsSuccess(true);
      setTimeout(() => navigate(redirectTo, { replace: true }), 1500);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: err.response?.data?.error || "Something went wrong.",
      }));
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
    fontFamily: "Inter, sans-serif",
  };
  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--muted)",
    marginBottom: 6,
  };

  const isFormDisabled = !otpVerified || isSuccess || isSubmitting;

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
          maxWidth: 440,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "36px 32px",
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          Create your account
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 28 }}>
          Get started with Haadi Cloud for free
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
          <div>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              style={{
                ...inputStyle,
                flex: 1,
                borderColor: errors.name ? "#EF4444" : "var(--border)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e) =>
                (e.target.style.borderColor = errors.name
                  ? "#EF4444"
                  : "var(--border)")
              }
            />
            {errors.name && (
              <p style={{ color: "#FCA5A5", fontSize: 12, marginTop: 4 }}>
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Email address</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                disabled={otpVerified}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  ...inputStyle,
                  flex: 1,
                  borderColor: errors.email ? "#EF4444" : "var(--border)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                onBlur={(e) =>
                  (e.target.style.borderColor = errors.email
                    ? "#EF4444"
                    : "var(--border)")
                }
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={
                  otpVerified ||
                  isSending ||
                  countdown > 0 ||
                  !formData.email.trim()
                }
                style={{
                  padding: "0 14px",
                  background: "var(--surface-hover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: countdown > 0 ? "var(--muted)" : "var(--primary)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor:
                    otpVerified ||
                    isSending ||
                    countdown > 0 ||
                    !formData.email.trim()
                      ? "not-allowed"
                      : "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "Inter, sans-serif",
                  opacity: otpVerified || !formData.email.trim() ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  minWidth: 90,
                  justifyContent: "center",
                }}
              >
                {isSending ? (
                  <>
                    <span
                      style={{
                        ...spinnerStyle,
                        borderTopColor: "var(--primary)",
                        borderColor: "rgba(59,130,246,0.25)",
                      }}
                    />
                    Sending
                  </>
                ) : countdown > 0 ? (
                  `${countdown}s`
                ) : (
                  "Send OTP"
                )}
              </button>
            </div>
            {errors.email && (
              <p style={{ color: "#FCA5A5", fontSize: 12, marginTop: 4 }}>
                {errors.email}
              </p>
            )}
          </div>

          {otpSent && (
            <div>
              <label style={labelStyle}>
                Verification code{" "}
                {otpVerified && (
                  <span style={{ color: "#34D399" }}>Verified</span>
                )}
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  autoComplete="one-time-code"
                  disabled={otpVerified}
                  placeholder="4-digit OTP"
                  value={otp}
                  onChange={(e) => {
                    const digitsOnly = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 4);
                    setErrors((prev) => ({ ...prev, otp: "" }));
                    setOtp(digitsOnly);
                  }}
                  style={{
                    ...inputStyle,
                    flex: 1,
                    letterSpacing: 5,
                    textAlign: "center",
                    fontSize: 16,
                    borderColor: errors.otp ? "#EF4444" : "var(--border)",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--primary)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.otp
                      ? "#EF4444"
                      : "var(--border)")
                  }
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifying || otpVerified}
                  style={{
                    padding: "0 14px",
                    background: otpVerified
                      ? "rgba(52,211,153,0.15)"
                      : "var(--primary)",
                    border: "none",
                    borderRadius: 8,
                    color: otpVerified ? "#34D399" : "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor:
                      isVerifying || otpVerified ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                    fontFamily: "Inter, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    minWidth: 72,
                    justifyContent: "center",
                  }}
                >
                  {isVerifying ? (
                    <>
                      <span style={spinnerStyle} />
                      Verifying
                    </>
                  ) : otpVerified ? (
                    "Verified"
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
              {errors.otp && (
                <p style={{ color: "#FCA5A5", fontSize: 12, marginTop: 4 }}>
                  {errors.otp}
                </p>
              )}
            </div>
          )}

          {!otpSent && errors.otp && (
            <p style={{ color: "#FCA5A5", fontSize: 12, marginTop: 4 }}>
              {errors.otp}
            </p>
          )}

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Choose a strong password"
              value={formData.password}
              onChange={handleChange}
              style={{
                ...inputStyle,
                flex: 1,
                borderColor: errors.password ? "#EF4444" : "var(--border)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e) =>
                (e.target.style.borderColor = errors.password
                  ? "#EF4444"
                  : "var(--border)")
              }
            />
            {errors.password && (
              <p style={{ color: "#FCA5A5", fontSize: 12, marginTop: 4 }}>
                {errors.password}
              </p>
            )}
          </div>

          {errors.general && (
            <p
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                color: "#FCA5A5",
              }}
            >
              {errors.general}
            </p>
          )}

          <button
            type="submit"
            disabled={isFormDisabled}
            style={{
              width: "100%",
              padding: 12,
              background: isSuccess
                ? "#059669"
                : !otpVerified
                  ? "rgba(59,130,246,0.3)"
                  : isSubmitting
                    ? "rgba(59,130,246,0.6)"
                    : "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: 9,
              fontSize: 15,
              fontWeight: 600,
              cursor: isFormDisabled ? "not-allowed" : "pointer",
              opacity: !otpVerified && !isSubmitting ? 0.6 : 1,
              fontFamily: "Inter, sans-serif",
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 0.15s",
            }}
          >
            {isSubmitting && <span style={spinnerStyle} />}
            {isSuccess
              ? "Account Created"
              : isSubmitting
                ? "Processing…"
                : "Create Account"}
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
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "var(--primary)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
