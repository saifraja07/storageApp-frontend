import { memo, useState, useSyncExternalStore } from "react";
import { RefreshCw } from "lucide-react";

const SMALL_SCREEN = "(max-width: 600px)";

// Subscribes to a media query; re-renders only when the match flips.
function useMediaQuery(query) {
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/**
 * Shared reload button: icon + text, collapsing to icon-only on screens <= 600px.
 *
 * - `loading`  → icon spins, button is disabled and marked aria-busy.
 *                The spin always finishes at least one full turn, so even a
 *                very fast response still shows feedback instead of a blink.
 * - `disabled` → extra reasons to disable (e.g. the page's first load)
 * - `label`    → tooltip + accessible name ("Refresh users")
 * - `text`     → visible text beside the icon (default "Refresh"); hidden on small
 *                screens, or pass null for icon-only everywhere
 * - `style`    → layout tweaks from the parent. Margins and padding must be
 *                inline: index.css has an unlayered `* { margin: 0; padding: 0 }`
 *                reset, which beats Tailwind's margin/padding utilities.
 */
const ReloadButton = memo(function ReloadButton({
  onClick,
  loading = false,
  disabled = false,
  label = "Refresh",
  text = "Refresh",
  style,
}) {
  const isSmall = useMediaQuery(SMALL_SCREEN);
  const showText = Boolean(text) && !isSmall;

  // `spinning` outlives `loading` until the current rotation completes.
  // Note: no `motion-reduce` override on purpose. This spinner is the only
  // "loading" feedback, and the rest of the app's spinners don't honour it either.
  const [spinning, setSpinning] = useState(false);
  if (loading && !spinning) setSpinning(true);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      aria-label={label}
      aria-busy={loading}
      title={label}
      style={{ ...(showText ? { paddingInline: 12 } : null), ...style }}
      className={[
        "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5",
        showText ? "text-[13px] font-medium whitespace-nowrap" : "w-8",
        "rounded-lg border border-(--border) bg-(--surface-hover) text-(--muted)",
        "transition-colors",
        "hover:enabled:bg-(--surface-tint-strong) hover:enabled:text-(--text)",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)",
        "disabled:cursor-not-allowed disabled:opacity-60",
      ].join(" ")}
    >
      <RefreshCw
        size={15}
        aria-hidden="true"
        className={spinning ? "animate-spin" : ""}
        onAnimationIteration={() => {
          if (!loading) setSpinning(false);
        }}
      />
      {showText && text}
    </button>
  );
});

export default ReloadButton;
