import { useState } from "react";
import { Lock, TriangleAlert, Pause, Trash2 } from "lucide-react";
import ConfirmDialog from "../ConfirmDialog";

export default function SettingsDialogs({ logoutAllConfirm, setLogoutAllConfirm, handleLogoutAll, errorAlert, setErrorAlert, disableAccountConfirm, setDisableAccountConfirm, handleDisableAccount, deleteAccountConfirm, setDeleteAccountConfirm, handleDeleteAccount }) {
  const [processingAction, setProcessingAction] = useState(null);

  const runAction = async (action, handler, close) => {
    if (processingAction) return;
    setProcessingAction(action);
    try {
      const succeeded = await handler();
      if (succeeded) close(false);
    } finally {
      setProcessingAction(null);
    }
  };

  return (
    <>
      <ConfirmDialog
        open={logoutAllConfirm}
        icon={<Lock size={32} aria-hidden="true" />}
        title="Sign out of all devices?"
        message="This will end all active sessions. You'll need to sign in again on every device."
        confirmLabel="Sign Out All"
        loadingLabel="Signing out..."
        isLoading={processingAction === "logoutAll"}
        confirmDanger
        onConfirm={() => runAction("logoutAll", handleLogoutAll, setLogoutAllConfirm)}
        onCancel={() => setLogoutAllConfirm(false)}
      />

      <ConfirmDialog
        open={!!errorAlert}
        icon={<TriangleAlert size={32} aria-hidden="true" />}
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
        title="Deactivate your account?"
        message="You'll be signed out immediately and won't be able to sign in again until your account is restored by admin. Your files and data will be kept."
        confirmLabel="Deactivate Account"
        loadingLabel="Deactivating..."
        isLoading={processingAction === "deactivate"}
        confirmDanger
        onConfirm={() => runAction("deactivate", handleDisableAccount, setDisableAccountConfirm)}
        onCancel={() => setDisableAccountConfirm(false)}
      />

      <ConfirmDialog
        open={deleteAccountConfirm}
        icon={<Trash2 size={32} aria-hidden="true" />}
        title="Delete your account permanently?"
        message="This will permanently delete your account, all folders, files, and other data. This action cannot be undone."
        confirmLabel="Delete Permanently"
        loadingLabel="Deleting account..."
        isLoading={processingAction === "deleteAccount"}
        confirmDanger
        onConfirm={() => runAction("deleteAccount", handleDeleteAccount, setDeleteAccountConfirm)}
        onCancel={() => setDeleteAccountConfirm(false)}
      />
    </>
  );
}
