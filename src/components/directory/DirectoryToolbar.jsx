import { memo } from "react";
import SortDropdown from "../SortDropdown";
import ReloadButton from "../ReloadButton";
import SearchInput from "../SearchInput";
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
  onProperties,
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
        {/* Shared search field — full-width row on narrow toolbars */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search files and folders…"
          ariaLabel="Search files and folders"
          maxWidthClassName="max-w-[340px] @max-[480px]:max-w-none @max-[480px]:basis-full"
        />

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
              onProperties={onProperties}
              onCancelSelection={onCancelSelection}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default DirectoryToolbar;
