import { memo } from "react";
import { Search } from "lucide-react";

const PlansSearchBar = memo(function PlansSearchBar({
  searchQ,
  setSearchQ,
  filteredCount,
  totalCount,
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
      <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 320 }}>
        <span
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--muted)",
            fontSize: 14,
            display: "flex",
          }}
        >
          <Search size={14} aria-hidden="true" />
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

      <div style={{ fontSize: 12, color: "var(--muted)" }}>
        {filteredCount} of {totalCount} premium users
      </div>
    </div>
  );
});

export default PlansSearchBar;
