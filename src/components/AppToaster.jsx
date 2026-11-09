import { useCallback, useLayoutEffect, useRef } from "react";
import { ToastBar, toast, useToaster } from "react-hot-toast";
import { X } from "lucide-react";
import { useSwipeDismiss } from "../hooks/useSwipeDismiss";
import { prefersReducedMotion } from "../utils/motion";

const POSITION = "top-center";
const GUTTER = 8; // gap between stacked toasts (react-hot-toast's default)
const EDGE = 16; // distance from the viewport edge (react-hot-toast's default)

// ── Toast theme (moved here from main.jsx, values unchanged) ──────────────
const TOAST_OPTIONS = {
  duration: 3500,
  style: {
    background: "var(--surface-hover)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    borderRadius: 8,
    fontSize: 13,
    boxShadow: "0 8px 24px var(--shadow-color)",
  },
  success: {
    style: {
      background: "var(--surface-hover)",
      border: "1px solid rgba(52,211,153,0.35)",
      color: "var(--text)",
    },
    iconTheme: { primary: "#34D399", secondary: "var(--surface-hover)" },
  },
  error: {
    style: {
      background: "var(--surface-hover)",
      border: "1px solid rgba(239,68,68,0.35)",
      color: "var(--text)",
    },
    iconTheme: { primary: "#EF4444", secondary: "var(--surface-hover)" },
  },
};

// ── One toast: stack position, swipe-to-dismiss and the × button ──────────
// Loading toasts have neither × nor swipe, so an in-progress action can't be
// hidden before its success/error result replaces it.
function ToastItem({ t, offset, onHeight, onHold, onRelease }) {
  const ref = useRef(null);

  // Report the toast's height so the toasts below it can be offset (same as
  // react-hot-toast's own Toaster does).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => onHeight(t.id, el.getBoundingClientRect().height);
    update();
    const observer = new MutationObserver(update);
    observer.observe(el, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [t.id, onHeight]);

  const dismissible = t.type !== "loading";
  const dismiss = useCallback(() => toast.dismiss(t.id), [t.id]);
  const swipe = useSwipeDismiss({
    enabled: t.visible && dismissible,
    onDismiss: dismiss,
    onHold,
    onRelease,
  });

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        transform: `translateY(${offset}px)`,
        transition: prefersReducedMotion() ? undefined : "all 230ms cubic-bezier(.21,1.02,.73,1)",
        zIndex: t.visible ? 9999 : undefined,
        pointerEvents: "none", // only the toast itself takes touches, not its full-width row
      }}
    >
      <div
        {...swipe.handlers}
        style={{ ...swipe.style, pointerEvents: t.visible ? "auto" : "none" }}
      >
        <ToastBar toast={t} position={POSITION}>
          {({ icon, message }) => (
            <>
              {icon}
              {message}
              {dismissible && (
                <button
                  type="button"
                  onClick={dismiss}
                  aria-label="Dismiss notification"
                  title="Dismiss"
                  className={[
                    "ml-1 inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center",
                    "rounded-md bg-transparent text-(--muted) transition-colors",
                    "hover:bg-(--surface-tint-strong) hover:text-(--text)",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)",
                  ].join(" ")}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </>
          )}
        </ToastBar>
      </div>
    </div>
  );
}

// ── App-wide toaster ──────────────────────────────────────────────────────
// Built on react-hot-toast's headless `useToaster` (same rendering as its
// <Toaster>) so each toast can pause auto-dismiss while a finger is on it.
// Mouse hover still pauses too; touch is handled per toast, which also avoids
// the "stays paused after a tap" behaviour of emulated mouse events.
export default function AppToaster() {
  const { toasts, handlers } = useToaster(TOAST_OPTIONS);
  const { startPause, endPause, calculateOffset, updateHeight } = handlers;

  return (
    <div
      data-no-drawer-swipe
      style={{ position: "fixed", zIndex: 9999, inset: EDGE, pointerEvents: "none" }}
      onPointerEnter={(e) => e.pointerType === "mouse" && startPause()}
      onPointerLeave={(e) => e.pointerType === "mouse" && endPause()}
    >
      {toasts.map((t) => (
        <ToastItem
          key={t.id}
          t={t}
          offset={calculateOffset(t, { gutter: GUTTER, defaultPosition: POSITION })}
          onHeight={updateHeight}
          onHold={startPause}
          onRelease={endPause}
        />
      ))}
    </div>
  );
}
