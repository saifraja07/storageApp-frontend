// True when the user has asked the OS/browser to cut down on animation.
export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
