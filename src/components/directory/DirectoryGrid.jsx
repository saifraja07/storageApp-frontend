import { memo } from "react";
import { FileCard, FileRow } from "../FileLists";
import { SkeletonCard, SkeletonRow } from "../SkeletonLoading";
import EmptyDirectory from "./EmptyDirectory";

const DirectoryGrid = memo(function DirectoryGrid({
  loading,
  viewMode,
  sorted,
  totalItems,
  searchQuery,
  q,
  itemProps,
}) {
  return (
    <>
      {/* Item count (left) + selected count while in selection mode (right) */}
      {!loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
            fontSize: 12,
            color: "var(--muted)",
            marginBottom: 10,
          }}
        >
          <span>
            {q
              ? `${sorted.length} result${sorted.length !== 1 ? "s" : ""} for "${q}"`
              : `${totalItems} item${totalItems !== 1 ? "s" : ""}`}
          </span>
          {itemProps.selectionMode && (
            <span
              aria-live="polite"
              style={{ flexShrink: 0, whiteSpace: "nowrap" }}
            >
              {itemProps.selectedIds.size} selected file
              {itemProps.selectedIds.size !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && viewMode === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12 }}>
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}
      {loading && viewMode === "list" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && sorted.length === 0 && (
        <EmptyDirectory searchQuery={searchQuery} />
      )}

      {/* Grid view */}
      {!loading && sorted.length > 0 && viewMode === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12 }}>
          {sorted.map((item) => (
            <FileCard
              key={(item._id || item.id) + String(item.isDirectory)}
              item={item}
              {...itemProps}
            />
          ))}
        </div>
      )}

      {/* List view */}
      {!loading && sorted.length > 0 && viewMode === "list" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
          {/* Header row */}
          <div
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 14px", borderBottom: "1px solid var(--border)",
              fontSize: 11, fontWeight: 600, color: "var(--muted)",
              textTransform: "uppercase", letterSpacing: 0.5,
            }}
          >
            <span style={{ fontSize: 17, flexShrink: 0, opacity: 0 }}>📁</span>
            <span style={{ flex: 1 }}>Name</span>
            <span style={{ minWidth: 55, textAlign: "right" }} className="hide-xs">Size</span>
            <span style={{ minWidth: 90, textAlign: "right" }} className="hide-sm">Modified</span>
            <span style={{ width: 30 }} />
          </div>
          {sorted.map((item) => (
            <FileRow
              key={(item._id || item.id) + String(item.isDirectory)}
              item={item}
              {...itemProps}
            />
          ))}
        </div>
      )}
    </>
  );
});

export default DirectoryGrid;
