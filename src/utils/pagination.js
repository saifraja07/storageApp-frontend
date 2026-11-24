// Shared pagination constants/helpers (Admin Users + Directory).
// Page sizes mirror the backend allowlist (utils/pagination.js there).
export const PAGE_SIZES = [24, 50, 100];
export const DEFAULT_PAGE_SIZE = PAGE_SIZES[0];
export const SEARCH_DEBOUNCE_MS = 300;

/**
 * Page numbers to render, with ellipsis markers for skipped ranges.
 *
 * - siblings = 0 (mobile): current page only in the middle.
 * - siblings = 1 (desktop): current page + one sibling on each side.
 * - Near the beginning/end, show a compact run of 3 pages.
 * - Show a single skipped page instead of an ellipsis.
 */
export function getPageItems(currentPage, totalPages, siblings = 1) {
  const range = (from, to) =>
    Array.from(
      { length: Math.max(0, to - from + 1) },
      (_, i) => from + i
    );

  if (totalPages <= 0) return [];

  const edgeRun = 3;

  // Show all pages when the total count is small.
  if (totalPages <= edgeRun + 2) {
    return range(1, totalPages);
  }

  // Beginning: first 3 pages and the last page.
  if (currentPage <= 2) {
    return [...range(1, edgeRun), "end-ellipsis", totalPages];
  }

  // End: first page and the last 3 pages.
  if (currentPage >= totalPages - 1) {
    return [1, "start-ellipsis", ...range(totalPages - edgeRun + 1, totalPages),
    ];
  }

  const left = currentPage - siblings;
  const right = currentPage + siblings;

  const items = [1];

  // Handle the gap before the visible window.
  if (left > 2) {
    items.push(left === 3 ? 2 : "start-ellipsis");
  }

  // Add the visible page window exactly once.
  items.push(...range(left, right));

  // Handle the gap after the visible window.
  if (right < totalPages - 1) {
    items.push(
      right === totalPages - 2 ? totalPages - 1 : "end-ellipsis"
    );
  }

  items.push(totalPages);

  return items;
}


// After the page changes, bring the top of the list back into view (the
// pagination bar sits below a long list, so the new page would otherwise start
// out of sight). Does nothing when the top is already visible.
export function scrollListIntoView(element) {
  if (element && element.getBoundingClientRect().top < 0) {
    element.scrollIntoView({ block: "start" });
  }
}