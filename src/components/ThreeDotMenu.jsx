import { useEffect, useRef, useState } from "react";
import { EllipsisVertical } from "lucide-react";

// ── Three-dot menu ────────────────────────────────────────────────────────────
function ThreeDotMenu({ item, onRename, onDelete, onDetails, onDownload }) {
  const [open, setOpen] = useState(false);
const [openUp, setOpenUp] = useState(false);

  const ref = useRef(null);
  useEffect(() => {
    function h(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const actions = [
    ...(!item.isDirectory ? [{ label: "Download", action: onDownload }] : []),
    { label: "Rename", action: onRename },
    { label: "Details", action: onDetails },
    { divider: true },
    { label: "Delete", action: onDelete, danger: true },
  ];

  return (
    <div
      ref={ref}
      style={{ position: "relative" }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
       onClick={(e) => {
  const rect = e.currentTarget.getBoundingClientRect();

  const menuHeight = 180;

  setOpenUp(
    rect.bottom + menuHeight > window.innerHeight
  );

  setOpen((p) => !p);
}}
        style={{
          width: 30,
          height: 30,
          background: open ? "var(--surface-hover)" : "transparent",
          border: "none",
          borderRadius: 6,
          color: "var(--muted)",
          cursor: "pointer",
          fontSize: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.background = "var(--surface-hover)")
        }
        onMouseOut={(e) =>
          !open && (e.currentTarget.style.background = "transparent")
        }
        title="More options"
        aria-label="More options"
      >
        <EllipsisVertical size={16} aria-hidden="true" />
      </button>
      {open && (
        <div
         style={{
  position: "absolute",
  right: 0,

  ...(openUp
    ? { bottom: 34 }
    : { top: 34 }),

  background: "#1a2433",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: 4,
  zIndex: 220,
  minWidth: 160,
  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
}}
        >
          {actions.map((a, i) =>
            a.divider ? (
              <div
                key={i}
                style={{
                  height: 1,
                  background: "var(--border)",
                  margin: "3px 0",
                }}
              />
            ) : (
              <button
                key={a.label}
                onClick={() => {
                  a.action();
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "8px 12px",
                  background: "none",
                  border: "none",
                  color: a.danger ? "#F87171" : "var(--text)",
                  fontSize: 13,
                  cursor: "pointer",
                  borderRadius: 6,
                  textAlign: "left",
                  fontFamily: "Inter,sans-serif",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = a.danger
                    ? "rgba(239,68,68,0.1)"
                    : "var(--surface-hover)")
                }
                onMouseOut={(e) => (e.currentTarget.style.background = "none")}
              >
                {a.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

export default ThreeDotMenu;