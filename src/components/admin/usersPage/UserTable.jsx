import { memo } from "react";
import UserRow from "./UserRow";
import UserSkeleton from "./UserSkeleton";

const UserTable = memo(function UserTable({
  loading,
  filtered,
  canManageUsers,
  TABLE_COLUMNS,
  userEmail,
  isSuperAdmin,
  openMenuId,
  menuPos,
  onLogout,
  onOpenMenu,
  onChangeRole,
  onRecover,
  onDeleteTarget,
  onCloseMenu,
}) {
  return (
    <div style={{ overflowX: "auto", overflowY: "visible" }}>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          minWidth: "max-content",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: TABLE_COLUMNS,
            gap: 0,
            padding: "10px 16px",
            borderBottom: "1px solid var(--border)",
            fontSize: 11,
            fontWeight: 600,
            color: "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
          className="users-table-header"
        >
          <span>User</span>
          <span>Email</span>
          <span>Storage</span>
          <span>Status</span>
          <span style={{ textAlign: "center" }}>Logout</span>
          {canManageUsers && <span style={{ textAlign: "center" }}>Actions</span>}
        </div>

        {/* Loading skeletons */}
        {loading && <UserSkeleton />}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 20px",
              color: "var(--muted)",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 600, color: "var(--text)" }}>No users found</div>
          </div>
        )}

        {/* Rows */}
        {!loading &&
          filtered.map((u) => (
            <UserRow
              key={u.id}
              u={u}
              userEmail={userEmail}
              isSuperAdmin={isSuperAdmin}
              canManageUsers={canManageUsers}
              TABLE_COLUMNS={TABLE_COLUMNS}
              openMenuId={openMenuId}
              menuPos={menuPos}
              onLogout={onLogout}
              onOpenMenu={onOpenMenu}
              onChangeRole={onChangeRole}
              onRecover={onRecover}
              onDeleteTarget={onDeleteTarget}
              onCloseMenu={onCloseMenu}
            />
          ))}
      </div>
    </div>
  );
});

export default UserTable;
