import { memo } from "react";
import UserStorageBar from "./UserStorageBar";
import UserStatus from "./UserStatus";
import UserActionsMenu from "./UserActionsMenu";

// Badge defined here since it is only used inside UserRow
function Badge({ children, color }) {
  const colors = {
    green:  { bg: "rgba(16,185,129,0.15)",  text: "#34D399", border: "rgba(16,185,129,0.3)" },
    red:    { bg: "rgba(239,68,68,0.15)",   text: "#F87171", border: "rgba(239,68,68,0.3)" },
    blue:   { bg: "rgba(59,130,246,0.15)",  text: "#93C5FD", border: "rgba(59,130,246,0.3)" },
    amber:  { bg: "rgba(245,158,11,0.15)",  text: "#FCD34D", border: "rgba(245,158,11,0.3)" },
    gray:   { bg: "rgba(255,255,255,0.07)", text: "var(--muted)", border: "var(--border)" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.3,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
      }}
    >
      {children}
    </span>
  );
}

const UserRow = memo(function UserRow({
  u,
  userEmail,
  isSuperAdmin,
  canManageUsers,
  TABLE_COLUMNS,
  openMenuId,
  menuPos,
  onLogout,
  onOpenMenu,
  onChangeRole,
  onRecover,
  onDeleteTarget,
  onCloseMenu,
}) {
  const isSelf = u.email === userEmail;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: TABLE_COLUMNS,
        gap: 0,
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
        alignItems: "center",
        transition: "background 0.1s",
      }}
      className="users-table-row"
      onMouseOver={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* User */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <div
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(59,130,246,0.15)",
            border: "1px solid rgba(59,130,246,0.25)",
            flexShrink: 0, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 14, overflow: "hidden",
          }}
        >
          {u.picture ? (
            <img src={u.picture} alt={u.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : "👤"}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
            {u.name}{" "}
            {isSelf && <span style={{ fontSize: 10, color: "#93C5FD" }}>(you)</span>}
          </div>
          <div style={{ marginTop: 3 }}>
            <Badge
              color={
                u.role === "Admin"      ? "amber" :
                u.role === "Manager"    ? "blue"  :
                u.role === "SuperAdmin" ? "red"   : "gray"
              }
            >
              {u.role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Email */}
      <div
        style={{
          minWidth: 0, fontSize: 12, color: "var(--muted)",
          overflow: "hidden", textOverflow: "ellipsis",
          whiteSpace: "nowrap", paddingRight: 12,
        }}
      >
        {u.email}
      </div>

      {/* Storage */}
      <UserStorageBar
        usedStorageInBytes={u.usedStorageInBytes}
        maxStorageInBytes={u.maxStorageInBytes}
      />

      {/* Status */}
      <UserStatus isDeleted={u.isDeleted} isLoggedIn={u.isLoggedIn} />

      {/* Logout */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          onClick={() => onLogout(u)}
          disabled={!u.isLoggedIn}
          title="Logout user"
          style={{
            padding: "5px 10px",
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: "none",
            color: u.isLoggedIn ? "var(--text)" : "var(--muted)",
            fontSize: 11,
            cursor: u.isLoggedIn ? "pointer" : "not-allowed",
            fontFamily: "Inter,sans-serif",
            opacity: u.isLoggedIn ? 1 : 0.45,
          }}
        >
          Logout
        </button>
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex", gap: 6, alignItems: "center",
          justifyContent: "center", minWidth: 90,
        }}
      >
        {canManageUsers && (
          <UserActionsMenu
            u={u}
            openMenuId={openMenuId}
            menuPos={menuPos}
            isSuperAdmin={isSuperAdmin}
            isSelf={isSelf}
            onOpenMenu={onOpenMenu}
            onChangeRole={onChangeRole}
            onRecover={onRecover}
            onDeleteTarget={onDeleteTarget}
            onCloseMenu={onCloseMenu}
          />
        )}
      </div>
    </div>
  );
});

export default UserRow;
