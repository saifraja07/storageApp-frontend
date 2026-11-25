
import { memo } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "../hooks/useIsMobile";
import { PAGE_SIZES, getPageItems } from "../utils/pagination";

// NOTE: spacing/sizing is inline on purpose. index.css has an unlayered
// `* { margin: 0; padding: 0 }` reset that overrides Tailwind's margin and
// padding utilities, so only colours/hover/focus use classes here.

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)";
const BUTTON_BASE =
  `inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border text-[13px] font-medium transition-[background-color,color,transform] duration-150 active:enabled:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`;
const BUTTON_IDLE =
  "border-(--border) bg-(--surface-hover) text-(--muted) hover:enabled:bg-(--surface-tint-strong) hover:enabled:text-(--text)";
const BUTTON_CURRENT = "border-transparent bg-(--primary) text-white";

// Every control (arrows, page numbers, active page, rows select) is 36 × 36.
// `flex: 0 1 36px` lets the squares give up a few px on very narrow phones
// instead of overflowing; at normal widths they stay exactly 36px.
const CONTROL = 36;
const SQUARE = {
  width: CONTROL,
  height: CONTROL,
  flex: `0 1 ${CONTROL}px`,
  minWidth: 0,
  padding: 0,
};

function RowsPerPage({ value, onChange, compact, size, disabled }) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        whiteSpace: "nowrap",
      }}
    >
      {compact ? "Size" : "Page Size"}
      <span style={{ position: "relative", display: "inline-flex" }}>
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="page size"
          className={`cursor-pointer appearance-none rounded-lg border border-(--border) bg-(--surface-hover) text-[13px] font-medium text-(--text) outline-none ${FOCUS}`}
          style={{ height: size, width: 60, padding: "0 20px 0 10px" }}
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className="pointer-events-none text-(--muted)"
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
      </span>
    </label>
  );
}

/**
 * Shared pagination bar: "Showing X–Y of Z", page size, and
 * Previous / page numbers / Next.
 *
 * Shown whenever the list is longer than the smallest page size, so the
 * rows-per-page selector stays reachable even after picking a size that fits
 * everything on one page (the page buttons only appear with 2+ pages).
 */
const Pagination = memo(function Pagination({
  pagination,
  onPageChange,
  onLimitChange,
  itemLabel = "items",
  isLoading = false,
}) {
  const isMobile = useIsMobile();

  if (!pagination || pagination.totalItems <= PAGE_SIZES[0]) return null;

  const { currentPage, totalPages, totalItems, limit } = pagination;
  const from = (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, totalItems);
  const hasPages = totalPages > 1;

  // Mobile shows only the current page in the middle.
  // Desktop shows the current page and one sibling on each side.
  const pageItems = getPageItems(currentPage, totalPages, isMobile ? 0 : 1);

  const info = (
    <div aria-live="polite" style={{ lineHeight: 1.5 }}>
      Showing{" "}
      <strong style={{ color: "var(--text)", fontWeight: 600 }}>
        {from}–{to}
      </strong>{" "}
      of{" "}
      <strong style={{ color: "var(--text)", fontWeight: 600 }}>
        {totalItems}
      </strong>{" "}
      {itemLabel}
    </div>
  );

  const rows = (
    <RowsPerPage
      value={limit}
      onChange={onLimitChange}
      compact={isMobile}
      size={CONTROL}
      disabled={isLoading}
    />
  );

  const buttons = hasPages && (
    <div
      style={{
        display: "flex",
        flexWrap: "nowrap",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: "100%",
        gap: "clamp(2px, 1vw, 4px)",
      }}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isLoading || currentPage <= 1}
        aria-label="Previous page"
        title="Previous page"
        className={`${BUTTON_BASE} ${BUTTON_IDLE}`}
        style={SQUARE}
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </button>

      {pageItems.map((item, index) =>
        typeof item === "string" ? (
          <span
            key={`${item}-${index}`}
            aria-hidden="true"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: CONTROL,
              flex: "0 1 20px",
              minWidth: 0,
              color: "var(--muted)",
            }}
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => !isLoading && item !== currentPage && onPageChange(item)}
            disabled={isLoading}
            aria-label={`Page ${item}`}
            aria-current={item === currentPage ? "page" : undefined}
            className={`${BUTTON_BASE} ${item === currentPage ? BUTTON_CURRENT : BUTTON_IDLE
              }`}
            style={{
              ...SQUARE,
              boxShadow:
                item === currentPage
                  ? "0 2px 10px rgba(59,130,246,0.35)"
                  : "none",
            }}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLoading || currentPage >= totalPages}
        aria-label="Next page"
        title="Next page"
        className={`${BUTTON_BASE} ${BUTTON_IDLE}`}
        style={SQUARE}
      >
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </div>
  );

  const frame = {
    marginBlock: 16,
    fontSize: 12.5,
    color: "var(--muted)",
  };

  return (
    <nav aria-label={`${itemLabel} pagination`} aria-busy={isLoading}>
      {isMobile ? (
        // Phone: page buttons first, details underneath.
        <div
          style={{
            ...frame,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {buttons}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            {info}
            {rows}
          </div>
        </div>
      ) : (
        <div
          style={{
            ...frame,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px 24px",
          }}
        >
          {info}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px 24px",
            }}
          >
            {rows}
            {buttons}
          </div>
        </div>
      )}
    </nav>
  );
});

export default Pagination;