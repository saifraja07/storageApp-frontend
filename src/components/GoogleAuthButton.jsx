import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { axiosWithCreds } from "../api/axiosInstances";
import { getErr } from "../utils/directoryUtils";

// ─── SVG Google "G" logo ────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="20"
    height="20"
    style={{ flexShrink: 0 }}
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.14 0 5.95 1.08 8.17 2.84l6.08-6.08C34.46 3.1 29.53 1 24 1 14.87 1 7.1 6.47 3.44 14.18l7.07 5.5C12.27 13.32 17.66 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.52 24.52c0-1.64-.15-3.22-.42-4.74H24v8.97h12.68c-.55 2.94-2.2 5.44-4.68 7.12l7.17 5.57C43.38 37.57 46.52 31.47 46.52 24.52z"
    />
    <path
      fill="#FBBC05"
      d="M10.51 28.68A14.57 14.57 0 0 1 9.5 24c0-1.63.28-3.21.78-4.68l-7.07-5.5A23.94 23.94 0 0 0 0 24c0 3.87.93 7.52 2.56 10.73l7.95-6.05z"
    />
    <path
      fill="#34A853"
      d="M24 47c5.53 0 10.17-1.84 13.56-4.99l-7.17-5.57c-1.88 1.26-4.28 2.01-6.39 2.01-6.34 0-11.73-3.82-13.49-9.18l-7.95 6.05C7.1 41.53 14.87 47 24 47z"
    />
    <path fill="none" d="M0 0h48v48H0z" />
  </svg>
);

// ─── Spinner for loading state ───────────────────────────────────────────────
const Spinner = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0, animation: "spin 0.8s linear infinite" }}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      strokeOpacity="0.25"
    />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

// ─── Main Component ──────────────────────────────────────────────────────────
export default function GoogleAuthButton({
  onSuccess,
  onError,
  label = "Continue with Google",
}) {
  const [isLoading, setIsLoading] = useState(false);

  const login = useGoogleLogin({
    flow: "auth-code", // ← auth_code flow
    onSuccess: async (codeResponse) => {
      try {
        setIsLoading(true);
        const { data } = await axiosWithCreds.post("/auth/google", {
          code: codeResponse.code,
        });

        onSuccess?.(data);
      } catch (err) {
        onError?.(getErr(err) || "Google sign-in failed");
      } finally {
        setIsLoading(false);
      }
    },
    onError: (err) => {
      onError?.(err.error_description || "Google sign-in failed");
      setIsLoading(false);
    },
  });

  const buttonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    padding: "12px 20px",
    fontSize: "15px",
    fontWeight: "500",
    fontFamily: "inherit",
    letterSpacing: "0.01em",
    lineHeight: "1.4",
    background: "var(--surface-tint)",
    border: "1px solid var(--border)",
    borderRadius: 9,
    cursor: isLoading ? "not-allowed" : "pointer",
    opacity: isLoading ? 0.75 : 1,
    transition: "all 0.18s ease",
    outline: "none",
    boxSizing: "border-box",
    maxWidth: "100%",
  };

  const hoverStyle = `
    .google-auth-btn:hover:not(:disabled) {
       background: var(--surface-hover) !important;
    }
      
    .google-auth-btn:focus-visible {
      outline: 2px solid #4285F4;
      outline-offset: 2px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  const labelText = isLoading ? "Signing in..." : label;

  return (
    <>
      <style>{hoverStyle}</style>

      <button
        className="google-auth-btn"
        onClick={() => !isLoading && login()}
        disabled={isLoading}
        aria-label={labelText}
        style={buttonStyle}
      >
        {isLoading ? <Spinner /> : <GoogleIcon />}
        <span style={{ whiteSpace: "nowrap" }}>{labelText}</span>
      </button>
    </>
  );
}
