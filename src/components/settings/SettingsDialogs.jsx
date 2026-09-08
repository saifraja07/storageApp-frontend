import { Lock, TriangleAlert, Pause, Trash2 } from "lucide-react";
import ConfirmDialog from "../ConfirmDialog";

export default function SettingsDialogs({ logoutAllConfirm, setLogoutAllConfirm, handleLogoutAll, errorAlert, setErrorAlert, disableAccountConfirm, setDisableAccountConfirm, handleDisableAccount, deleteAccountConfirm, setDeleteAccountConfirm, handleDeleteAccount }) {
  return (
    <>
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
    </>
  );
}
