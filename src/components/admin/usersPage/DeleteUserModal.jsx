import { memo } from "react";

const DeleteUserModal = memo(function DeleteUserModal({ user, onClose, onConfirm }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#1a2433",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "26px 28px",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 6,
            color: "var(--text)",
          }}
        >
          Delete User
        </h3>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
          {user.email}
        </p>
        <p style={{ fontSize: 12, color: "#F87171", marginBottom: 22 }}>
          ⚠️ Hard delete cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <button
            onClick={() => onConfirm("soft")}
            style={{
              flex: 1,
              padding: "10px",
              background: "#D97706",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter,sans-serif",
            }}
          >
            Soft Delete
          </button>
          <button
            onClick={() => onConfirm("hard")}
            style={{
              flex: 1,
              padding: "10px",
              background: "#DC2626",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter,sans-serif",
            }}
          >
            Hard Delete
          </button>
        </div>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: 10,
            background: "var(--surface-hover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text)",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "Inter,sans-serif",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
});

export default DeleteUserModal;
