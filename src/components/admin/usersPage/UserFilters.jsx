import { memo } from "react";
import ReloadButton from "../../ReloadButton";
import SearchInput from "../../SearchInput";

const UserFilters = memo(function UserFilters({
  searchQ,
  setSearchQ,
  filterRole,
  setFilterRole,
  filteredCount,
  totalCount,
  onRefresh,
  listRefreshing,
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        marginBottom: 16,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {/* Shared search field */}
      <SearchInput
        value={searchQ}
        onChange={setSearchQ}
        placeholder="Search by name or email…"
        ariaLabel="Search users by name or email"
      />

      {/* Role filter + count: one unit, so they wrap onto a new line together */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{
            height: 37.5,
            padding: "0 32px 0 12px",
            background: "var(--surface-hover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--muted)",
            fontSize: 13,
            outline: "none",
            fontFamily: "Inter,sans-serif",
            appearance: "none",
            WebkitAppearance: "none",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%23888' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            cursor: "pointer",
          }}
        >
          <option value="all">All Roles</option>
          <option value="SuperAdmin">SuperAdmin</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="User">User</option>
        </select>

        {/* Count */}
        <div
          style={{
            fontSize: 12,
            color: "var(--muted)",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
          }}
        >
          {filteredCount} of {totalCount} users
        </div>
      </div>

      {/* Refresh stays with the toolbar controls on compact layouts. On wider
          screens it moves to the far edge to use the available space cleanly. */}
      <div className="admin-users-refresh">
        <ReloadButton
          onClick={onRefresh}
          loading={listRefreshing}
          label="Refresh users"
        />
      </div>
    </div>
  );
});

export default UserFilters;
