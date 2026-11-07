import { memo } from "react";
import { LayoutGrid, List as ListIcon } from "lucide-react";

const OPTIONS = [
  ["grid", "Grid view", LayoutGrid],
  ["list", "List view", ListIcon],
];

// Segment size. The outer box is 32px tall (2px padding + 1px border each side),
// so it lines up with the other toolbar buttons.
const SEG_W = 30;
const SEG_H = 26;

// ── Connected Grid / List switch ──────────────────────────────────────────
// Both buttons live in one bordered box; a single highlight "thumb" slides
// under the active one.
const ViewToggle = memo(function ViewToggle({ viewMode, setViewMode }) {
  const index = viewMode === "list" ? 1 : 0;

  return (
    <div
      role="group"
      aria-label="View mode"
      className="relative inline-flex h-8 shrink-0 items-center rounded-lg border border-(--border) bg-(--surface-hover)"
      style={{ padding: 2 }}
    >
      <span
        aria-hidden="true"
        className="absolute rounded-md bg-(--primary) shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{
          top: 2,
          left: 2,
          width: SEG_W,
          height: SEG_H,
          transform: `translateX(${index * SEG_W}px)`,
        }}
      />
      {OPTIONS.map(([mode, label, Icon]) => {
        const active = viewMode === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => setViewMode(mode)}
            aria-label={label}
            aria-pressed={active}
            title={label}
            style={{ width: SEG_W, height: SEG_H }}
            className={[
              "relative z-10 inline-flex shrink-0 cursor-pointer items-center justify-center",
              "rounded-md border-0 bg-transparent transition-colors duration-200",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--primary)",
              active ? "text-white" : "text-(--muted) hover:text-(--text)",
            ].join(" ")}
          >
            <Icon size={16} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
});

export default ViewToggle;
