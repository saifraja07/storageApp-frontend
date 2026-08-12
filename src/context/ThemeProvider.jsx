import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./ThemeContext";

const STORAGE_KEY = "haadi-cloud-theme";
const VALID_THEMES = ["light", "dark", "system"];

// ── Safe localStorage helpers — never throw, never crash the app ─────────
function readStoredTheme() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return VALID_THEMES.includes(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

function persistTheme(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // localStorage unavailable (private browsing, quota, etc). Theme still
    // works for the current session — it just won't persist.
  }
}

// ── Safe OS preference check ──────────────────────────────────────────────
function getSystemPrefersDark() {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return true; // falls back to the app's original dark appearance
  }
}

function resolve(theme) {
  return theme === "system" ? (getSystemPrefersDark() ? "dark" : "light") : theme;
}

export default function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState(() => resolve(readStoredTheme()));

  // Apply the resolved theme to the document root so every component
  // (including plain CSS, not just React state) can react to it.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  // Remove the transition-suppression class after the first paint so the
  // very first render never animates, but every change afterwards does.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      document.documentElement.classList.remove("theme-init-pending");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Keep resolvedTheme in sync whenever the user's preference changes.
  useEffect(() => {
    setResolvedTheme(resolve(theme));
  }, [theme]);

  // Listen for OS-level changes only while "system" is selected.
  useEffect(() => {
    if (theme !== "system") return undefined;

    let mediaQuery;
    try {
      mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    } catch {
      return undefined;
    }

    const handleChange = (e) => {
      setResolvedTheme(e.matches ? "dark" : "light");
    };

    // addEventListener is the modern API; addListener is the Safari <14 fallback.
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (!VALID_THEMES.includes(next)) return;
    setThemeState(next);
    persistTheme(next);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
