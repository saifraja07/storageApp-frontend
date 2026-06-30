import { memo } from "react";

const UserActionsMenu = memo(function UserActionsMenu({
  u,
  openMenuId,
  menuPos,
  isSuperAdmin,
  isSelf,
  onOpenMenu,
  onChangeRole,
  onRecover,
  onDeleteTarget,
  onCloseMenu,
}) {
  const isTargetSuperAdmin = u.role === "SuperAdmin";

  const menuItems = [
    {
      label: "Set as User",
      action: () => { onChangeRole(u, "User"); onCloseMenu(); },
      disabled: isSelf || isTargetSuperAdmin || u.role === "User",
    },
    {
      label: "Set as Manager",
      action: () => { onChangeRole(u, "Manager"); onCloseMenu(); },
      disabled: isSelf || isTargetSuperAdmin || u.role === "Manager",
    },
    {
      label: "Set as Admin",
      action: () => { onChangeRole(u, "Admin"); onCloseMenu(); },
      disabled: !isSuperAdmin || isSelf || isTargetSuperAdmin || u.role === "Admin",
    },
    {
      label: "Recover",
      action: () => { onRecover(u); onCloseMenu(); },
      disabled: isSelf || !u.isDeleted || isTargetSuperAdmin,
    },
    null, // divider
    {
      label: "Delete User",
      action: () => { onDeleteTarget(u); onCloseMenu(); },
      disabled: isSelf || u.isDeleted || isTargetSuperAdmin,
    },
  ];

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenMenu(e, u.id);
        }}
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          border: "1px solid var(--border)",
          background: "none",
          color: "var(--muted)",
          cursor: "pointer",
          fontSize: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ⋮
      </button>

      {openMenuId === u.id && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            top: menuPos.top,
            left: menuPos.left,
            background: "#1a2433",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 4,
            zIndex: 9999,
            minWidth: 160,
          }}
        >
          {menuItems.map((a, i) =>
            a === null ? (
              <div
                key={i}
                style={{
                  height: 1,
                  background: "var(--border)",
                  margin: "3px 0",
                }}
              />
            ) : (
              <button
                key={a.label}
                onClick={a.action}
                disabled={a.disabled}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  padding: "8px 12px",
                  background: "none",
                  border: "none",
                  color: a.danger ? "#F87171" : a.color || "var(--text)",
                  fontSize: 12,
                  cursor: a.disabled ? "not-allowed" : "pointer",
                  borderRadius: 6,
                  textAlign: "left",
                  fontFamily: "Inter,sans-serif",
                  opacity: a.disabled ? 0.4 : 1,
                }}
                onMouseOver={(e) =>
                  !a.disabled &&
                  (e.currentTarget.style.background = a.danger
                    ? "rgba(239,68,68,0.1)"
                    : "var(--surface-hover)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                {a.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
});

export default UserActionsMenu;
