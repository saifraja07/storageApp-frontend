import { memo } from "react";
import { TriangleAlert } from "lucide-react";
import ButtonSpinner from "../../ButtonSpinner";

const DeleteUserModal = memo(function DeleteUserModal({
  user,
  onClose,
  onConfirm,
  loadingAction = null,
}) {
  const isLoading = Boolean(loadingAction);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(4px)",
      }}
      onClick={() => !isLoading && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dum-title"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 24,
          borderRadius: 14,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
              background: "rgba(239, 68, 68, 0.10)",
              color: "var(--status-red-text-strong)",
            }}
          >
            <TriangleAlert size={20} />
          </div>

          <div>
            <h3
              id="dum-title"
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Manage User
            </h3>

            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              Choose an action for this user.
            </p>
          </div>
        </div>

        <div
          style={{
            padding: 12,
            marginBottom: 18,
            borderRadius: 8,
            background: "var(--surface-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-primary)",
              overflowWrap: "anywhere",
            }}
          >
            {user?.name || "Unknown user"}
          </p>

          <p
            style={{
              margin: "4px 0 0",
              fontSize: 12,
              color: "var(--text-secondary)",
              overflowWrap: "anywhere",
            }}
          >
            {user?.email || ""}
          </p>
        </div>

        <p
          style={{
            margin: "0 0 18px",
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--text-secondary)",
          }}
        >
          Deactivating prevents the user from accessing their account.
          Deleting permanently removes the user and their associated data.
        </p>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className="dum-action-button"
            onClick={() => !isLoading && onConfirm("soft")}
            disabled={isLoading}
            aria-busy={loadingAction === "soft"}
            style={{
              flex: 1,
              height: 40,
              minHeight: 40,
              boxSizing: "border-box",
              padding: "0 12px",
              background: "rgba(245, 158, 11, 0.10)",
              border: "1px solid rgba(245, 158, 11, 0.28)",
              borderRadius: 8,
              color: "var(--status-amber-text)",
              fontSize: 13,
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading && loadingAction !== "soft" ? 0.5 : 1,
              fontFamily: "Inter, sans-serif",
              transition:
                "background 0.15s ease, border-color 0.15s ease, opacity 0.15s ease",
            }}
          >
            {loadingAction === "soft" ? (
              <span className="dum-loading">
                <ButtonSpinner size={14} />
                Deactivating...
              </span>
            ) : (
              "Deactivate"
            )}
          </button>

          <button
            type="button"
            className="dum-action-button"
            onClick={() => !isLoading && onConfirm("hard")}
            disabled={isLoading}
            aria-busy={loadingAction === "hard"}
            style={{
              flex: 1,
              height: 40,
              minHeight: 40,
              boxSizing: "border-box",
              padding: "0 12px",
              background: "rgba(239, 68, 68, 0.10)",
              border: "1px solid rgba(239, 68, 68, 0.28)",
              borderRadius: 8,
              color: "var(--status-red-text-strong)",
              fontSize: 13,
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading && loadingAction !== "hard" ? 0.5 : 1,
              fontFamily: "Inter, sans-serif",
              transition:
                "background 0.15s ease, border-color 0.15s ease, opacity 0.15s ease",
            }}
          >
            {loadingAction === "hard" ? (
              <span className="dum-loading">
                <ButtonSpinner size={14} />
                Deleting...
              </span>
            ) : (
              "Delete"
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          style={{
            width: "100%",
            height: 40,
            marginTop: 10,
            padding: "0 12px",
            border: "1px solid var(--border)",
            borderRadius: 8,
            background: "transparent",
            color: "var(--text-secondary)",
            fontSize: 13,
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.5 : 1,
            fontFamily: "Inter, sans-serif",
          }}
        >
          Cancel
        </button>
      </div>

      <style>{`
        .dum-action-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 18px;
          white-space: nowrap;
        }

        .dum-loading {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          line-height: 18px;
          white-space: nowrap;
        }

        .dum-action-button:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
});

export default DeleteUserModal;