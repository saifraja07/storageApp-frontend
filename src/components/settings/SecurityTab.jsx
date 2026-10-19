import Section from "./Section";
import { inputSx } from "../../utils/settingsStyles";

export default function SecurityTab({ hasPassword, pwSuccess, pwError, passwordFields, loading, pwForm, setPwError, setPwSuccess, setPwForm, handlePasswordSubmit, canSubmit, setLogoutAllConfirm, setDisableAccountConfirm, setDeleteAccountConfirm }) {
  return (
    <>
            <Section
              title={
                hasPassword
                  ? "Change Password"
                  : "Set Password"
              }
            >
              {pwSuccess && (
                <div
                  style={{
                    background: "rgba(52,211,153,0.1)",
                    border:
                      "1px solid rgba(52,211,153,0.25)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "var(--status-green-text)",
                    marginBottom: 16,
                  }}
                >
                  {pwSuccess}
                </div>
              )}

              {pwError && (
                <div
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border:
                      "1px solid rgba(239,68,68,0.25)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "var(--status-red-text)",
                    marginBottom: 16,
                  }}
                >
                  {pwError}
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gap: 14,
                }}
              >
                {passwordFields.map(([label, key, ph]) => (
                  <div key={key}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--muted)",
                        marginBottom: 6,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {label}
                    </label>

                    <input
                      type="password"
                      placeholder={ph}
                      disabled={loading}
                      value={pwForm[key]}
                      onChange={(e) => {
                        setPwError("");
                        setPwSuccess("");

                        setPwForm((p) => ({
                          ...p,
                          [key]: e.target.value,
                        }));
                      }}
                      style={inputSx()}
                      onFocus={(e) =>
                        (e.target.style.borderColor =
                          "var(--primary)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor =
                          "var(--border)")
                      }
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handlePasswordSubmit}
                style={{
                  marginTop: 16,
                  padding: "10px 20px",
                  background:
                    !canSubmit || loading
                      ? "var(--surface-tint-strong)"
                      : "var(--primary)",
                  color:
                    !canSubmit || loading
                      ? "var(--muted)"
                      : "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor:
                    !canSubmit || loading
                      ? "not-allowed"
                      : "pointer",
                  fontFamily: "Inter,sans-serif",
                }}
                disabled={!canSubmit || loading}
                onMouseOver={(e) => {
                  if (!canSubmit || loading) return;

                  e.currentTarget.style.background =
                    "var(--primary-hover)";
                }}
                onMouseOut={(e) => {
                  if (!canSubmit || loading) return;

                  e.currentTarget.style.background =
                    "var(--primary)";
                }}
              >
                {loading
                  ? "Saving..."
                  : hasPassword
                    ? "Change Password"
                    : "Set Password"}
              </button>
            </Section>

            <Section title="Sessions">
              <p
                style={{
                  fontSize: 14,
                  color: "var(--muted)",
                  marginBottom: 16,
                  lineHeight: 1.6,
                }}
              >
                Sign out of all devices where you're currently
                logged in. You'll need to sign in again on each
                device.
              </p>

              <button
                onClick={() => setLogoutAllConfirm(true)}
                style={{
                  padding: "10px 20px",
                  background: "rgba(239,68,68,0.12)",
                  border:
                    "1px solid rgba(239,68,68,0.25)",
                  color: "var(--status-red-text-strong)",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "Inter,sans-serif",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(239,68,68,0.2)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(239,68,68,0.12)")
                }
              >
                Sign Out All Devices
              </button>
            </Section>

            <Section title="Deactivate Account">
              <p
                style={{
                  fontSize: 14,
                  color: "var(--muted)",
                  marginBottom: 16,
                  lineHeight: 1.6,
                }}
              >
                Your account will be deactivated and you won't be
                able to sign in until it is restored. Your files
                and data will be preserved.
              </p>

              <button
                onClick={() =>
                  setDisableAccountConfirm(true)
                }
                style={{
                  padding: "10px 20px",
                  background: "rgba(245,158,11,0.12)",
                  border:
                    "1px solid rgba(245,158,11,0.25)",
                  color: "var(--status-amber-text)",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "Inter,sans-serif",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(245,158,11,0.2)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(245,158,11,0.12)")
                }
              >
                Deactivate Account
              </button>
            </Section>

            <Section title="Delete Account">
              <p
                style={{
                  fontSize: 14,
                  color: "var(--muted)",
                  marginBottom: 16,
                  lineHeight: 1.6,
                }}
              >
                Permanently delete your account and all
                associated files, folders, and data. This action
                cannot be undone.
              </p>

              <button
                onClick={() =>
                  setDeleteAccountConfirm(true)
                }
                style={{
                  padding: "10px 20px",
                  background: "rgba(239,68,68,0.12)",
                  border:
                    "1px solid rgba(239,68,68,0.25)",
                  color: "var(--status-red-text-strong)",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "Inter,sans-serif",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(239,68,68,0.2)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(239,68,68,0.12)")
                }
              >
                Delete Account Permanently
              </button>
            </Section>
    </>
  );
}
