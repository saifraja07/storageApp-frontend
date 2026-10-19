import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import {
  changePassword,
  deleteAccount,
  disableAccount,
  logoutAllSessions,
  updateProfile,
} from "../api/userApi";
import { getErr } from "../utils/directoryUtils";
import { VALID_TABS, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "../config/settingsConfig";

export default function useSettings() {
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
      await disableAccount();

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

  return {
    user,
    activeTab,
    handleTabClick,
    logoutAllConfirm,
    setLogoutAllConfirm,
    errorAlert,
    setErrorAlert,
    pwForm,
    setPwForm,
    pwError,
    setPwError,
    pwSuccess,
    setPwSuccess,
    loading,
    disableAccountConfirm,
    setDisableAccountConfirm,
    deleteAccountConfirm,
    setDeleteAccountConfirm,
    profileName,
    setProfileName,
    previewUrl,
    profileSaving,
    profileError,
    setProfileError,
    profileFileInputRef,
    handleProfileImageSelect,
    hasProfileChanges,
    handleSaveProfile,
    used,
    max,
    pct,
    storageColor,
    hasPassword,
    canSubmit,
    handleLogoutAll,
    handlePasswordSubmit,
    handleDisableAccount,
    handleDeleteAccount,
    passwordFields,
  };
}
