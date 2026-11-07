import { memo } from "react";
import { Search, X } from "lucide-react";
import SortDropdown from "../SortDropdown";
import ReloadButton from "../ReloadButton";
import DirectoryActionsMenu from "./DirectoryActionsMenu";
import ViewToggle from "./ViewToggle";

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
  loading,
  listRefreshing,
  onRefresh,
  onCancelSelection,
}) {
  const isTempItem = (item) =>
    typeof item.id === "string" && item.id.startsWith("temp-");
  const selectableRealItems = realItems.filter((i) => !isTempItem(i));
  const totalCount =
    directoriesList.length + filesList.filter((f) => !isTempItem(f)).length;
  const allSelected =
    selectedItems.length === totalCount && totalCount > 0;

  return (
    // `@container`: the layout below reacts to the toolbar's own width (not the
    // viewport), so it also behaves with the desktop sidebar open.
    <div className="@container" style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {/* Search — grows up to 340px; own full-width row on narrow toolbars */}
        <div className="relative min-w-0 max-w-85 flex-[1_1_160px] @max-[480px]:max-w-none @max-[480px]:basis-full">
          <span
            style={{
              position: "absolute", left: 10, top: "50%",
              transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14,
              display: "flex", pointerEvents: "none",
            }}
          >
            <Search size={14} aria-hidden="true" />
          </span>
          <input
            type="text"
            placeholder="Search files and folders…"
            aria-label="Search files and folders"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%", height: 32,
              padding: searchQuery ? "0 30px 0 32px" : "0 12px 0 32px",
              background: "var(--surface-tint)",
              border: "1px solid var(--border)", borderRadius: 8,
              color: "var(--text)", fontSize: 13, outline: "none",
              fontFamily: "Inter,sans-serif",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              title="Clear search"
              className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-(--muted) transition-colors hover:bg-(--surface-tint-strong) hover:text-(--text) focus-visible:outline-2 focus-visible:outline-(--primary)"
            >
              <X size={13} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Controls — pushed right; when stacked, Sort sits left and the rest
            right so the row spans the full width */}
        <div
          className="flex flex-wrap items-center gap-1.5 @max-[480px]:w-full @max-[480px]:justify-between"
          style={{ marginLeft: "auto" }}
        >
          <SortDropdown sortBy={sortBy} sortDir={sortDir} onSort={onSort} />

          <div className="flex items-center gap-1.5" style={{ marginLeft: "auto" }}>
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

            {/* Refresh — reuses DirectoryView's forced silent reload */}
            <ReloadButton
              onClick={onRefresh}
              loading={listRefreshing}
              disabled={loading}
              label="Refresh"
              text={null}
            />

            {/* ⋯ menu: "Select files" (off) / selection actions (on) */}
            <DirectoryActionsMenu
              selectionMode={selectionMode}
              selectedCount={selectedItems.length}
              allSelected={allSelected}
              canSelect={selectableRealItems.length > 0}
              bulkLoading={bulkLoading}
              onStartSelection={() => setSelectionMode(true)}
              onToggleSelectAll={() =>
                setSelectedItems(allSelected ? [] : selectableRealItems)
              }
              onDelete={() => selectedItems.length && onBulkConfirm()}
              onCancelSelection={onCancelSelection}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default DirectoryToolbar;
