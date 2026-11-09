import { useEffect, useRef } from "react";

// ── touch swipe to open / close a side drawer ─────────────────────────────
// Swipe right from the left side of the screen opens it; swipe left (from
// anywhere) closes it. No gesture library, and it never calls
// preventDefault, so scrolling and taps behave exactly as before.
//
// Uses touch events rather than pointer events (unlike useLongPress): once
// the browser takes over a pan, pointer events are cancelled mid-gesture,
// while touchmove keeps flowing for a horizontal swipe.
const OPEN_ZONE = 2 / 3; // an opening swipe must start in the left third
const DISTANCE = 60; // px of horizontal travel that counts as a swipe
const RATIO = 2; // …and it must be at least this much more horizontal than vertical
const LOCK_AFTER = 12; // px of vertical travel after which it's a scroll, not a swipe

// Touches that belong to something else: form fields, fixed overlays (modals,
// toasts, the bottom action bar) and horizontally scrollable areas.
function startsInBlockedArea(target) {
  if (!(target instanceof Element)) return true;
  if (target.closest("input, textarea, select, [contenteditable='true']")) return true;
  for (let el = target; el && el !== document.documentElement; el = el.parentElement) {
    const style = getComputedStyle(el);
    if (style.position === "fixed") return true;
    const scrollsX = style.overflowX === "auto" || style.overflowX === "scroll";
    if (scrollsX && el.scrollWidth > el.clientWidth) return true;
  }
  return false;
}

export function useSwipeDrawer({ enabled, isOpen, onOpen, onClose }) {
  // Latest values live in a ref so the listeners below are attached once per
  // `enabled` change, not re-attached on every drawer toggle.
  const latest = useRef({ isOpen, onOpen, onClose });

  useEffect(() => {
    latest.current = { isOpen, onOpen, onClose };
  }, [isOpen, onOpen, onClose]);

  useEffect(() => {
    if (!enabled) return;
    let origin = null; // { x, y } while a candidate swipe is being tracked

    const onTouchStart = (e) => {
      origin = null;
      if (e.touches.length !== 1) return; // ignore pinch / multi-touch
      // Elements that handle their own swipes (e.g. toasts) opt out, open or closed
      if (e.target instanceof Element && e.target.closest("[data-no-drawer-swipe]")) return;
      const touch = e.touches[0];
      if (!latest.current.isOpen) {
        if (touch.clientX > window.innerWidth * OPEN_ZONE) return;
        if (startsInBlockedArea(e.target)) return;
      }
      origin = { x: touch.clientX, y: touch.clientY };
    };

    const onTouchMove = (e) => {
      if (!origin) return;
      const touch = e.touches[0];
      const dx = touch.clientX - origin.x;
      const dy = touch.clientY - origin.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (absY > LOCK_AFTER && absY > absX) {
        origin = null; // vertical scroll — leave it alone
        return;
      }
      if (absX < DISTANCE || absX < absY * RATIO) return;

      origin = null; // one action per gesture
      const { isOpen: open, onOpen: openDrawer, onClose: closeDrawer } = latest.current;
      if (dx > 0 && !open) openDrawer();
      else if (dx < 0 && open) closeDrawer();
    };

    const reset = () => {
      origin = null;
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", reset, { passive: true });
    document.addEventListener("touchcancel", reset, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", reset);
      document.removeEventListener("touchcancel", reset);
    };
  }, [enabled]);
}
