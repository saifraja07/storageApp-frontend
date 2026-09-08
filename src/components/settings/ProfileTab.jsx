import { User } from "lucide-react";
import Section from "./Section";
import { inputSx } from "../../utils/settingsStyles";

export default function ProfileTab({ user, previewUrl, profileFileInputRef, profileSaving, handleProfileImageSelect, profileName, setProfileName, profileError, setProfileError, hasProfileChanges, handleSaveProfile }) {
  return (
          <Section title="Profile Settings">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 24,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: "50%",
                  background: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {previewUrl || user?.picture ? (
                  <img
                    src={previewUrl || user.picture}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <User
                    size={26}
                    color="#fff"
                    aria-hidden="true"
                  />
                )}
              </div>

              <div>
                <input
                  ref={profileFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageSelect}
                  disabled={profileSaving}
                  style={{ display: "none" }}
                />

                <button
                  type="button"
                  onClick={() =>
                    profileFileInputRef.current?.click()
                  }
                  disabled={profileSaving}
                  style={{
                    padding: "8px 16px",
                    background: "var(--surface-tint)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: profileSaving
                      ? "not-allowed"
                      : "pointer",
                    fontFamily: "Inter,sans-serif",
                  }}
                >
                  Change Photo
                </button>

                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginTop: 6,
                  }}
                >
                  Select image · 5MB max.
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: 14,
                marginBottom: 16,
              }}
            >
              <div>
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
                  Full Name
                </label>

                <input
                  type="text"
                  value={profileName}
                  disabled={profileSaving}
                  onChange={(e) => {
                    setProfileName(e.target.value);
                    setProfileError("");
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

              <div>
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
                  Email
                </label>

                <input
                  type="text"
                  value={user?.email || ""}
                  disabled
                  style={{
                    ...inputSx(),
                    opacity: 0.6,
                    cursor: "not-allowed",
                  }}
                />

                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginTop: 4,
                  }}
                >
                  Email cannot be changed.
                </div>
              </div>
            </div>

            {profileError && (
              <div
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "var(--status-red-text)",
                  marginBottom: 16,
                }}
              >
                {profileError}
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={!hasProfileChanges || profileSaving}
              style={{
                padding: "10px 20px",
                background:
                  !hasProfileChanges || profileSaving
                    ? "var(--surface-tint-strong)"
                    : "var(--primary)",
                color:
                  !hasProfileChanges || profileSaving
                    ? "var(--muted)"
                    : "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor:
                  !hasProfileChanges || profileSaving
                    ? "not-allowed"
                    : "pointer",
                fontFamily: "Inter,sans-serif",
              }}
              onMouseOver={(e) => {
                if (!hasProfileChanges || profileSaving) return;

                e.currentTarget.style.background =
                  "var(--primary-hover)";
              }}
              onMouseOut={(e) => {
                if (!hasProfileChanges || profileSaving) return;

                e.currentTarget.style.background =
                  "var(--primary)";
              }}
            >
              {profileSaving ? "Saving..." : "Save Changes"}
            </button>
          </Section>
  );
}
