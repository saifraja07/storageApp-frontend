import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { X, TriangleAlert, Check } from "lucide-react";
import { subscribe, getSnapshot, cancelAll } from "../utils/uploadManager";
import { formatStorage, formatSpeed } from "../utils/directoryUtils";

// ── Global Upload Progress Card ────────────────────────────────────────────
export default function UploadProgressBar() {
  const state = useSyncExternalStore(subscribe, getSnapshot);
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const hideTimerRef = useRef(null);
  // Freeze the last non-idle snapshot so the exit fade shows the final
  // progress/complete/error state instead of flashing back to 0 while
  // the store resets underneath it.
  const displaySnapshotRef = useRef(state);
  if (state.phase !== "idle") displaySnapshotRef.current = state;
  const display = state.phase === "idle" ? displaySnapshotRef.current : state;

  useEffect(() => {
    if (state.phase !== "idle") {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      setMounted(true);
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setEntered(true)),
      );
      return () => cancelAnimationFrame(raf);
    }
    if (mounted) {
      setEntered(false);
      hideTimerRef.current = setTimeout(() => setMounted(false), 260);
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  if (!mounted) return null;

  const isComplete = display.phase === "complete";
  const isError = display.phase === "error";
  const speedLabel = formatSpeed(display.uploadSpeed);

  return (
    <div
      style={{
        maxHeight: entered ? 140 : 0,
        opacity: entered ? 1 : 0,
        transform: entered ? "translateY(0)" : "translateY(-6px)",
        marginBottom: entered ? 14 : 0,
        overflow: "hidden",
        transition:
          "max-height 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease, transform 0.22s ease, margin-bottom 0.28s ease",
      }}
    >
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 14,
          background: "var(--surface)",
          padding: "14px 16px",
        }}
      >
        {isComplete || isError ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
              color: isError
                ? "#F87171"
                : display.failedFiles > 0
                  ? "#F59E0B"
                  : "#10B981",
            }}
          >
            <span style={{ display: "flex" }}>
              {isError ? (
                <X size={15} aria-hidden="true" />
              ) : display.failedFiles > 0 ? (
                <TriangleAlert size={15} aria-hidden="true" />
              ) : (
                <Check size={15} aria-hidden="true" />
              )}
            </span>
            {isError
              ? display.errorMessage || "Upload failed"
              : display.failedFiles > 0
                ? display.completedFiles > 0
                  ? `${display.completedFiles} uploaded, ${display.failedFiles} failed`
                  : `${display.failedFiles} file${display.failedFiles !== 1 ? "s" : ""} failed to upload`
                : "Upload complete"}
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  minWidth: 0,
                  flex: 1,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text)",
                }}
              >
                <span>Uploading...</span>

                <span
                  style={{
                    color: "var(--muted)",
                    fontWeight: 500,
                  }}
                >
                  {Math.min(display.completedFiles, display.totalFiles)} of{" "}
                  {display.totalFiles} file
                  {display.totalFiles !== 1 ? "s" : ""} (
                  {Math.round(display.overallProgress)}%)
                </span>
              </div>

              <button
                onClick={() => cancelAll()}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: 6,
                  fontFamily: "Inter,sans-serif",
                  transition: "all .15s",
                  flexShrink: 0,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = "#F87171";
                  e.currentTarget.style.background = "rgba(239,68,68,.08)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = "var(--muted)";
                  e.currentTarget.style.background = "none";
                }}
              >
                Cancel
              </button>
            </div>

            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: "rgba(255,255,255,0.07)",
                overflow: "hidden",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${display.overallProgress}%`,
                  background: "var(--primary)",
                  borderRadius: 3,
                  transition: "width 0.5s ease",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                fontSize: 11,
                color: "var(--muted)",
              }}
            >
              <span>
                {formatStorage(display.uploadedBytes)} /{" "}
                {formatStorage(display.totalBytes)}
              </span>
              <span style={{ minWidth: 0, textAlign: "right" }}>
                {speedLabel}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
