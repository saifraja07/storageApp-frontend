import { memo } from "react";
import { Search, LayoutGrid, List as ListIcon } from "lucide-react";
import SortDropdown from "../SortDropdown";

const DirectoryToolbar = memo(function DirectoryToolbar({
  searchQuery,
  setSearchQuery,
  sortBy,
  sortDir,
  onSort,
  viewMode,
  setViewMode,
  selectionMode,
  setSelectionMode,
  selectedItems,
  setSelectedItems,
  directoriesList,
  filesList,
  realItems,
  bulkLoading,
  onBulkConfirm,
}) {
  const isTempItem = (item) =>
    typeof item.id === "string" && item.id.startsWith("temp-");
  const selectableRealItems = realItems.filter((i) => !isTempItem(i));
  const totalCount =
    directoriesList.length + filesList.filter((f) => !isTempItem(f)).length;
  const allSelected =
    selectedItems.length === totalCount && totalCount > 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
        flexWrap: "wrap",
      }}
    >
      {/* Search */}
      <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 340 }}>
        <span
          style={{
            position: "absolute", left: 10, top: "50%",
            transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14,
            display: "flex",
          }}
        >
          <Search size={14} aria-hidden="true" />
        </span>
        <input
          type="text"
          placeholder="Search files and folders…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%", padding: "8px 12px 8px 32px",
            background: "var(--surface-tint)",
            border: "1px solid var(--border)", borderRadius: 8,
            color: "var(--text)", fontSize: 13, outline: "none",
            fontFamily: "Inter,sans-serif",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto", flexWrap: "wrap" }}>
        <SortDropdown sortBy={sortBy} sortDir={sortDir} onSort={onSort} />

        {/* View toggle */}
        <div style={{ display: "flex", gap: 3 }}>
          {[["grid", LayoutGrid], ["list", ListIcon]].map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              aria-label={mode === "grid" ? "Grid view" : "List view"}
              style={{
                width: 32, height: 32, borderRadius: 6,
                border: "1px solid var(--border)",
                background: viewMode === mode ? "var(--primary)" : "var(--surface-hover)",
                color: viewMode === mode ? "#fff" : "var(--muted)",
                cursor: "pointer", fontSize: 15,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Icon size={16} aria-hidden="true" />
            </button>
          ))}
        </div>

        {/* Select / Bulk */}
        {!selectionMode ? (
          <button
            onClick={() => setSelectionMode(true)}
            style={{
              padding: "6px 12px", background: "var(--surface-hover)",
              border: "1px solid var(--border)", borderRadius: 6,
              color: "var(--muted)", fontSize: 12, cursor: "pointer",
              fontFamily: "Inter,sans-serif",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            Select
          </button>
        ) : (
          <>
            <button
              onClick={() => selectedItems.length && onBulkConfirm()}
              disabled={!selectedItems.length || bulkLoading}
              style={{
                padding: "6px 12px",
                background: selectedItems.length && !bulkLoading ? "#EF4444" : "rgba(239,68,68,0.3)",
                border: "none", borderRadius: 6,
                color: "#fff", fontSize: 12, fontWeight: 600,
                cursor: selectedItems.length && !bulkLoading ? "pointer" : "not-allowed",
                fontFamily: "Inter,sans-serif",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {bulkLoading && <span className="btn-spinner" />}
              Delete ({selectedItems.length})
            </button>
            <button
              onClick={() => setSelectedItems(allSelected ? [] : selectableRealItems)}
              style={{
                padding: "6px 12px", background: "var(--surface-hover)",
                border: "1px solid var(--border)", borderRadius: 6,
                color: "var(--muted)", fontSize: 12, cursor: "pointer",
                fontFamily: "Inter,sans-serif",
              }}
            >
              {allSelected ? "Unselect All" : "Select All"}
            </button>
            <button
              onClick={() => { setSelectionMode(false); setSelectedItems([]); }}
              style={{
                padding: "6px 12px", background: "var(--surface-hover)",
                border: "1px solid var(--border)", borderRadius: 6,
                color: "var(--muted)", fontSize: 12, cursor: "pointer",
                fontFamily: "Inter,sans-serif",
              }}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
});

export default DirectoryToolbar;
