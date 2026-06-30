import { memo } from "react";

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
      }}
    >
      {/* Search */}
      <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 320 }}>
        <span
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--muted)",
            fontSize: 14,
          }}
        >
          🔍
        </span>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px 8px 32px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text)",
            fontSize: 13,
            outline: "none",
            fontFamily: "Inter,sans-serif",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>

      {/* Role filter */}
      <select
        value={filterRole}
        onChange={(e) => setFilterRole(e.target.value)}
        style={{
          padding: "8px 32px 8px 12px",
          background: "var(--surface-hover)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          color: "var(--text)",
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
          display: "flex",
          alignItems: "center",
        }}
      >
        {filteredCount} of {totalCount} users
      </div>

      {/* Refresh */}
      <button
        onClick={onRefresh}
        disabled={listRefreshing}
        style={{
          padding: "8px 14px",
          background: "#3B82F6",
          border: "none",
          borderRadius: 8,
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          cursor: listRefreshing ? "not-allowed" : "pointer",
          opacity: listRefreshing ? 0.7 : 1,
        }}
      >
        {listRefreshing ? "Refreshing..." : "↻ Refresh"}
      </button>
    </div>
  );
});

export default UserFilters;
