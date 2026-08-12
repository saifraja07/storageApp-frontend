import { useEffect, useRef, useState } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

// ── ThemeSelector — compact icon-only navbar control for Light / Dark / System.
// Sized to match the profile button beside it (40x40, same radius/border/bg)
// so the two controls read as a single row of nav actions.
export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const menuRef = useRef(null);

  const current = OPTIONS.find((o) => o.value === theme) || OPTIONS[2];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape, return focus to the trigger button
  useEffect(() => {
    if (!open) return undefined;
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setOpen(false);
        ref.current?.querySelector("button")?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label={`Theme: ${current.label}. Click to change theme.`}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          borderRadius: 9,
          border: "1px solid var(--border)",
          background: open ? "rgba(59,130,246,0.1)" : "var(--surface-tint)",
          color: "var(--text)",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
        onMouseOver={(e) => {
          if (!open) e.currentTarget.style.background = "var(--surface-hover)";
        }}
        onMouseOut={(e) => {
          if (!open) e.currentTarget.style.background = "var(--surface-tint)";
        }}
      >
        <current.icon size={16} aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Theme options"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 4,
            zIndex: 200,
            minWidth: 150,
            boxShadow: "0 8px 32px var(--shadow-color)",
          }}
        >
          {OPTIONS.map((opt) => {
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setTheme(opt.value);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "8px 12px",
                  background: active ? "rgba(59,130,246,0.12)" : "none",
                  border: "none",
                  color: active ? "var(--status-blue-text)" : "var(--text)",
                  fontSize: 13,
                  cursor: "pointer",
                  borderRadius: 6,
                  textAlign: "left",
                  fontFamily: "Inter,sans-serif",
                }}
                onMouseOver={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "var(--surface-hover)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "none";
                  }
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "flex" }}>
                    <opt.icon size={14} aria-hidden="true" />
                  </span>
                  {opt.label}
                </span>
                {active && (
                  <span style={{ display: "flex" }}>
                    <Check size={13} aria-hidden="true" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
