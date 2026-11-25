import { memo } from "react";
import { Search, X } from "lucide-react";

/**
 * Shared search field presentation. Search state, debouncing and filtering stay
 * with the page that owns the search workflow.
 */
const SearchInput = memo(function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  ariaLabel = "Search",
  className = "",
  maxWidthClassName = "max-w-80",
}) {
  const hasValue = value.length > 0;

  return (
    <div
      className={`relative min-w-0 w-full ${maxWidthClassName} flex-[1_1_200px] ${className}`.trim()}
    >
      <Search
        size={14}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 10,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--muted)",
          pointerEvents: "none",
          zIndex: 1,
          flexShrink: 0,
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
        spellCheck={false}
        className="h-[37.5px] w-full rounded-lg border border-(--border) bg-(--surface-tint) text-[13px] text-(--text) outline-none transition-colors placeholder:text-(--muted) focus:border-(--primary)"
        style={{
          fontFamily: "Inter,sans-serif",
          paddingLeft: 34,
          paddingRight: hasValue ? 34 : 12,
          boxSizing: "border-box",
          minWidth: 0,
        }}
        onFocus={(event) => {
          event.currentTarget.style.borderColor = "var(--primary)";
        }}
        onBlur={(event) => {
          event.currentTarget.style.borderColor = "var(--border)";
        }}
      />
      {hasValue && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          title="Clear search"
          className="absolute right-1.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-(--muted) transition-colors hover:bg-(--surface-tint-strong) hover:text-(--text) focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--primary)"
        >
          <X size={13} aria-hidden="true" />
        </button>
      )}
    </div>
  );
});

export default SearchInput;
