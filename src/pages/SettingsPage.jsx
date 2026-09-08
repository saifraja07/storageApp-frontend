import AppLayout from "../components/AppLayout";
import useSettings from "../hooks/useSettings";
import {
  SettingsTabs,
  ProfileTab,
  SecurityTab,
  StorageTab,
  SettingsDialogs,
} from "../components/settings";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const {
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
  } = useSettings();

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
        <SettingsTabs activeTab={activeTab} onTabClick={handleTabClick} />

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <ProfileTab
            user={user}
            previewUrl={previewUrl}
            profileFileInputRef={profileFileInputRef}
            profileSaving={profileSaving}
            handleProfileImageSelect={handleProfileImageSelect}
            profileName={profileName}
            setProfileName={setProfileName}
            profileError={profileError}
            setProfileError={setProfileError}
            hasProfileChanges={hasProfileChanges}
            handleSaveProfile={handleSaveProfile}
          />
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <SecurityTab
            hasPassword={hasPassword}
            pwSuccess={pwSuccess}
            pwError={pwError}
            passwordFields={passwordFields}
            loading={loading}
            pwForm={pwForm}
            setPwError={setPwError}
            setPwSuccess={setPwSuccess}
            setPwForm={setPwForm}
            handlePasswordSubmit={handlePasswordSubmit}
            canSubmit={canSubmit}
            setLogoutAllConfirm={setLogoutAllConfirm}
            setDisableAccountConfirm={setDisableAccountConfirm}
            setDeleteAccountConfirm={setDeleteAccountConfirm}
          />
        )}

        {/* Storage Tab */}
        {activeTab === "storage" && (
          <StorageTab used={used} max={max} pct={pct} storageColor={storageColor} />
        )}
      </div>

      <SettingsDialogs
        logoutAllConfirm={logoutAllConfirm}
        setLogoutAllConfirm={setLogoutAllConfirm}
        handleLogoutAll={handleLogoutAll}
        errorAlert={errorAlert}
        setErrorAlert={setErrorAlert}
        disableAccountConfirm={disableAccountConfirm}
        setDisableAccountConfirm={setDisableAccountConfirm}
        handleDisableAccount={handleDisableAccount}
        deleteAccountConfirm={deleteAccountConfirm}
        setDeleteAccountConfirm={setDeleteAccountConfirm}
        handleDeleteAccount={handleDeleteAccount}
      />
    </AppLayout>
  );
}
