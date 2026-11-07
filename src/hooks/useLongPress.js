import { useCallback, useEffect, useMemo, useRef } from "react";

// ── touch long-press ──────────────────────────────────────────────────────
// Pointer-events based (no gesture library). Only touch / pen start a
// long-press: on desktop the mouse has right-click for the same job.
export function useLongPress(onLongPress, { delay = 480, tolerance = 10 } = {}) {
  const timer = useRef(null);
  const origin = useRef(null);
  const fired = useRef(false);
  const callback = useRef(onLongPress);

  useEffect(() => {
    callback.current = onLongPress;
  }, [onLongPress]);

  const clear = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => clear, [clear]);

  const onPointerDown = useCallback(
    (e) => {
      fired.current = false; // a fresh gesture never inherits a stale flag
      clear();
      if (e.pointerType === "mouse" || !e.isPrimary) return;
      // Let the item's own buttons (e.g. its ⋮ menu) behave normally
      if (e.target instanceof Element && e.target.closest("button, [role='menu']")) return;
      origin.current = { x: e.clientX, y: e.clientY };
      timer.current = setTimeout(() => {
        timer.current = null;
        fired.current = true;
        navigator.vibrate?.(15);
        callback.current?.();
      }, delay);
    },
    [clear, delay],
  );

  const onPointerMove = useCallback(
    (e) => {
      if (timer.current === null || !origin.current) return;
      const dx = e.clientX - origin.current.x;
      const dy = e.clientY - origin.current.y;
      if (Math.hypot(dx, dy) > tolerance) clear();
    },
    [clear, tolerance],
  );

  const shouldIgnoreClick = useCallback(() => {
    if (!fired.current) return false;
    fired.current = false;
    return true;
  }, []);

  return useMemo(
    () => ({
      handlers: {
        onPointerDown,
        onPointerMove,
        onPointerUp: clear,
        onPointerCancel: clear,
        onPointerLeave: clear,
      },
      shouldIgnoreClick,
    }),
    [onPointerDown, onPointerMove, clear, shouldIgnoreClick],
  );
}
