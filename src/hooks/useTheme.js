import { useThemeContext } from "../context/ThemeContext";

// ── theme hook ─────────────────────────────────────────────────────────────
// theme: the user's selected preference ("light" | "dark" | "system")
// resolvedTheme: the actual appearance currently applied ("light" | "dark")
// setTheme: updates the preference and persists it
export function useTheme() {
  const ctx = useThemeContext();
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
