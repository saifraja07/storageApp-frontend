import { useState, useRef, useEffect } from "react";
import { Lock, TriangleAlert, Pause, Trash2, User } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useUser } from "../context/UserContext";
import {
  changePassword,
  deleteAccount,
  disableAccount,
  logoutAllSessions,
  updateProfile,
} from "../api/userApi";
import { formatStorage, getErr } from "../utils/directoryUtils";

const VALID_TABS = ["profile", "security", "storage"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

function Section({ title, children }) {
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

function inputSx() {
  return {
    width: "100%",
    padding: "10px 14px",
    background: "var(--surface-tint)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
    fontFamily: "Inter,sans-serif",
    marginBottom: 4,
  };
}

export default function SettingsPage() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = VALID_TABS.includes(searchParams.get("tab"))
    ? searchParams.get("tab")
    : "profile";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [logoutAllConfirm, setLogoutAllConfirm] = useState(false);
  const [errorAlert, setErrorAlert] = useState("");
  const [pwForm, setPwForm] = useState({
    current: "",
    newPw: "",
    confirm: "",
  });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [disableAccountConfirm, setDisableAccountConfirm] = useState(false);
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState(false);

  // Profile tab state
  const [profileName, setProfileName] = useState(user?.name || "");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const profileFileInputRef = useRef(null);

  // Keep activeTab in sync when the URL's ?tab= param changes externally.
  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab && VALID_TABS.includes(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Revoke the local preview URL whenever it changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleTabClick = (id) => {
    setActiveTab(id);
    setSearchParams({ tab: id }, { replace: true });
  };

  const handleProfileImageSelect = (e) => {
    const file = e.target.files?.[0];

    // Allow selecting the same file again later.
    e.target.value = "";

    if (!file) return;

    setProfileError("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setProfileError("Please select a valid image.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setProfileError("Image must be smaller than 5MB.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const trimmedProfileName = profileName.trim();

  // A profile is considered changed only when:
  // 1. The name is not empty, AND
  // 2. The name changed or a new image was selected.
  //
  // This also keeps the Save button disabled when the name is empty.
  const hasProfileChanges =
    !!trimmedProfileName &&
    (trimmedProfileName !== (user?.name || "") || !!selectedImage);

  const handleSaveProfile = async () => {
    // Prevent unnecessary API calls.
    if (!hasProfileChanges || profileSaving) return;

    setProfileError("");

    // Defensive validation in case this function is called from somewhere else.
    if (!trimmedProfileName) {
      setProfileError("Name cannot be empty.");
      return;
    }

    const nameChanged = trimmedProfileName !== (user?.name || "");
    const imageChanged = !!selectedImage;

    // Nothing actually changed.
    if (!nameChanged && !imageChanged) {
      return;
    }

    try {
      setProfileSaving(true);

      const formData = new FormData();

      formData.append("name", trimmedProfileName);

      if (selectedImage) {
        formData.append("picture", selectedImage);
      }

      const { user: updatedUser } = await updateProfile(formData);

      setUser(updatedUser);
      setSelectedImage(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(null);

      toast.success("Profile updated");
    } catch (err) {
      setProfileError(getErr(err));
    } finally {
      setProfileSaving(false);
    }
  };

  const used = user?.usedStorageInBytes || 0;
  const max = user?.maxStorageInBytes || 1;

  const pct = Math.min((used / max) * 100, 100);

  const storageColor =
    pct >= 90
      ? "#EF4444"
      : pct >= 70
        ? "#F59E0B"
        : "var(--primary)";

  const hasPassword = !!user?.hasPassword;

  const canSubmit =
    pwForm.newPw &&
    pwForm.confirm &&
    (!hasPassword || pwForm.current);

  const handleLogoutAll = async () => {
    try {
      await logoutAllSessions();

      setUser(null);
      navigate("/login");
    } catch {
      setErrorAlert("Something went wrong. Please try again.");
    }
  };

  const handlePasswordSubmit = async () => {
    setPwError("");
    setPwSuccess("");

    if (pwForm.newPw.length < 4) {
      setPwError("Password must be at least 4 characters.");
      return;
    }

    if (pwForm.newPw !== pwForm.confirm) {
      setPwError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        newPassword: pwForm.newPw,
        confirmPassword: pwForm.confirm,
      };

      if (hasPassword) {
        payload.currentPassword = pwForm.current;
      }

      await changePassword(payload);

      if (!hasPassword) {
        setUser((prev) => ({
          ...prev,
          hasPassword: true,
        }));
      }

      setPwForm({
        current: "",
        newPw: "",
        confirm: "",
      });

      setPwSuccess(
        hasPassword
          ? "Password changed successfully."
          : "Password set successfully.",
      );
    } catch (err) {
      setPwError(
        err.response?.data?.error || "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDisableAccount = async () => {
    try {
      await disableAccount();

      setUser(null);
      navigate("/login");
    } catch {
      setErrorAlert("Something went wrong. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();

      setUser(null);
      navigate("/");
    } catch {
      setErrorAlert("Something went wrong. Please try again.");
    }
  };

  const passwordFields = hasPassword
    ? [
        ["Current Password", "current", "Enter current password"],
        ["New Password", "newPw", "Enter new password"],
        ["Confirm New Password", "confirm", "Confirm new password"],
      ]
    : [
        ["New Password", "newPw", "Enter new password"],
        ["Confirm New Password", "confirm", "Confirm new password"],
      ];

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
    { id: "storage", label: "Storage" },
  ];

  return (
    <AppLayout>
      <div
        style={{
          padding: "24px",
          maxWidth: 700,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          Settings
        </h1>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            marginBottom: 28,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 4,
            width: "fit-content",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              style={{
                padding: "7px 18px",
                borderRadius: 7,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                background:
                  activeTab === tab.id
                    ? "var(--primary)"
                    : "transparent",
                color:
                  activeTab === tab.id
                    ? "#fff"
                    : "var(--muted)",
                cursor: "pointer",
                fontFamily: "Inter,sans-serif",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
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
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
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

            <Section title="Disable Account">
              <p
                style={{
                  fontSize: 14,
                  color: "var(--muted)",
                  marginBottom: 16,
                  lineHeight: 1.6,
                }}
              >
                Your account will be disabled and you won't be
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
                Disable Account
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
        )}

        {/* Storage Tab */}
        {activeTab === "storage" && (
          <>
            <Section title="Storage Usage">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    {formatStorage(used)}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--muted)",
                    }}
                  >
                    of {formatStorage(max)} used
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: storageColor,
                  }}
                >
                  {Math.round(pct)}%
                </div>
              </div>

              <div
                style={{
                  height: 8,
                  background: "var(--surface-tint-strong)",
                  borderRadius: 4,
                  overflow: "hidden",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: storageColor,
                    borderRadius: 4,
                    transition: "width 0.5s",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                {[
                  ["Used", formatStorage(used), storageColor],
                  [
                    "Available",
                    formatStorage(max - used),
                    "var(--status-green-text)",
                  ],
                  ["Total", formatStorage(max), "var(--muted)"],
                ].map(([label, value, color]) => (
                  <div
                    key={label}
                    style={{
                      flex: 1,
                      minWidth: 100,
                      background: "var(--surface-tint)",
                      borderRadius: 8,
                      padding: "12px 16px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        marginBottom: 4,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {label}
                    </div>

                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color,
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Storage Plan">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  background: "rgba(59,130,246,0.08)",
                  border:
                    "1px solid rgba(59,130,246,0.2)",
                  borderRadius: 10,
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      marginBottom: 2,
                    }}
                  >
                    Personal Plan
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                    }}
                  >
                    {formatStorage(max)} total storage
                  </div>
                </div>

                <span
                  style={{
                    background: "rgba(59,130,246,0.2)",
                    color: "var(--status-blue-text)",
                    padding: "4px 12px",
                    borderRadius: 100,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Active
                </span>
              </div>
            </Section>
          </>
        )}
      </div>

      <ConfirmDialog
        open={logoutAllConfirm}
        icon={<Lock size={32} aria-hidden="true" />}
        title="Sign out of all devices?"
        message="This will end all active sessions. You'll need to sign in again on every device."
        confirmLabel="Sign Out All"
        confirmDanger
        onConfirm={() => {
          setLogoutAllConfirm(false);
          handleLogoutAll();
        }}
        onCancel={() => setLogoutAllConfirm(false)}
      />

      <ConfirmDialog
        open={!!errorAlert}
        icon={
          <TriangleAlert
            size={32}
            aria-hidden="true"
          />
        }
        title="Something went wrong"
        message={errorAlert}
        confirmLabel="OK"
        alertOnly
        onConfirm={() => setErrorAlert("")}
        onCancel={() => setErrorAlert("")}
      />

      <ConfirmDialog
        open={disableAccountConfirm}
        icon={<Pause size={32} aria-hidden="true" />}
        title="Disable your account?"
        message="You'll be signed out immediately and won't be able to sign in again until your account is restored by admin. Your files and data will be kept."
        confirmLabel="Disable Account"
        confirmDanger
        onConfirm={() => {
          setDisableAccountConfirm(false);
          handleDisableAccount();
        }}
        onCancel={() => setDisableAccountConfirm(false)}
      />

      <ConfirmDialog
        open={deleteAccountConfirm}
        icon={
          <Trash2
            size={32}
            aria-hidden="true"
          />
        }
        title="Delete your account permanently?"
        message="This will permanently delete your account, all folders, files, and other data. This action cannot be undone."
        confirmLabel="Delete Permanently"
        confirmDanger
        onConfirm={() => {
          setDeleteAccountConfirm(false);
          handleDeleteAccount();
        }}
        onCancel={() => setDeleteAccountConfirm(false)}
      />
    </AppLayout>
  );
}