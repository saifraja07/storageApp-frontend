import { useCallback, useEffect, useMemo, useRef } from "react";
import { prefersReducedMotion } from "../utils/motion";

// ── touch swipe-to-dismiss ────────────────────────────────────────────────
// Pointer-events based (no gesture library), like useLongPress. The element
// follows the finger sideways and fades; on release it either flies off and
// calls onDismiss() (dragged far enough, or flicked) or snaps back. Only
// touch / pen drag — on desktop the mouse has the toast's × button.
//
// onHold / onRelease fire when a finger goes down / comes up, so the caller
// can pause auto-dismiss while the toast is being touched.
//
// The element needs `touch-action: pan-y` (returned as `style`): the browser
// keeps vertical scrolling but hands horizontal movement to us instead of
// cancelling the pointer.
const LOCK = 10; // px of travel before a touch counts as a drag (not a tap)
const DISMISS_RATIO = 0.4; // dragged past this share of its width → dismiss
const FLICK_SPEED = 0.5; // px/ms — a quick flick dismisses even a short drag…
const FLICK_MIN = 24; // …as long as it moved at least this far
const FLY_MS = 180;
const SNAP_MS = 200;

// Current horizontal offset of an element mid-animation (0 if unknown).
function currentTranslateX(el) {
  try {
    return new DOMMatrix(getComputedStyle(el).transform).m41 || 0;
  } catch {
    return 0;
  }
}

export function useSwipeDismiss({ onDismiss, onHold, onRelease, enabled = true }) {
  const callbacks = useRef({ onDismiss, onHold, onRelease });
  const drag = useRef(null); // the gesture in progress, if any
  const timer = useRef(null); // pending fly-out / snap-back cleanup
  const dismissing = useRef(false);
  const lastDragEnd = useRef(0);

  useEffect(() => {
    callbacks.current = { onDismiss, onHold, onRelease };
  }, [onDismiss, onHold, onRelease]);

  // If the element goes away mid-gesture, never leave a timer or a pause behind.
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      if (drag.current) callbacks.current.onRelease?.();
    },
    [],
  );

  const settle = useCallback((el, dismiss, dir) => {
    clearTimeout(timer.current);
    if (dismiss) {
      dismissing.current = true;
      const ms = prefersReducedMotion() ? 0 : FLY_MS;
      el.style.transition = ms
        ? `transform ${ms}ms ease-out, opacity ${ms}ms ease-out`
        : "none";
      el.style.transform = `translateX(${dir * window.innerWidth}px)`;
      el.style.opacity = "0";
      timer.current = setTimeout(() => callbacks.current.onDismiss?.(), ms);
      return;
    }
    const ms = prefersReducedMotion() ? 0 : SNAP_MS;
    el.style.transition = ms
      ? `transform ${ms}ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity ${ms}ms ease`
      : "none";
    el.style.transform = "translateX(0)";
    el.style.opacity = "1";
    timer.current = setTimeout(() => {
      el.style.transition = "";
      el.style.transform = "";
      el.style.opacity = "";
    }, ms);
  }, []);

  const onPointerDown = useCallback(
    (e) => {
      if (!enabled || dismissing.current || drag.current) return;
      if (e.pointerType === "mouse" || !e.isPrimary) return;
      clearTimeout(timer.current); // grabbed again while snapping back
      const el = e.currentTarget;
      drag.current = {
        id: e.pointerId,
        el,
        x: e.clientX,
        y: e.clientY,
        base: currentTranslateX(el),
        width: el.offsetWidth || 1,
        locked: false,
        slop: 0,
        pos: 0,
        vx: 0,
        mark: { x: e.clientX, t: e.timeStamp },
        lastMoveT: e.timeStamp,
      };
      callbacks.current.onHold?.();
    },
    [enabled],
  );

  const onPointerMove = useCallback((e) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;

    if (!d.locked) {
      if (Math.abs(dy) > LOCK && Math.abs(dy) > Math.abs(dx)) {
        drag.current = null; // vertical scroll — not ours
        callbacks.current.onRelease?.();
        return;
      }
      if (Math.abs(dx) < LOCK) return;
      d.locked = true;
      d.slop = Math.sign(dx) * LOCK; // start from 0 so the toast doesn't jump
      d.el.style.transition = "none";
      try {
        d.el.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already gone */
      }
    }

    d.pos = d.base + dx - d.slop;
    d.el.style.transform = `translateX(${d.pos}px)`;
    d.el.style.opacity = String(Math.max(0, 1 - Math.abs(d.pos) / d.width));

    // Velocity over windows of at least 40 ms, so one noisy sample can't fake a flick
    const dt = e.timeStamp - d.mark.t;
    if (dt >= 40) {
      d.vx = (e.clientX - d.mark.x) / dt;
      d.mark = { x: e.clientX, t: e.timeStamp };
    }
    d.lastMoveT = e.timeStamp;
  }, []);

  const onPointerUp = useCallback(
    (e) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.id) return;
      drag.current = null;
      callbacks.current.onRelease?.();
      if (!d.locked) return; // a plain tap — let the click through

      lastDragEnd.current = e.timeStamp;
      const held = e.timeStamp - d.lastMoveT > 80; // paused before letting go
      const vx = held ? 0 : d.vx;
      const dist = Math.abs(d.pos);
      const far = dist > d.width * DISMISS_RATIO;
      const flick =
        Math.abs(vx) > FLICK_SPEED && dist > FLICK_MIN && Math.sign(vx) === Math.sign(d.pos);
      settle(d.el, far || flick, Math.sign(d.pos) || 1);
    },
    [settle],
  );

  const onPointerCancel = useCallback(
    (e) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.id) return;
      drag.current = null;
      callbacks.current.onRelease?.();
      if (d.locked) settle(d.el, false);
    },
    [settle],
  );

  // A drag that started on a button (e.g. the ×) must not also click it.
  const onClickCapture = useCallback((e) => {
    if (e.timeStamp - lastDragEnd.current > 100) return;
    e.stopPropagation();
    e.preventDefault();
  }, []);

  return useMemo(
    () => ({
      handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClickCapture },
      style: { touchAction: "pan-y" },
    }),
    [onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClickCapture],
  );
}
