import { useEffect, useRef } from "react";
import { TriangleAlert, Calendar, Banknote, HardDrive } from "lucide-react";
import { FREE_STORAGE_BYTES } from "../../config/plans";
import { formatStorage } from "../../utils/directoryUtils";

// Confirms a cancellation with only the consequences that apply to THIS user:
// the end date, that billing stops, and — only if their files won't fit on Free —
// exactly how much will be deleted. Esc closes it; focus starts on the safe choice.
export default function CancelConfirmModal({ endDate, planName, usedBytes = 0, onConfirm, onClose, loading }) {
  const keepRef = useRef(null);
  const overBytes = Math.max(0, usedBytes - FREE_STORAGE_BYTES);
  const when = endDate ? ` (${endDate})` : "";

  useEffect(() => {
    keepRef.current?.focus();
    function onKey(e) {
      if (e.key === "Escape" && !loading) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [loading, onClose]);

  const consequences = [
    {
      icon: Calendar,
      text: `You keep ${planName ?? "your plan"} until your billing period ends${when}.`,
    },
    {
      icon: Banknote,
      text: "You won't be charged again. The current period isn't refunded.",
    },
    overBytes > 0
      ? {
        icon: HardDrive,
        danger: true,
        text: `You're using ${formatStorage(usedBytes)} but Free includes ${formatStorage(FREE_STORAGE_BYTES)}. After that date your oldest files beyond the limit are permanently deleted — free up ${formatStorage(overBytes)} first.`,
      }
      : {
        icon: HardDrive,
        text: `After that you move to the Free plan (${formatStorage(FREE_STORAGE_BYTES)}). Your files fit, so nothing is deleted.`,
      },
  ];

  return (
    <div
      className="ccm-backdrop"
      onClick={() => !loading && onClose()}
    >
      <style>{`
        .ccm-backdrop{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box;animation:ccm-fade .2s ease both}
        .ccm{background:var(--surface-elevated);border:1px solid var(--border);border-radius:18px;padding:24px 20px;max-width:440px;width:100%;max-height:calc(100dvh - 24px);overflow-y:auto;box-sizing:border-box;box-shadow:0 32px 80px var(--shadow-color);animation:ccm-pop .22s ease both}
        .ccm-btn{flex:1;min-width:0;padding:11px 12px;border-radius:10px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .15s,transform .1s,opacity .15s}
        .ccm-btn:active:not(:disabled){transform:scale(.98)}
        .ccm-btn:disabled{cursor:not-allowed;opacity:.7}
        .ccm-keep{background:var(--primary);border:1px solid var(--primary);color:#fff}
        .ccm-keep:hover:not(:disabled){background:var(--primary-hover)}
        .ccm-confirm{background:transparent;border:1px solid rgba(239,68,68,.5);color:var(--status-red-text-strong)}
        .ccm-confirm:hover:not(:disabled){background:rgba(239,68,68,.12)}
        .ccm-btn:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
        .ccm-spin{width:14px;height:14px;border:2px solid rgba(239,68,68,.3);border-top-color:currentColor;border-radius:50%;animation:ccm-rot .8s linear infinite}
        @keyframes ccm-fade{from{opacity:0}to{opacity:1}}
        @keyframes ccm-pop{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}
        @keyframes ccm-rot{to{transform:rotate(360deg)}}
        @media (max-width:420px){.ccm-actions{flex-direction:column-reverse}}
        @media (prefers-reduced-motion:reduce){.ccm,.ccm-backdrop{animation:none}.ccm-spin{animation-duration:2s}}
      `}</style>

      <div
        className="ccm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ccm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11, flexShrink: 0,
            background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--status-red-text-strong)",
          }}>
            <TriangleAlert size={20} aria-hidden="true" />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 id="ccm-title" style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>
              Cancel your plan?
            </h3>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
              Here&apos;s what happens next:
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
          {consequences.map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "flex-start", gap: 10, minWidth: 0,
                borderRadius: 10, padding: "10px 12px",
                background: c.danger ? "rgba(239,68,68,0.08)" : "var(--surface-tint)",
                border: `1px solid ${c.danger ? "rgba(239,68,68,0.3)" : "var(--surface-tint-strong)"}`,
              }}
            >
              <c.icon size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2, color: c.danger ? "var(--status-red-text-strong)" : "var(--muted)" }} />
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, minWidth: 0, overflowWrap: "anywhere", color: c.danger ? "var(--text)" : "var(--muted)" }}>
                {c.text}
              </p>
            </div>
          ))}
        </div>

        <div className="ccm-actions" style={{ display: "flex", gap: 10 }}>
          <button ref={keepRef} type="button" className="ccm-btn ccm-keep" onClick={onClose} disabled={loading}>
            Keep my plan
          </button>
          <button type="button" className="ccm-btn ccm-confirm" onClick={onConfirm} disabled={loading}>
            {loading ? (<><span className="ccm-spin" aria-hidden="true" />Cancelling…</>) : "Cancel plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
