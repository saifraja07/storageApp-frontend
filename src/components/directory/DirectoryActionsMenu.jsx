import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Ellipsis, ListChecks, CheckCheck, ListX, Trash2, X, Info } from "lucide-react";

// ── Toolbar ⋯ menu ────────────────────────────────────────────────────────
// One trigger, two menus:
//   selection OFF → "Select files"
//   selection ON  → Select all / Deselect all, Delete (N), Cancel selection
// All real work is delegated to callbacks owned by DirectoryView.

const ITEM_CLASS = [
  "flex w-full cursor-pointer items-center gap-2 rounded-md border-0 bg-transparent",
  "text-left text-[13px] font-[Inter,sans-serif]",
  "enabled:hover:bg-(--surface-hover) focus-visible:bg-(--surface-hover)",
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--primary)",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "pointer-coarse:min-h-11", // comfortable ≥44px touch target on touch screens
].join(" ");

const DirectoryActionsMenu = memo(function DirectoryActionsMenu({
  selectionMode,
  selectedCount,
  allSelected,
  canSelect,
  bulkLoading,
  onStartSelection,
  onToggleSelectAll,
  onDelete,
  onProperties,
  onCancelSelection,
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  // Outside click / Escape — listeners exist only while the menu is open.
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    // Capture phase + preventDefault: DirectoryView's page-level Escape handler
    // sees `defaultPrevented` and leaves selection mode alone, so Escape closes
    // just the menu first.
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      close(true);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, close]);

  // Keyboard users land on the first enabled item.
  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector("[role='menuitem']:not(:disabled)")?.focus();
  }, [open]);

  const onMenuKeyDown = (e) => {
    const items = [...menuRef.current.querySelectorAll("[role='menuitem']:not(:disabled)")];
    if (!items.length) return;
    const i = items.indexOf(document.activeElement);
    const go = (n) => {
      e.preventDefault();
      items[(n + items.length) % items.length].focus();
    };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(items.length - 1);
    else if (e.key === "Tab") setOpen(false);
  };

  const run = (fn) => () => {
    setOpen(false);
    fn();
  };

  const canDelete = selectedCount > 0 && !bulkLoading;

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label={selectionMode ? "Selection actions" : "More actions"}
        title={selectionMode ? "Selection actions" : "More actions"}
        aria-haspopup="menu"
        aria-expanded={open}
        className={[
          "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border",
          "transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)",
          selectionMode || open
            ? "border-(--primary) bg-[rgba(59,130,246,0.12)] text-(--primary)"
            : "border-(--border) bg-(--surface-hover) text-(--muted) hover:bg-(--surface-tint-strong) hover:text-(--text)",
        ].join(" ")}
      >
        <Ellipsis size={16} aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={selectionMode ? "Selection actions" : "Actions"}
          onKeyDown={onMenuKeyDown}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: 180,
            padding: 4,
            zIndex: 200,
            background: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            boxShadow: "0 8px 32px var(--shadow-color)",
          }}
        >
          {!selectionMode ? (
            <button
              type="button"
              role="menuitem"
              disabled={!canSelect}
              onClick={run(onStartSelection)}
              className={`${ITEM_CLASS} text-(--text)`}
              style={{ padding: "9px 12px" }}
            >
              <ListChecks size={15} aria-hidden="true" />
              Select files
            </button>
          ) : (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={run(onToggleSelectAll)}
                className={`${ITEM_CLASS} text-(--text)`}
                style={{ padding: "9px 12px" }}
              >
                {allSelected ? (
                  <ListX size={15} aria-hidden="true" />
                ) : (
                  <CheckCheck size={15} aria-hidden="true" />
                )}
                {allSelected ? "Deselect all" : "Select all"}
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={selectedCount === 0}
                onClick={run(onProperties)}
                className={`${ITEM_CLASS} text-(--text)`}
                style={{ padding: "9px 12px" }}
              >
                <Info size={15} aria-hidden="true" />
                Properties
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={!canDelete}
                onClick={run(onDelete)}
                className={`${ITEM_CLASS} text-(--status-red-text-strong)`}
                style={{ padding: "9px 12px" }}
              >
                <Trash2 size={15} aria-hidden="true" />
                Delete ({selectedCount})
              </button>
              <div style={{ height: 1, background: "var(--border)", margin: "3px 0" }} />
              <button
                type="button"
                role="menuitem"
                onClick={run(onCancelSelection)}
                className={`${ITEM_CLASS} text-(--text)`}
                style={{ padding: "9px 12px" }}
              >
                <X size={15} aria-hidden="true" />
                Cancel selection
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
});

export default DirectoryActionsMenu;
