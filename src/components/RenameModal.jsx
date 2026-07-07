import { useEffect, useRef } from "react";
import { Pencil } from "lucide-react";
import Modal from "./Modal";
import { inputStyle } from "../utils/directoryUtils";


export default function RenameModal({
  showRename,
  renameType,
  renameValue,
  setRenameValue,
  handleRenameSubmit,
  setShowRename,
  isLoading,
}) {
  const inputRef = useRef(null);

  const handleClose = () => {
    if (!isLoading) setShowRename(false);
  };

  const isDisabled = isLoading || !renameValue.trim();
  const isFile = renameType === "file";

  useEffect(() => {
    if (!showRename) return;

    // Small timeout to let the modal render before focusing
    const id = setTimeout(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      if (isFile) {
        const lastDot = el.value.lastIndexOf(".");
        const end = lastDot > 0 ? lastDot : el.value.length;
        el.setSelectionRange(0, end);
      } else {
        el.select();
      }
    }, 0);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRename]); // intentionally omit renameValue/isFile — only run on open

  if (!showRename) return null;

  return (
    <Modal  title={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Pencil size={16} aria-hidden="true" /> Rename {isFile ? "File" : "Folder"}
        </span>
      } onClose={handleClose}>
      <form onSubmit={handleRenameSubmit}>
        <label style={{
          display: "block", fontSize: 12, fontWeight: 600,
          color: "var(--muted)", marginBottom: 6,
          textTransform: "uppercase", letterSpacing: 0.5,
        }}>
          New {isFile ? "File" : "Folder"} Name
        </label>
        <input
          ref={inputRef}
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          disabled={isLoading}
          style={{ ...inputStyle(), opacity: isLoading ? 0.6 : 1 }}
          onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          onKeyDown={(e) => e.key === "Escape" && handleClose()}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            style={{
              flex: 1, padding: 10,
              background: "var(--surface-hover)",
              border: "1px solid var(--border)",
              borderRadius: 8, color: "var(--text)",
              fontSize: 14, cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "Inter,sans-serif",
              opacity: isLoading ? 0.5 : 1,
            }}
            onMouseOver={(e) => !isLoading && (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isDisabled}
            style={{
              flex: 1, padding: 10, background: "var(--primary)",
              color: "#fff", border: "none", borderRadius: 8,
              fontSize: 14, fontWeight: 600,
              cursor: isDisabled ? "not-allowed" : "pointer",
              fontFamily: "Inter,sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: isDisabled ? 0.6 : 1,
            }}
            onMouseOver={(e) => !isDisabled && (e.currentTarget.style.background = "#2563EB")}
            onMouseOut={(e) => (e.currentTarget.style.background = "var(--primary)")}
          >
            {isLoading && (
              <span style={{
                display: "inline-block",
                width: 13, height: 13,
                border: "2px solid rgba(255,255,255,0.35)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
                flexShrink: 0,
              }} />
            )}
            {isLoading ? "Renaming…" : "Rename"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
